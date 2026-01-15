---
title: Angular マスターへの道：基礎から応用までの学習ガイド
date: 2023-06-28
categories: Development
author: johch3n611u
authorsWords: NG のネイティブな構文やアプリケーションに加えて、デザインパターン、関数型プログラミング、Rxjs リアクティブプログラミングなどは、主要なフレームワークで共通しているため、これらにもっと力を入れる価値があると感じています。
tags:
  - Angular
---

[Angular マスターへの道 シリーズ](https://ithelp.ithome.com.tw/users/20020617/ironman/1630)

## NG マスターへの道 ノート概要

### day1 概要 ほぼすべてを網羅

### day2 JSON Schema, Monorepo

### day3 ライフサイクル：main.ts ( 複数のルートモジュールを起動可能 ) => app.module.ts ( 複数のルートコンポーネントを起動可能 ) => app.component.ts ルートコンポーネント

### day4 コンポーネントライフサイクル 基本的なもの以外に、OnChange と ng Content のライフサイクルの違いがあり、@ContentChild, @ContentChildren が取得できるかどうかに影響する

### day5 NgModule パラメータ応用、コンポーネントの動的/静的読み込み

### day6 Feature、Shared、Core Module 、 Ng 6 Service 自動 providedIn root Module

### day7 双方向バインディング (Two Way Binding)

### day8 カスタムフォームコントロール / Token：NG_VALUE_ACCESSOR / ControlValueAccessor

### day9 Directive 指令 exportAs

### day10 $any テンプレート構文

### day11 \*ngIf else とテンプレート参照変数の組み合わせ

```html
<ng-container *ngTemplateOutlet="myTemplate"></ng-container>

<ng-template #myTemplate>
  <h1>Welcome</h1>
  <p>Here is some content</p>
</ng-template>
```

ng-template はタグであり、その中に HTML コードを定義できますが、このコードは直接レンダリングされず、テンプレートとして使用され、他の場所で参照および使用できます。

ng-container は仮想要素であり、実際の HTML 要素を生成せず、他の要素をラップするために使用されます。

### day12 \*ngTemplateOutlet

元の方法は Directive を使用して @ViewChildren を取得していましたが、同じ #ID で @ViewChildren を取得できるようです。NG は 1 つの QueryList か複数かを自動的に判断します。

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
<!-- $implicit は、let-xxxx が設定されている場合にデフォルトの渡される値があることを意味します -->
<div *ngTemplateOutlet="displayPage; context: {$implicit: {value: 1},background: backgroundColor}"></div>
<button (click)="next()">Next</button>
<button (click)="setBackground()">Set Blue Background</button>
```

```ts
import { Component, QueryList, ViewChildren, AfterViewInit, TemplateRef } from "@angular/core";
import { CarouselPageDirective } from "./carousel-page.directive";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements AfterViewInit {
  @ViewChildren(CarouselPageDirective) carouselPages: QueryList<CarouselPageDirective>;
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
    if (this.backgroundColor) {
      this.backgroundColor = "";
    } else {
      this.backgroundColor = "red";
    }
  }
}
```

@ViewChildren を使用して `<ng-template>` を取得すると便利です

```ts
import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: "[appCarouselPage]",
})
export class CarouselPageDirective {
  // @Optional は Angular の依存性注入（Dependency Injection）デコレーターであり、依存オブジェクトをオプションとしてマークするために使用できます。
  // このディレクティブを純粋な要素とテンプレートの両方にアタッチできるようにします
  constructor(@Optional() private elementRef: ElementRef<any>, @Optional() private templateRef: TemplateRef<any>, @Optional() private viewContainerRef: ViewContainerRef) {
    console.log("viewContainerRef", this.vewContainerRef.element);
    console.log("templateRef", this.templateRef.elementRef);
    console.log("elementRef", this.elementRef);

    if (templateRef) {
      // テンプレートに対する処理
    } else {
      // 要素に対する処理
    }
  }
}
```

### day13 ng-container 要素タグを生成しない

1. *ngIf と *ngFor を同時に使用する必要がある場合
2. CSS セレクタを変更する必要を避ける

### day14 コンポーネントの動的読み込み (簡易版) \*ngComponentOutlet / Entry components

シナリオ：テンプレートに異なるコンポーネントを表示する場合、テンプレートコードが汚れやすくなる

```ts
// <input type="radio" id="formA" name="form" value="A" [(ngModel)]="chooseForm">
// <label for="formA">フォームA</label>
// <input type="radio" id="formB" name="form" value="B" [(ngModel)]="chooseForm">
// <label for="formB">フォームB</label>
// <input type="radio" id="formC" name="form" value="C" [(ngModel)]="chooseForm">
// <label for="formC">フォームC</label>

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

