---
title: Angular 大師之路：淺出深入的學習指南
date: 2023-06-28
categories: Dev Tech
author: johch3n611u
tags:
- angular
---

[Angular 大師之路 系列](https://ithelp.ithome.com.tw/users/20020617/ironman/1630)

## NG 大師之路 筆記大綱

day1 大綱 幾乎什麼都講

day2 JSON Schema, Monorepo

day3 Lifecycle：main.ts ( 可以啟動多個根模組 ) => app.module.ts ( 可以啟動多個根元件 ) => app.component.ts 根元件

day4 元件 Lifecycle 除了基本的外差異在 OnChange 與 ng Content 的生命週期，會影響到 @ContentChild, @ContentChildren 的取得與否

day5 NgModule 參數應用、動/靜態載入元件

day6 Feature、Shared、Core Module 、 Ng 6 Service 自動 providedIn root Module

day7 Two Way Binding

day8 自訂表單控制項 / Token：NG_VALUE_ACCESSOR / ControlValueAccessor 

day9 Directive 指令 exportAs

day10 $any

day11

day12

day13

day14

day15

day16

day17

day18

day19

day20

day21

day22

day23

day24

day25

day26

day27

day28

day29

day30

## 無頭組件 使用情境

> 透過 Angular ComponentFactoryResolver 製作無頭組件

1. 動態生成組件
2. 組件化服務
3. 組件化渲染
4. 動態創建指令
5. 動態創建彈出框

### 動態生成組件

在這個範例中，我們在 AppComponent 中創建了一個 MyComponent 組件的實例，並將其添加到畫面上。當用戶點擊 "Create Component" 按鈕時，我們使用 ComponentFactoryResolver 動態創建 MyComponent 組件的實例，並設定其 name 屬性。

```ts
import { Component, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <button (click)="createComponent()">Create Component</button>
    <div #container></div>
  `,
})
export class AppComponent {
  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver) {}

  createComponent() {
    const factory = this.resolver.resolveComponentFactory(MyComponent);
    const componentRef = this.container.createComponent(factory);
    componentRef.instance.name = 'John Doe';
  }
}

