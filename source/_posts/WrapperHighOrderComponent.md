---
title: 二次封裝實現自己的函式庫：Angular
date: 2023-07-05
categories: Dev Tech
author: johch3n611u
tags:
- JavaScript
- Angular
# authorsWords: 前端除了動畫以外真的還有好多可以深入的地方...
---

曾使用過 Angular 進行開發，使用過二次封裝元件 HOC 來滿足特定的需求和業務邏輯，

我發現以往的做法往往只是針對特定情境封裝了較為死板的二次封裝元件，導致在遇到需求不符或需要修改代碼時，很難進行有效的維護和改進，

有時候，甚至會出現時間久了或開發者離開後，沒有留下文檔的情況，這就讓業務方不得不接受一些奇怪的現象，

改善這種情況非常必要，在本篇文章中將探討如何改善這種情況，包括 Angular 二次封裝元件的注意點、封裝方式，以及一些可能遇到的技術屏障。

## 二次封裝

「二次封裝」在所有的程式語言中，我們都要遵守 DRY ( Don't repeat yourself ) 的原則，不僅適用於機器語言的 0 和 1，也適用於高階語言中的 toString 等等操作，開發人員可以使用高階元件（Higher-order Component, HOC）的原理來封裝現有的元件，以提供額外的功能或更簡單的介面。

在前端開發中，各種 UI 元件庫都是將原生元素進行第一層封裝，例如 W3C 並沒有提供 `<my-search />` 元素，因此 UI 元件庫開發者使用 input、button、div 等原生元素，並根據 Search 功能的設計進行封裝。然而，當我們拿到這些元件時，它們可能不符合業務需求，因此我們需要對它們進行二次封裝，例如使用 `<my-search> + <autocomplete />` 進行封裝。

然而，如果我們在 `<my-search style="color:red;" onclick"click()"/>` 元件中考慮不周，沒有考慮到需要增加 `change()` 事件，那麼我們就需要去修改父層組件，這樣就不符合 OCP 開放/封閉原則，也會導致程式碼難以維護、擴展性差、程式碼重複等問題。

因此我們需要理解框架能否針對這些問題提供解決方案

## Vue 二次封裝範例

<video width="300" height="360" controls>
  <source src="/assets/img/hexo/二次封裝.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

[[渡一] UI组件的二次封装](https://v.douyin.com/ijV7uPm/)

父組件

```html
<template>
  <div>
    <MyInput ref="inputRef" v-model="data: placeholder=" address">
      <template #prepend>
        <el-select placeholder="Select" style="width:115px">
          <el-option label="aaa" value="1" />
          <el-option label="bbb" value="2" />
        </el-select>
      </template>
      <template #append>
        <el-button :icon="Search" />
      </template>
    </MyInput>
  </div>
</template>
<script setup>
  import {
    onMounted,
    ref
  } from 'vue';
  import MyInput from './Components/MyInput.vue'
  const data = ref('')
</script>
```

子組件

```html
<template>
  <div class="my-input">
    <el-input ref="inp" v-bind="$attrs">
      <template v-for="(value, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData || {}"></slot>
      </template>
    </el-input>
  </div>
</template>
<script>
  export default {
    mounted() {
      const entries = Object.entries(this.$refs.inp)
      for (const [key, value] of entries) {
        this[key] = value;
      }
    }
  }
</script>
```

## 需要遵守的原則

以 Vue 與 React 來說提供了蠻多方便組織二次組件屬性與方法，但在 Angular 檢查了一些社群熱度高的組件庫似乎看不到什麼二次封裝的好方法

以 [nebular card](https://github.com/akveo/nebular/blob/master/src/framework/theme/components/card/card.component.ts) 來看，內部就封裝了多個 @HostBinding

[学会正确地二次封装组件，让同事抱着你的大腿喊大神！](https://juejin.cn/post/7105009142242213925)

1. 能夠封裝 UI 樣式、業務邏輯和補充功能
2. 開放/封閉原則：組件必須暴露所有的屬性、事件、插槽和方法，以避免多次修改
   * vue 透過以下屬性與方法進行二次封裝
   * 屬性 $attrs、事件 $listeners、插槽 slots scopedSlots、方法 $refs
3. 單向資訊流原則：明確哪些是 props，不要修改 props 的資料
4. 單一職責原則：不要封裝資料的接口，應該由父組件請求後注入與業務邏輯解偶
5. 載體分離原則：將內容和載體分離，例如說表單元件應該與彈窗元件分離而不是耦合
6. 實現雙向綁定，簡化事件處理
7. 利用深度選擇器修改組件庫的樣式 /deep/

[Angular Library Repo](https://github.com/UrWebApp/ComponentLibrary/tree/master/AngularLibrary)

Vue、React 是將子組件包裝成 HOC ，但 NG 希望從父層定義，子組件只需要搭配使用，直接用指令當站位符號，渲染就好

## 注入物件

### ViewContainerRef：表示一個視圖容器，可以用來創建、插入和移除動態組件。

通過 ViewContainerRef，可以動態創建一個子視圖並將其插入到容器中。例如，可以通過 ViewContainerRef.createComponent 方法動態創建一個組件，然後通過 ViewContainerRef.insert 方法將它插入到容器中。ViewContainerRef 可以在組件中通過 @ViewChild 或 @ViewChildren 裝飾器進行注入。

### ElementRef：表示一個 DOM 元素的引用，可以用來操作和訪問該元素的屬性和方法。

通過 ElementRef.nativeElement 屬性可以獲取到該元素的 DOM 對象。例如，可以使用 ElementRef.nativeElement.style 屬性來設置元素的樣式。ElementRef 可以在組件中通過 @ViewChild 或 @ViewChildren 裝飾器進行注入。

### TemplateRef：表示一個模板的引用，可以用來動態創建和渲染模板。

通過 TemplateRef.createEmbeddedView 方法可以動態創建一個嵌入式視圖（Embedded View），然後使用 ViewContainerRef.createEmbeddedView 方法將其插入到視圖容器中。TemplateRef 通常用於實現可重複使用的組件或動態生成模板的場景。TemplateRef 可以在組件中通過 @ViewChild 或 @ContentChild 裝飾器進行注入。

## 指令

### ng-container 指令是一個空容器，用於包裹其他指令或元素，而不會在渲染時創建額外的 DOM 元素。

```html
<ng-container *ngIf="show">
  <h1>Hello, {{ name }}!</h1>
</ng-container>
```

它通常用於條件渲染、循環渲染和結構指令中，以幫助我們組織模板的結構並減少 DOM 元素的數量。

### ng-template 指令是一個模板容器，用於定義可重用的模板內容。

```html
<ng-container *ngIf="show; else myTemplate">
  <h1>Hello, {{ name }}!</h1>
</ng-container>

<ng-template #myTemplate>
  <h1>Goodbye, {{ name }}!</h1>
</ng-template>
```

它通常與結構指令（如 ngIf 和 ngFor）一起使用，以定義模板的結構和內容。模板可以包含 HTML 元素、元件、其他指令等，可以通過 TemplateRef 類型的引用在元件中引用和渲染。

### ng-content 指令是一個投影容器 ( 只適用於靜態投影 )，用於在元件的模板中插入外部內容。 ( Content projection )

[Support for Dynamic Content Projection](https://github.com/angular/angular/issues/8563)

```html
<my-component>
  <h2 header>Header</h2>
  <p>Content</p>
  <p footer>Footer</p>
</my-component>

<!-- inside my-component -->
<ng-content select="[header]"></ng-content>
<ng-content></ng-content>
<ng-content select="[footer]"></ng-content>
<!-- typescript
@ContentChild('header') header: any;
@ContentChild('footer') footer: any; 
-->
```

它通常與 ng-template 指令一起使用，以定義可插入的內容，並使用 selector 屬性來指定投影內容的選擇器。投影內容可以是 HTML 元素、元件、其他指令等，可以通過 ContentChild 和 ContentChildren 裝飾器在元件中引用和渲染。

### ngTemplateOutlet 是一个指令，它允许我们在组件模板中引用另一个组件或指令的模板。

它接受一个模板引用作为输入，并将其插入到当前组件的视图中。例如，我们可以使用以下代码片段将另一个组件的模板插入到当前组件的模板中

```html
<ng-container *ngTemplateOutlet="myTemplate" *ngIf="myTemplate else default"></ng-container>
<ng-template #default></ng-template>
<!-- 如果沒有傳入則顯示預設 -->
```

### ngOutletContext 是一个用于在插入模板时提供上下文变量的属性。

例如，我们可以使用以下代码片段将上下文变量传递给被引用模板

```html
<ng-container *ngTemplateOutlet="myTemplate; context: myContext"></ng-container>
<!-- or -->
<ng-container [ngTemplateOutlet]="templ" [ngOutletContext]="{context: myContext}"></ng-container>
```

### router-outlet 指令是一個路由容器，用於在元件的模板中顯示路由器加載的元件。

它通常在根元件或其它元件的模板中使用，以顯示路由器加載的元件。當路由器導航到一個新的路由時，它會在 router-outlet 中加載該路由對應的元件，並替換掉之前的元件。

```html
<div>
  <ng-container *ngIf="show">
    <ng-template #myTemplate>
      <h1 my-content>Hello, {{ name }}!</h1>
    </ng-template>
    <ng-content select="[my-content]"></ng-content>
  </ng-container>
  <router-outlet></router-outlet>
</div>
```

## 參考

* [spartacus slot](https://github.com/SAP/spartacus/blob/6d5b7ba81af466df34c1537f7e8c5c0ddc7ffc0d/projects/storefrontlib/cms-structure/page/slot/page-slot.service.ts)
* [NG-ZORRO](https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/components/button/button.component.ts)
* [How I can get the slot name in which the component is rendered](https://stackoverflow.com/questions/66137440/how-i-can-get-the-slot-name-in-which-the-component-is-rendered)
* [How to pass html element as child in Angular Higher Order Components (HOC)?](https://stackoverflow.com/questions/62322629/how-to-pass-html-element-as-child-in-angular-higher-order-components-hoc)
* [ng-content select bound variable](https://stackoverflow.com/questions/37225722/ng-content-select-bound-variable)
  * ngContent is only for static projection, so you can't use it to do any bindings. If you need bindings in your projected content you can use ngTemplateOutlet and ngOutletContext.
  * [Support for Dynamic Content Projection #8563](https://github.com/angular/angular/issues/8563)
  * [Support for dynamic content projection #855](https://github.com/angulardart/angular/issues/855)
  * [dynamic-component-loader](https://angular.io/guide/dynamic-component-loader)
  * [dynamic-component-loader demo](https://stackblitz.com/run?file=src%2Fapp%2Fhero-profile.component.ts)
  * [Angular 9：可投影節點改變位置 #35357](https://github.com/angular/angular/issues/35357)
  * [Angular 9：可投影節點改變位置 #35357 demo](https://stackblitz.com/edit/angular-ivy-rc4ebf?file=src%2Fapp%2Fapp.component.ts)
  * [NgTemplateOutlet 提供必要的資料就可以了，樣式、排版這些自由交給使用者](https://www.tw511.com/a/01/39236.html)