### day15 コンポーネントの動的読み込み (複雑版) ViewContainerRef / createEmbeddedView / ComponentFactoryResolver [ヘッドレスコンポーネントの使用シナリオを参照](#ヘッドレスコンポーネントの使用シナリオ)

- ViewContainerRef：動的コンポーネントを作成、挿入、および削除するために使用できるビューコンテナを表します。ViewContainerRef を介して、子ビューを動的に作成し、コンテナに挿入できます。たとえば、ViewContainerRef.createComponent メソッドを使用してコンポーネントを動的に作成し、ViewContainerRef.insert メソッドを使用してコンテナに挿入できます。ViewContainerRef は、@ViewChild または @ViewChildren デコレーターを介してコンポーネントに注入できます。
- ElementRef：DOM 要素への参照を表し、その要素の属性やメソッドを操作およびアクセスするために使用できます。ElementRef.nativeElement プロパティを介して、その要素の DOM オブジェクトを取得できます。たとえば、ElementRef.nativeElement.style プロパティを使用して要素のスタイルを設定できます。ElementRef は、@ViewChild または @ViewChildren デコレーターを介してコンポーネントに注入できます。
- TemplateRef：テンプレートへの参照を表し、テンプレートを動的に作成およびレンダリングするために使用できます。TemplateRef.createEmbeddedView メソッドを介して埋め込みビュー（Embedded View）を動的に作成し、ViewContainerRef.createEmbeddedView メソッドを使用してビューコンテナに挿入できます。TemplateRef は通常、再利用可能なコンポーネントを実装したり、テンプレートを動的に生成したりするシナリオで使用されます。TemplateRef は、@ViewChild または @ContentChild デコレーターを介してコンポーネントに注入できます。

### day16 カスタムディレクティブ (Customized Directive) [Structural ( \*data="data; xxx: { value: xxx }" ) / Attribute ( [data]="data" let-xxx ) Directive](https://ithelp.ithome.com.tw/articles/10207012)

```ts
import { Directive, EmbeddedViewRef, ViewContainerRef, Input, TemplateRef } from "@angular/core";

@Directive({
  selector: "[appTemplateOutlet]",
})
export class TemplateOutletDirective {
  private _viewRef: EmbeddedViewRef<any>;
  @Input() appTemplateOutletData;

  @Input() set appTemplateOutlet(template: TemplateRef<any>) {
    this.viewContainerRef.clear();
    this._viewRef = this.viewContainerRef.createEmbeddedView(template);
    this._viewRef.context["data"] = this.appTemplateOutletData;
  }

  constructor(private viewContainerRef: ViewContainerRef) {}
}
```

### day17 HTTP_INTERCEPTORS Http Request のインターセプト / HttpHandler

### day18 ErrorHandler エラーの集中処理

### day19 APP_INITIALIZER プログラム実行の初期段階でのデータ処理

### day20 @NgModule providers useClass useExisting

### day21 @NgModule providers useValue useFactory

```ts
const dataServiceFactory = (configService: ConfigService) => {
  if (configService.admin) {
    return new AdminService();
  } else {
    return new DataService();
  }
};
```

### day22 Token 実体の注入方法 ( コンストラクタ注入 / Injector オブジェクト / @Component 、 @Directive providers )

### day23 InjectionToken トークンの強制生成 / @Inject()

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

