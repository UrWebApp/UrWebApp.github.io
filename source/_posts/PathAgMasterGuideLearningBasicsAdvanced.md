---
title: Angular 大師之路：淺出深入的學習指南
date: 2023-06-28
categories: Dev Tech
author: johch3n611u
authorsWords: 除了一些 NG 原生語法與應用，感覺複雜點還是在設計模式 design pattern、函數式編程 Fn Programing、反應式編程 Rxjs，這些應該在各大框架都是共通的可以多投資點心力在這
tags:
- angular
---

[Angular 大師之路 系列](https://ithelp.ithome.com.tw/users/20020617/ironman/1630)

## NG 大師之路 筆記大綱

> day1 大綱 幾乎什麼都講

> day2 JSON Schema, Monorepo

> day3 Lifecycle：main.ts ( 可以啟動多個根模組 ) => app.module.ts ( 可以啟動多個根元件 ) => app.component.ts 根元件

> day4 元件 Lifecycle 除了基本的外差異在 OnChange 與 ng Content 的生命週期，會影響到 @ContentChild, @ContentChildren 的取得與否

> day5 NgModule 參數應用、動/靜態載入元件

> day6 Feature、Shared、Core Module 、 Ng 6 Service 自動 providedIn root Module

> day7 Two Way Binding

> day8 自訂表單控制項 / Token：NG_VALUE_ACCESSOR / ControlValueAccessor 

> day9 Directive 指令 exportAs

> day10 $any 樣板語法

> day11 *ngIf else 搭配樣板參考變數

```html
<ng-container *ngTemplateOutlet="myTemplate"></ng-container>

<ng-template #myTemplate>
  <h1>Welcome</h1>
  <p>Here is some content</p>
</ng-template>
```

ng-template 是一個標籤，可以在它裡面定義一段 HTML 代碼，但是這段代碼不會直接被渲染出來，而是被當做模板使用，可以在其他地方進行引用和使用。

ng-container 則是一個虛擬元素，它不會產生任何實際的 HTML 元素，只是用來包裹其他元素。

> day12 *ngTemplateOutlet

原文做法利用 Directive 取得 @ViewChildren 但似乎可以同個 #ID 取得 @ViewChildren NG 會自行判斷一個還是多個 QueryList

```html
<ng-template appCarouselPage let-input let-bg="background">
  <span [style.background-color]="bg">Page 1: {{ input | json }}</span>
</ng-template>
<ng-template appCarouselPage let-input let-bg="background">
  <span [style.background-color]="bg">Page 2: {{ input | json }}</span>
</ng-template>
<ng-template appCarouselPage let-input let-bg="background">
  <span [style.background-color]="bg">Page 3: {{ input | json }}</span>
</ng-template>
<!-- $implicit 代表當設定 let-xxxx 時，有個預設傳入的值  -->
<div *ngTemplateOutlet="displayPage; context: {$implicit: {value: 1},background: backgroundColor}"></div>
<button (click)="next()">Next</button>
<button (click)="setBackground()">Set Blue Background</button>
```

```ts
import { Component, QueryList, ViewChildren, AfterViewInit, TemplateRef} from '@angular/core';
import { CarouselPageDirective } from './carousel-page.directive';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent implements AfterViewInit {
  @ViewChildren(CarouselPageDirective) carouselPages: QueryList<CarouselPageDirective> 
  displayPage: TemplateRef<any>;
  index = 0;
  backgroundColor;

  setDisplayPage(index) {
    this.displayPage = this.carouselPages.find((item, index) => index === this.index).templateRef;
  }

  ngAfterViewInit() {
    this.setDisplayPage(this.index);
  }

  next() {
    this.index = (this.index + 1) % this.carouselPages.length;
    this.setDisplayPage(this.index);
  }

  setBackground() {
    if(this.backgroundColor) {
      this.backgroundColor = '';
    } else {
      this.backgroundColor = 'red';
    }
  }
}
```

方便用 @ViewChildren 取得 `<ng-template>`

```ts
import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appCarouselPage]'
})
export class CarouselPageDirective {
    // @Optional 是 Angular 中的一個依賴注入（Dependency Injection）的裝飾器，可以用來標記一個依賴對象為可選的。
    // 讓此指令有機會同時掛在純元素與 Template 上
    constructor(
        @Optional() private elementRef: ElementRef<any>,
        @Optional() private templateRef: TemplateRef<any>,
        @Optional() private viewContainerRef: ViewContainerRef,
    ) { 
        console.log('viewContainerRef',this.vewContainerRef.element);
        console.log('templateRef',this.templateRef.elementRef);
        console.log('elementRef',this.elementRef);

        if(templateRef){
            // 針對 template 處理
        } else {
            // 針對 element 處理
        }
    }
}
```

> day13 ng-container 不會產生元素標籤

1. *ngIf 和 *ngFor 同時需要使用
2. 避免需要改 CSS 選擇器

> day14 動態載入元件 (簡易版) *ngComponentOutlet / Entry components

情境：當樣板上要呈現不同元件時，容易不小心把樣板程式碼弄髒時

```ts
// <input type="radio" id="formA" name="form" value="A" [(ngModel)]="chooseForm">
// <label for="formA">表單A</label>
// <input type="radio" id="formB" name="form" value="B" [(ngModel)]="chooseForm">
// <label for="formB">表單B</label>
// <input type="radio" id="formC" name="form" value="C" [(ngModel)]="chooseForm">
// <label for="formC">表單C</label>

// <ng-container *ngIf="chooseForm === 'A'">
//   <app-component-a></app-component-a>
// </ng-container>
// <ng-container *ngIf="chooseForm === 'B'">
//   <app-component-b></app-component-b>
// </ng-container>
// <ng-container *ngIf="chooseForm === 'C'">
//   <app-component-c></app-component-c>
// </ng-container>

<ng-container *ngComponentOutlet="mapping.get(chooseForm)"></ng-container>

chooseForm = 'A';
mapping = new Map<string, any>(
  [
    ['A', ComponentAComponent],
    ['B', ComponentBComponent],
    ['C', ComponentCComponent],
  ]
);
```

> day15 動態載入元件 (複雜版) ViewContainerRef / createEmbeddedView / ComponentFactoryResolver [請參考無頭組件應用](#無頭組件-使用情境)

* ViewContainerRef：表示一個視圖容器，可以用來創建、插入和移除動態組件。通過 ViewContainerRef，可以動態創建一個子視圖並將其插入到容器中。例如，可以通過 ViewContainerRef.createComponent 方法動態創建一個組件，然後通過 ViewContainerRef.insert 方法將它插入到容器中。ViewContainerRef 可以在組件中通過 @ViewChild 或 @ViewChildren 裝飾器進行注入。
* ElementRef：表示一個 DOM 元素的引用，可以用來操作和訪問該元素的屬性和方法。通過 ElementRef.nativeElement 屬性可以獲取到該元素的 DOM 對象。例如，可以使用 ElementRef.nativeElement.style 屬性來設置元素的樣式。ElementRef 可以在組件中通過 @ViewChild 或 @ViewChildren 裝飾器進行注入。
* TemplateRef：表示一個模板的引用，可以用來動態創建和渲染模板。通過 TemplateRef.createEmbeddedView 方法可以動態創建一個嵌入式視圖（Embedded View），然後使用 ViewContainerRef.createEmbeddedView 方法將其插入到視圖容器中。TemplateRef 通常用於實現可重複使用的組件或動態生成模板的場景。TemplateRef 可以在組件中通過 @ViewChild 或 @ContentChild 裝飾器進行注入。

> [day16 Customized Structural ( *data="data; xxx: { value: xxx }" ) / Attribute ( [data]="data" let-xxx ) Directive](https://ithelp.ithome.com.tw/articles/10207012)

```ts
import { Directive, EmbeddedViewRef, ViewContainerRef, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appTemplateOutlet]'
})
export class TemplateOutletDirective {
  private _viewRef: EmbeddedViewRef<any>;
  @Input() appTemplateOutletData;

  @Input() set appTemplateOutlet(template: TemplateRef<any>) {
    this.viewContainerRef.clear();
    this._viewRef = this.viewContainerRef.createEmbeddedView(template);
    this._viewRef.context['data'] = this.appTemplateOutletData;
  };

  constructor(private viewContainerRef: ViewContainerRef) { }
}
```

> day17 HTTP_INTERCEPTORS 攔截 Http Request / HttpHandler

> day18 ErrorHandler 集中處理錯誤

> day19 APP_INITIALIZER 在程式運行早期處理資料

> day20 @NgModule providers useClass useExisting

> day21 @NgModule providers useValue useFactory

```ts
const dataServiceFactory = (configService: ConfigService) => {
  if (configService.admin) {
    return new AdminService();
  } else {
    return new DataService();
  }
}
```

> day22 注入 Token 實體方法 ( 建構式注入 / Injector 物件 / @Component 、 @Directive providers )

> day23 InjectionToken 強制產生 Token / @Inject()

```TS
import { InjectionToken } from '@angular/core';

export interface Config {
  LogLevel: string
}

export const CONFIG_TOKEN = new InjectionToken<Config>('config token',
  {
    providedIn: 'root',
    factory: () => ({
      LogLevel: 'Error'
    })
  }
);
export const NAME_TOKEN = new InjectionToken<string>('name token');

@NgModule({
  providers: [
    {
      provide: CONFIG_TOKEN,
      useValue: { LogLevel: 'Error' }
    },
    {
      provide: NAME_TOKEN,
      useValue: 'Mike'
    }
  ]
})
export class AppModule { }
```
 
> day24 NgZone 得知所有非同步事件的發生，確認何時要進行變更偵測的工具。 onUnstable / onStable / runOutsideAngular / run

* 避免發生變更偵測效能耗損
* 脫離變更偵測整合第三方套件
* 與 DOM 操作有關的再透過 run 讓程式回變更偵測

> day25 ChangeDetectorRef 每個元件獨立控制變更偵測時機效能調校。 detach / reattach / detectChanges

> day26 元件的變更偵測策略 ( 關閉自動偵測、手動打開 ) changeDetection / ChangeDetectorRef / markForCheck

> day27 AsyncPipe 技巧 as / Rxjs Operator shareReplay

`<li *ngFor="let todo of todos$ | async">{{ todo.title }}</li>`

* 在開發習慣中，我們會在變數後面加上一個 $ 符號，代表他是一個 observable。
* 自動處理 Promise，不過在 Angular 中還是使用 RxJS 居多
* 自動管理變更偵測，較不會消耗效能
* 類延遲載入

```TS
<ng-container *ngIf="todos$ | async as todos; else loading">
  <ul>
    <!-- 在內部就不需要使用 todos$ | async，而是使用 as 後面的 todos 區域變數 -->
    <li *ngFor="let todo of todos">{{ todo.title }}</li>
  </ul>
</ng-container>
```

shareReplay 若希望只有第一次要顯示時呼叫就好，保留最近 N 次內容，預設會先「重播」最新 N 次的紀錄

> day28 AsyncPipe 進階技巧

* 自動退訂
* 自動要求變更偵測

> day29 RxJS operators 基礎篇

1. map 將一個訂閱可以得到的資料轉換成另外一筆資料
   * 情境：
   * pipe 鏈式中資料轉換到下一層只留新的整理後的格式
   * 有一個元件需要帶入一個陣列，當作選單資料來源，而在從網路取得資料後，希望能加入一筆預設值
2. tap 什麼都不影響，類似中間層，可以在那個時間段做某些事
   * 情境：
   * console.log
   * 資料給定
3. switchMap 有順序收到 observable 資料轉換成另外一個 observable / concatMap / mergeMap / exhaustMap
   * 情境：
   * 路由內容(observable)變更時，再去 API 請求(observable)資料
   * 一系列有前後順序必要的 observable

```ts
constructor(private route: ActivatedRoute, private httpClient: HttpClient) { }

ngOnInit() {
  this.route.params.subscribe(params => {
    // 以下這段也是個 observable，這時就會面臨到巢狀 ob 包 ob 的冏境
    // this.httpClient
    //   .get(`.../post/${params['id']}`)
    //     .subscribe(post => {
    //       this.post = post;
    // })
  });

  this.route.params.pipe(
    switchMap(params => this.httpClient.get(`.../post/${params['id']}`))
  );

  // 更複雜的應用
  this.postData$ = this.route.params.pipe(
    switchMap(params => this.httpClient
      .get(`.../post/${params['id']}`).pipe(
        map(post => ({ id: params['id'], post: post }))
    )),
    switchMap(post => this.httpClient
      .get(`.../comments/${post.id}`).pipe(
        map(comments => Object.assign(post, { comments: comments }))
    ))
  );
}
```

4. combineLatest 沒有順序平行處理 observable 所有 observable 有資料後才進行後續處理
   * 情境：
   * 包含搜尋、排序和分頁的資料，我們可以將搜尋、排序和分頁都設計成單一個 observable，在使用 combineLatest 產生搜尋結果
   * startWith 在程式一開始就給空的資料來產生搜尋結果，確保 observable 可以有起始的資料

```ts
const posts$ = this.httpClient.get('.../posts');
const tags$ = this.httpClient.get('.../tags');

this.data$ = combineLatest(posts$, tags$).pipe(
  map(([posts, tags]) => ({posts: posts, tags: tags}))
)
```

```ts
this.products$ = combineLatest(
  this.filterChange$.pipe(startWith('')),
  this.sortChange$.pipe(startWith({})),
  this.pageChange$.pipe(startWith({}))
)
.pipe(
  exhaustMap(([keyword, sort, page]) =>
    this.httpClient
      .post(`.../products`, { keyword: keyword, sort: sort, page: page}))
);
```

5. forkJoin 在所有 observable 都完成 ( complete ) 後，才會取得最終的結果
   * 情境：
   * Http Request 的整合

```ts
const posts$ = this.httpClient.get('.../posts');
const tags$ = this.httpClient.get('.../tags');

this.data$ = forkJoin(posts$, tags$).pipe(
  map(([posts, tags]) => ({posts: posts, tags: tags}))
)
```

> day30 RxJS operators 進階應用

5. debounceTime 緩衝設定一個時間(毫秒)只要還有新資料傳入暫時忽視，直到沒有更新後才傳給下一個 operators
   * 情境：
   * 輸入完後自動搜尋資料，而不用再去按個按鈕，但資料變更的瞬間，就發出一次 API 呼叫，對伺服器的 loading 會太重

```ts
data$ = this.searchControl.valueChanges.pipe(
  debounceTime(300), // 當 300 毫秒沒有新資料時，才進行搜尋
  switchMap(keyword => this.httpClient.get(`.../?q=${keyword}`))
);
```

6. distinctUntilChanged 在上一次資料與這次資料相同時，主動忽略變更
   * 情境：
   * 重複的關鍵字搜尋

```ts
data$ = this.searchControl.valueChanges.pipe(
  debounceTime(300), // 當 300 毫秒沒有新資料時，才進行搜尋
  distinctUntilChanged(), // 當「內容真正有變更」時，才進行搜尋
  switchMap(keyword => this.httpClient.get(`.../?q=${keyword}`))
);
```

7. scan 上述 debounceTime 是用時間卡控，這個是用次數卡控，也可參考以下 filter operators

[How can I determine the number of values has been emitted during the debounce time?](https://stackoverflow.com/questions/71873411/how-can-i-determine-the-number-of-values-has-been-emitted-during-the-debounce-ti)

```ts
export const debounceCounter =
  (dueTime: number): MonoTypeOperatorFunction<number> =>
  (source: Observable<unknown>): Observable<number> =>
    new Observable(observer =>
      source
        .pipe(
          scan(acc => acc + 1, 0),
          debounceTime(dueTime),
          startWith(0),
          pairwise(),
          map(([previous, current]) => current - previous),
        )
        .subscribe({
          next: x => {
            observer.next(x);
          },
          error: err => {
            observer.error(err);
          },
          complete: () => {
            observer.complete();
          },
        }),
    );
```

8. filter 過濾資料用的

```ts
data$ = this.searchControl.valueChanges.pipe(
  debounceTime(300), // 當 300 毫秒沒有新資料時，才進行搜尋
  distinctUntilChanged(), // 當「內容真正有變更」時，才進行搜尋
  filter(keyword => keyword.length >= 3), // 當關鍵字大於 3 個字時，才搜尋
  switchMap(keyword => this.httpClient.get(`.../?q=${keyword}`))
);
```

9. Subject 搭配 service 跨元件傳遞資料
   * 單純使用 Subject 時，最大的問題是在訂閱時若沒有發生任何的 next() 呼叫，會完全收不到過去的資料，可以透過下兩個 operators

```ts
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private _message = ['hello', 'world'];

  messages$ = new Subject();

  constructor() {
    this.messages$.next(this._message);
  }

  addMessage(message) {
    this._message = [...this._message, message];
    this.messages$.next(this._message);
  }
}
```

10. BehaviorSubject 可以在資料被訂閱前，給予初始資料，任何 next 發生前執行 subscribe() 都會得到初始資料
11. ReplaySubject 會記錄所有呼叫 next() 變更的資料，在被 subscribe() 時，重新播放所有紀錄( 可設定紀錄最近的 N 筆 )
13. AsyncSubject 只有在 complete() 方法被呼叫時，才能訂閱到「最後一次 next() 的資料」
14. observable 錯誤處理 catchError 攔截發生的錯誤，並回傳另外一個 observable，讓整個 observable 可以順利繼續運作
    * 情境：
    * 一般的 error 只要任一個 operator 內發生錯誤，整個 observable 都會錯誤並結束
    * 使用 AsyncPipe 時，幾乎不會再有 subscribe();
```ts
// subject.subscribe(
//   data => {
//     console.log(`Sub2 => ${data}`);
//   },
//   error => {
//     console.log('error', error)
//   }
// );

this.httpClient.get(`.../posts`).pipe(
  catchError(error => {
    console.log(error);
    return of([]);
  })
);
```

15. observable 錯誤處理 throwError 希望錯誤時就整個中斷，或是主動拋出錯誤

```ts
this.httpClient.get(`.../posts`).pipe(
  tap(data => {
    if(data.length === 0) {
      // 主動丟出錯誤
      throwError('no data')
    }   
  }),
  catchError(error => {
    console.log(error);
    return of([]);
  })
);
```

16. try ... catch ... finally => finalize 最後一定會執行的程式

```ts
this.isLoading = true; // 進入讀取中狀態
this.httpClient.get(`.../posts`).pipe(
  finalize(() => {
    // 不管中間程式遇到任何錯誤，一定會進入 finalize 裡面
	this.isLoading = false;        
  })
);
```

## 無頭組件 使用情境

> 透過 Angular ComponentFactoryResolver 製作無頭組件 / Component 需註冊 AppModule entryComponents

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