@Component({
  selector: 'app-my-component',
  template: `
    <p>Hello, {{ name }}!</p>
  `,
})
export class MyComponent {
  name: string;
}
```

### 組件化服務

在這個範例中，我們創建了一個名為 MyService 的服務，它包含一個 doSomething 方法。我們還創建了一個 MyComponent 組件，它注入了 MyService，並在 ngOnInit 中調用了 doSomething 方法。在 AppComponent 中，我們使用 ComponentFactoryResolver 動態創建了 MyComponent 組件的實例，並將其添加到畫面上。當用戶點擊 "Create Component" 按鈕時，我們動態創建 MyComponent 組件的實例，這個實例包含了 MyService 服務的實例。這樣，我們就可以在組件化的環境中使用服務，實現了服務的組件化。

```ts
import { Injectable, Component, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';

@Injectable()
export class MyService {
  doSomething() {
    console.log('Doing something...');
  }
}

@Component({
  selector: 'app-my-component',
  template: `...`,
})
export class MyComponent {
  constructor(private service: MyService) {}

  ngOnInit() {
    this.service.doSomething();
  }
}

@Component({
  selector: 'app-root',
  template: `
    <button (click)="createComponent()">Create Component</button>
    <div #container></div>
  `,
})
export class AppComponent {
  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver) {}

  createComponent() {
    const factory = this.resolver.resolveComponentFactory(MyComponent);
    const componentRef = this.container.createComponent(factory);
  }
}
```

### 組件化渲染

在這個範例中，我們創建了兩個動態組件 DynamicFormComponent 和 DynamicTableComponent，並在 AppComponent 中動態創建了這兩個組件。我們還在 DynamicTableComponent 中添加了一個 data 屬性，用於設定表格組件的數據源。通過動態生成組件和設定組件的數據源，我們可以靈活地構建 UI 組件，實現高度可配置的 UI 系統。

```ts
import { Component, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-dynamic-form></app-dynamic-form>
    <app-dynamic-table></app-dynamic-table>
  `,
})
export class AppComponent {
  constructor(private resolver: ComponentFactoryResolver, private container: ViewContainerRef) {}

  ngAfterViewInit() {
    // 動態創建表單組件
    const formFactory = this.resolver.resolveComponentFactory(DynamicFormComponent);
    const formRef = this.container.createComponent(formFactory);

    // 動態創建表格組件
    const tableFactory = this.resolver.resolveComponentFactory(DynamicTableComponent);
    const tableRef = this.container.createComponent(tableFactory);

    // 設定表格組件的數據源
    const tableComponent = <DynamicTableComponent>tableRef.instance;
    tableComponent.data = [{ name: 'John Doe', age: 30 }, { name: 'Jane Doe', age: 25 }];
  }
}

@Component({
  selector: 'app-dynamic-form',
  template: `...`,
})
export class DynamicFormComponent {}

@Component({
  selector: 'app-dynamic-table',
  template: `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Age</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of data">
          <td>{{ item.name }}</td>
          <td>{{ item.age }}</td>
        </tr>
      </tbody>
    </table>
  `,
})
export class DynamicTableComponent {
  data: any[];
}
```

### 動態創建指令

在這個範例中，我們創建了一個指令 TooltipDirective，它用於為 DOM 元素添加一個提示框。當用戶將鼠標懸停在元素上時，我們使用 ComponentFactoryResolver 動態創建了一個 TooltipComponent 組件的實例，並將其添加到 DOM 元素上。當用戶將鼠標移開時，我們將提示框從 DOM 中移除。

```ts
import { Directive, ComponentFactoryResolver, ViewContainerRef, ElementRef } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
})
export class TooltipDirective {
  constructor(private resolver: ComponentFactoryResolver, private container: ViewContainerRef, private el: ElementRef) {}

  showTooltip() {
    const factory = this.resolver.resolveComponentFactory(TooltipComponent);
    const componentRef = this.container.createComponent(factory);
    const tooltipElement = componentRef.location.nativeElement;

    tooltipElement.style.position = 'absolute';
    tooltipElement.style.left = this.el.nativeElement.offsetLeft + 'px';
    tooltipElement.style.top = (this.el.nativeElement.offsetTop + this.el.nativeElement.offsetHeight) + 'px';

    this.el.nativeElement.appendChild(tooltipElement);
  }

  hideTooltip() {
    this.container.clear();
  }
}

@Component({
  selector: 'app-tooltip',
  template: `
    <div>
      <div>{{ text }}</div>
      <div *ngIf="showArrow" class="arrow"></div>
    </div>
  `,
})
export class TooltipComponent {
  text: string;
  showArrow: boolean;
}
```

### 動態創建彈出框

在這個範例中，我們創建了一個彈出框 ModalComponent，並在 AppComponent 中動態創建了這個彈出框的實例。我們還通過設定 title 和 message 屬性，設定了彈出框的標題和消息。當用戶點擊 "Close" 按鈕時，我們發出了一個 close 事件，並在 AppComponent 中訂閱了這個事件，在事件觸發時銷毀彈出框的實例。通過動態創建彈出框，我們可以實現更靈活的提示框、確認框等功能。

```ts
import { Component, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <button (click)="showModal()">Show Modal</button>
  `,
})
export class AppComponent {
  constructor(private resolver: ComponentFactoryResolver, private container: ViewContainerRef) {}

  showModal() {
    const factory = this.resolver.resolveComponentFactory(ModalComponent);
    const componentRef = this.container.createComponent(factory);

    componentRef.instance.title = 'Modal Title';
    componentRef.instance.message = 'Modal Message';

    componentRef.instance.close.subscribe(() => {
      componentRef.destroy();
    });
  }
}

@Component({
  selector: 'app-modal',
  template: `
    <div class="modal">
      <div class="modal-content">
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>
        <button (click)="close.next()">Close</button>
      </div>
    </div>
  `,
})
export class ModalComponent {
  title: string;
  message: string;
  close = new EventEmitter<void>();
}
```