### day24 NgZone すべての非同期イベントの発生を知り、変更検知をいつ実行するかを確認するためのツール。 onUnstable / onStable / runOutsideAngular / run

- 変更検知によるパフォーマンスの低下を避ける
- 変更検知から外れてサードパーティパッケージを統合する
- DOM 操作に関連するものを run を介して変更検知に戻す

### day25 ChangeDetectorRef 各コンポーネントの変更検知タイミングを個別に制御し、パフォーマンスを調整。 detach / reattach / detectChanges

### day26 コンポーネントの変更検知戦略 ( 自動検知をオフ、手動でオン ) changeDetection / ChangeDetectorRef / markForCheck

### day27 AsyncPipe テクニック as / Rxjs Operator shareReplay

`<li *ngFor="let todo of todos$ | async">{{ todo.title }}</li>`

- 開発の習慣として、変数の後ろに $ 記号を付けて、それが observable であることを表します。
- Promise を自動的に処理しますが、Angular では RxJS が多く使用されます。
- 変更検知を自動的に管理し、パフォーマンスをあまり消費しません。
- 疑似遅延読み込み。

```TS
<ng-container *ngIf="todos$ | async as todos; else loading">
  <ul>
    <!-- 内部では todos$ | async を使用する必要はなく、as の後の todos ローカル変数を使用します -->
    <li *ngFor="let todo of todos">{{ todo.title }}</li>
  </ul>
</ng-container>
```

shareReplay：最初に表示するときだけ呼び出したい場合、最近の N 回の内容を保持し、デフォルトでは最新の N 回の記録を「リプレイ」します。

### day28 AsyncPipe 高度なテクニック

- 自動登録解除
- 変更検知の自動要求

### day29 RxJS operators 基礎編

1. map：購読から得られるデータを別のデータに変換します
   - シナリオ：
   - pipe チェーン内のデータ変換で、次の層には整理された新しい形式のみを残す
   - コンポーネントが配列をメニューデータソースとして取り込む必要があり、ネットワークからデータを取得した後、デフォルト値を追加したい場合
2. tap：何にも影響を与えず、ミドルウェアのようにその時間帯に何かを行うことができます
   - シナリオ：
   - console.log
   - データの割り当て
3. switchMap：順序を持って observable データを受け取り、別の observable に変換 / concatMap / mergeMap / exhaustMap
   - シナリオ：
   - ルートの内容 (observable) が変更されたときに、API リクエスト (observable) データを再度取得する
   - 前後の順序が必要な一連の observable

```ts
constructor(private route: ActivatedRoute, private httpClient: HttpClient) { }

ngOnInit() {
  this.route.params.subscribe(params => {
    // 以下の部分も observable であり、ob が ob を包むという入れ子の状況に直面します
    // this.httpClient
    //   .get(`.../post/${params['id']}`)
    //     .subscribe(post => {
    //       this.post = post;
    // })
  });

  this.route.params.pipe(
    switchMap(params => this.httpClient.get(`.../post/${params['id']}`))
  );

  // より複雑な応用
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

4. combineLatest：順序なしで observable を並列処理し、すべての observable にデータが揃ってから後続の処理を行います
   - シナリオ：
   - 検索、並べ替え、ページネーションを含むデータの場合、検索、並べ替え、ページネーションをすべて単一の observable として設計し、combineLatest を使用して検索結果を生成できます
   - startWith：プログラムの開始時に空のデータを与えて検索結果を生成し、observable が開始データを持つようにします

```ts
const posts$ = this.httpClient.get(".../posts");
const tags$ = this.httpClient.get(".../tags");

this.data$ = combineLatest(posts$, tags$).pipe(map(([posts, tags]) => ({ posts: posts, tags: tags })));
```

```ts
this.products$ = combineLatest(this.filterChange$.pipe(startWith("")), this.sortChange$.pipe(startWith({})), this.pageChange$.pipe(startWith({}))).pipe(exhaustMap(([keyword, sort, page]) => this.httpClient.post(`.../products`, { keyword: keyword, sort: sort, page: page })));
```

5. forkJoin：すべての observable が完了 ( complete ) した後、最終結果を取得します
   - シナリオ：
   - Http Request の統合

```ts
const posts$ = this.httpClient.get(".../posts");
const tags$ = this.httpClient.get(".../tags");

