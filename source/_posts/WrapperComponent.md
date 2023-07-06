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

曾使用過 Angular 進行開發，使用過二次封裝元件來滿足特定的需求和業務邏輯，

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
  <source src="/assets/img/二次封裝.mp4" type="video/mp4">
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

## 參考

* [NG-ZORRO](https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/components/button/button.component.ts)