this.data$ = forkJoin(posts$, tags$).pipe(map(([posts, tags]) => ({ posts: posts, tags: tags })));
```

### day30 RxJS operators 高度な応用

5. debounceTime：時間を設定（ミリ秒）し、新しいデータが入ってくる限り一時的に無視し、更新がなくなってから次の operators に渡します
   - シナリオ：
   - 入力完了後に自動的にデータを検索し、ボタンを押す必要がないようにするが、データ変更の瞬間に API 呼び出しを行うとサーバーの負荷が重くなりすぎる

```ts
data$ = this.searchControl.valueChanges.pipe(
  debounceTime(300), // 300ミリ秒間新しいデータがない場合にのみ検索
  switchMap((keyword) => this.httpClient.get(`.../?q=${keyword}`))
);
```

6. distinctUntilChanged：前回のデータと今回のデータが同じ場合、変更を能動的に無視します
   - シナリオ：
   - 重複するキーワード検索

```ts
data$ = this.searchControl.valueChanges.pipe(
  debounceTime(300), // 300ミリ秒間新しいデータがない場合にのみ検索
  distinctUntilChanged(), // 「内容が本当に変更された」場合にのみ検索
  switchMap((keyword) => this.httpClient.get(`.../?q=${keyword}`))
);
```

7. scan：上記の debounceTime は時間制御を使用していますが、これは回数制御を使用しています。以下の filter operators も参照できます

[How can I determine the number of values has been emitted during the debounce time?](https://stackoverflow.com/questions/71873411/how-can-i-determine-the-number-of-values-has-been-emitted-during-the-debounce-ti)

```ts
export const debounceCounter =
  (dueTime: number): MonoTypeOperatorFunction<number> =>
  (source: Observable<unknown>): Observable<number> =>
    new Observable((observer) =>
      source
        .pipe(
          scan((acc) => acc + 1, 0),
          debounceTime(dueTime),
          startWith(0),
          pairwise(),
          map(([previous, current]) => current - previous)
        )
        .subscribe({
          next: (x) => {
            observer.next(x);
          },
          error: (err) => {
            observer.error(err);
          },
          complete: () => {
            observer.complete();
          },
        })
    );
```

8. filter：データのフィルタリング用

```ts
data$ = this.searchControl.valueChanges.pipe(
  debounceTime(300), // 300ミリ秒間新しいデータがない場合にのみ検索
  distinctUntilChanged(), // 「内容が本当に変更された」場合にのみ検索
  filter((keyword) => keyword.length >= 3), // キーワードが3文字以上の場合にのみ検索
  switchMap((keyword) => this.httpClient.get(`.../?q=${keyword}`))
);
```

9. Subject：service と組み合わせてコンポーネント間でデータを渡す
   - 単純に Subject を使用する場合の最大の問題は、購読時に next() 呼び出しがない場合、過去のデータをまったく受信できないことです。次の 2 つの operators を使用できます

```ts
@Injectable({
  providedIn: "root",
})
export class ChatService {
  private _message = ["hello", "world"];

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

10. BehaviorSubject：データが購読される前に初期データを与えることができ、next が発生する前に subscribe() を実行すると初期データが得られます
11. ReplaySubject：next() を呼び出して変更されたすべてのデータを記録し、subscribe() されたときにすべての記録を再生します (最近の N 件を記録するように設定可能)
12. AsyncSubject：complete() メソッドが呼び出されたときにのみ、「最後の next() のデータ」を購読できます
13. observable エラー処理 catchError：発生したエラーをインターセプトし、別の observable を返して、observable 全体がスムーズに動作し続けるようにします
    - シナリオ：
    - 一般的なエラーでは、いずれかの operator 内でエラーが発生すると、observable 全体がエラーになり終了します
    - AsyncPipe を使用する場合、subscribe() を再度行うことはほとんどありません

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
  catchError((error) => {
    console.log(error);
    return of([]);
  })
);
```

15. observable エラー処理 throwError：エラー時に全体を中断したい、または能動的にエラーをスローしたい場合

```ts
this.httpClient.get(`.../posts`).pipe(
  tap((data) => {
    if (data.length === 0) {
      // 能動的にエラーをスロー
      throwError("no data");
    }
  }),
  catchError((error) => {
    console.log(error);
    return of([]);
  })
);
```

16. try ... catch ... finally => finalize：最後に必ず実行されるプログラム

```ts
this.isLoading = true; // 読み込み中状態に入る
this.httpClient.get(`.../posts`).pipe(
  finalize(() => {
    // 途中のプログラムでどのようなエラーが発生しても、必ず finalize に入ります
    this.isLoading = false;
  })
);
```

## ヘッドレスコンポーネントの使用シナリオ

> Angular ComponentFactoryResolver を介してヘッドレスコンポーネントを作成 / コンポーネントは AppModule entryComponents に登録する必要があります

1. 動的なコンポーネント生成
2. サービスとしてのコンポーネント
3. レンダリングとしてのコンポーネント
4. ディレクティブの動的作成
5. モーダルの動的作成

### 動的なコンポーネント生成

この例では、AppComponent で MyComponent コンポーネントのインスタンスを作成し、画面に追加しました。ユーザーが "Create Component" ボタンをクリックすると、ComponentFactoryResolver を使用して MyComponent コンポーネントのインスタンスを動的に作成し、その name プロパティを設定します。

```ts
import { Component, ComponentFactoryResolver, ViewContainerRef } from "@angular/core";

@Component({
  selector: "app-root",
  template: `
    <button (click)="createComponent()">Create Component</button>
    <div #container></div>
  `,
})
export class AppComponent {
  @ViewChild("container", { read: ViewContainerRef }) container: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver) {}

  createComponent() {
    const factory = this.resolver.resolveComponentFactory(MyComponent);
    const componentRef = this.container.createComponent(factory);
    componentRef.instance.name = "John Doe";
  }
}

@Component({
  selector: "app-my-component",
  template: ` <p>Hello, {{ name }}!</p> `,
})
export class MyComponent {
  name: string;
}
```

### サービスとしてのコンポーネント

この例では、doSomething メソッドを含む MyService という名前のサービスを作成しました。また、MyService を注入し、ngOnInit で doSomething メソッドを呼び出す MyComponent コンポーネントも作成しました。AppComponent では、ComponentFactoryResolver を使用して MyComponent コンポーネントのインスタンスを動的に作成し、画面に追加しました。ユーザーが "Create Component" ボタンをクリックすると、MyComponent コンポーネントのインスタンスが動的に作成され、このインスタンスには MyService サービスのインスタンスが含まれます。このようにして、コンポーネント化された環境でサービスを使用し、サービスのコンポーネント化を実現できます。

```ts
import { Injectable, Component, ComponentFactoryResolver, ViewContainerRef } from "@angular/core";

@Injectable()
export class MyService {
  doSomething() {
    console.log("Doing something...");
  }
}

@Component({
  selector: "app-my-component",
  template: `...`,
})
export class MyComponent {
  constructor(private service: MyService) {}

  ngOnInit() {
    this.service.doSomething();
  }
}

@Component({
  selector: "app-root",
  template: `
    <button (click)="createComponent()">Create Component</button>
    <div #container></div>
  `,
})
export class AppComponent {
  @ViewChild("container", { read: ViewContainerRef }) container: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver) {}

  createComponent() {
    const factory = this.resolver.resolveComponentFactory(MyComponent);
    const componentRef = this.container.createComponent(factory);
  }
}
```

### レンダリングとしてのコンポーネント

この例では、2 つの動的コンポーネント DynamicFormComponent と DynamicTableComponent を作成し、AppComponent でこれら 2 つのコンポーネントを動的に作成しました。また、DynamicTableComponent に data プロパティを追加し、テーブルコンポーネントのデータソースを設定しました。コンポーネントを動的に生成し、コンポーネントのデータソースを設定することで、UI コンポーネントを柔軟に構築し、高度に構成可能な UI システムを実現できます。

```ts
import { Component, ComponentFactoryResolver, ViewContainerRef } from "@angular/core";

@Component({
  selector: "app-root",
  template: `
    <app-dynamic-form></app-dynamic-form>
    <app-dynamic-table></app-dynamic-table>
  `,
})
export class AppComponent {
  constructor(private resolver: ComponentFactoryResolver, private container: ViewContainerRef) {}

  ngAfterViewInit() {
    // フォームコンポーネントを動的作成
    const formFactory = this.resolver.resolveComponentFactory(DynamicFormComponent);
    const formRef = this.container.createComponent(formFactory);

    // テーブルコンポーネントを動的作成
    const tableFactory = this.resolver.resolveComponentFactory(DynamicTableComponent);
    const tableRef = this.container.createComponent(tableFactory);

    // テーブルコンポーネントのデータソースを設定
    const tableComponent = <DynamicTableComponent>tableRef.instance;
    tableComponent.data = [
      { name: "John Doe", age: 30 },
      { name: "Jane Doe", age: 25 },
    ];
  }
}

@Component({
  selector: "app-dynamic-form",
  template: `...`,
})
export class DynamicFormComponent {}

@Component({
  selector: "app-dynamic-table",
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

### ディレクティブの動的作成

この例では、DOM 要素にツールチップを追加するためのディレクティブ TooltipDirective を作成しました。ユーザーが要素の上にマウスを置くと、ComponentFactoryResolver を使用して TooltipComponent コンポーネントのインスタンスを動的に作成し、DOM 要素に追加します。ユーザーがマウスを離すと、ツールチップを DOM から削除します。

```ts
import { Directive, ComponentFactoryResolver, ViewContainerRef, ElementRef } from "@angular/core";

@Directive({
  selector: "[appTooltip]",
})
export class TooltipDirective {
  constructor(private resolver: ComponentFactoryResolver, private container: ViewContainerRef, private el: ElementRef) {}

  showTooltip() {
    const factory = this.resolver.resolveComponentFactory(TooltipComponent);
    const componentRef = this.container.createComponent(factory);
    const tooltipElement = componentRef.location.nativeElement;

    tooltipElement.style.position = "absolute";
    tooltipElement.style.left = this.el.nativeElement.offsetLeft + "px";
    tooltipElement.style.top = this.el.nativeElement.offsetTop + this.el.nativeElement.offsetHeight + "px";

    this.el.nativeElement.appendChild(tooltipElement);
  }

  hideTooltip() {
    this.container.clear();
  }
}

@Component({
  selector: "app-tooltip",
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

### モーダルの動的作成

この例では、モーダル ModalComponent を作成し、AppComponent でこのモーダルのインスタンスを動的に作成しました。また、title と message プロパティを設定することで、モーダルのタイトルとメッセージを設定しました。ユーザーが "Close" ボタンをクリックすると、close イベントを発行し、AppComponent でこのイベントを購読し、イベントがトリガーされたときにモーダルのインスタンスを破棄します。モーダルを動的に作成することで、警告ボックス、確認ボックスなどのより柔軟な機能を実装できます。

```ts
import { Component, ComponentFactoryResolver, ViewContainerRef } from "@angular/core";

@Component({
  selector: "app-root",
  template: ` <button (click)="showModal()">Show Modal</button> `,
})
export class AppComponent {
  constructor(private resolver: ComponentFactoryResolver, private container: ViewContainerRef) {}

  showModal() {
    const factory = this.resolver.resolveComponentFactory(ModalComponent);
    const componentRef = this.container.createComponent(factory);

    componentRef.instance.title = "Modal Title";
    componentRef.instance.message = "Modal Message";

    componentRef.instance.close.subscribe(() => {
      componentRef.destroy();
    });
  }
}

@Component({
  selector: "app-modal",
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
