---
title: Angular Master Path: A Guide from Basics to Advanced
date: 2023-06-28
categories: Development
author: johch3n611u
authorsWords: Besides some NG native syntax and applications, I feel the more complex parts are still design patterns, functional programming, and reactive programming (Rxjs). These should be common across major frameworks, so it's worth investing more effort into them.
tags:
- Angular
---

[Angular Master Path Series](https://ithelp.ithome.com.tw/users/20020617/ironman/1630)

## NG Master Path Note Outline

### day1 Outline covering almost everything

### day2 JSON Schema, Monorepo

### day3 Lifecycle: main.ts ( Can bootstrap multiple root modules ) => app.module.ts ( Can bootstrap multiple root components ) => app.component.ts Root Component

### day4 Component Lifecycle. Besides basics, the difference lies in OnChange vs ng Content lifecycle, affecting whether @ContentChild, @ContentChildren can be obtained

### day5 NgModule Parameter Application, Dynamic/Static Component Loading

### day6 Feature, Shared, Core Module , Ng 6 Service automatically providedIn root Module

### day7 Two Way Binding

### day8 Custom Form Control / Token: NG_VALUE_ACCESSOR / ControlValueAccessor

### day9 Directive exportAs

### day10 $any Template Syntax

### day11 \*ngIf else combined with Template Reference Variable

```html
<ng-container *ngTemplateOutlet="myTemplate"></ng-container>

<ng-template #myTemplate>
  <h1>Welcome</h1>
  <p>Here is some content</p>
</ng-template>
```

ng-template is a tag where you can define a piece of HTML code inside it, but this code will not be rendered directly. Instead, it is used as a template that can be referenced and used elsewhere.

ng-container is a virtual element that does not generate any actual HTML element, it is just used to wrap other elements.

### day12 \*ngTemplateOutlet

The original approach used Directive to get @ViewChildren, but it seems possible to get @ViewChildren with the same #ID. NG will determine if it's one or multiple QueryList.

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
<!-- $implicit means when let-xxxx is set, there is a default passed value -->
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

Convenient to get `<ng-template>` using @ViewChildren

```ts
import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: "[appCarouselPage]",
})
export class CarouselPageDirective {
  // @Optional is a Dependency Injection decorator in Angular, used to mark a dependency object as optional.
  // Gives this directive a chance to be attached to both pure elements and Template
  constructor(@Optional() private elementRef: ElementRef<any>, @Optional() private templateRef: TemplateRef<any>, @Optional() private viewContainerRef: ViewContainerRef) {
    console.log("viewContainerRef", this.vewContainerRef.element);
    console.log("templateRef", this.templateRef.elementRef);
    console.log("elementRef", this.elementRef);

    if (templateRef) {
      // Process for template
    } else {
      // Process for element
    }
  }
}
```

### day13 ng-container Does not generate element tags

1. When *ngIf and *ngFor need to be used simultaneously
2. Avoid needing to change CSS selectors

### day14 Dynamic Component Loading (Simple Version) \*ngComponentOutlet / Entry components

Scenario: When presenting different components on the template, easily dirtying the template code

```ts
// <input type="radio" id="formA" name="form" value="A" [(ngModel)]="chooseForm">
// <label for="formA">Form A</label>
// <input type="radio" id="formB" name="form" value="B" [(ngModel)]="chooseForm">
// <label for="formB">Form B</label>
// <input type="radio" id="formC" name="form" value="C" [(ngModel)]="chooseForm">
// <label for="formC">Form C</label>

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

### day15 Dynamic Component Loading (Complex Version) ViewContainerRef / createEmbeddedView / ComponentFactoryResolver [Please refer to Headless Component Application](#headless-component-usage-scenarios)

- ViewContainerRef: Represents a view container that can be used to create, insert, and remove dynamic components. Through ViewContainerRef, a child view can be dynamically created and inserted into the container. For example, a component can be dynamically created using the ViewContainerRef.createComponent method, and then inserted into the container using the ViewContainerRef.insert method. ViewContainerRef can be injected into components via @ViewChild or @ViewChildren decorators.
- ElementRef: Represents a reference to a DOM element, which can be used to operate and access the attributes and methods of that element. The DOM object of the element can be obtained through the ElementRef.nativeElement property. For example, ElementRef.nativeElement.style property can be used to set element styles. ElementRef can be injected into components via @ViewChild or @ViewChildren decorators.
- TemplateRef: Represents a reference to a template, which can be used to dynamically create and render templates. An embedded view (Embedded View) can be dynamically created through the TemplateRef.createEmbeddedView method, and then inserted into the view container using the ViewContainerRef.createEmbeddedView method. TemplateRef is usually used in scenarios of implementing reusable components or dynamically generating templates. TemplateRef can be injected into components via @ViewChild or @ContentChild decorators.

### day16 Customized Directive [Structural ( \*data="data; xxx: { value: xxx }" ) / Attribute ( [data]="data" let-xxx ) Directive](https://ithelp.ithome.com.tw/articles/10207012)

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

### day17 HTTP_INTERCEPTORS Intercept Http Request / HttpHandler

### day18 ErrorHandler Centralized Error Handling

### day19 APP_INITIALIZER Process Data at Early Stage of Program Execution

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

### day22 Inject Token Entity Method ( Constructor Inject / Injector Object / @Component , @Directive providers )

### day23 InjectionToken Force Generate Token / @Inject()

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

### day24 NgZone Tool to know occurrence of all asynchronous events and confirm when to perform change detection. onUnstable / onStable / runOutsideAngular / run

- Avoid performance loss from change detection
- Integrate third-party packages outside of change detection
- Use run to bring program back to change detection for DOM related operations

### day25 ChangeDetectorRef Control change detection timing performance tuning independently for each component. detach / reattach / detectChanges

### day26 Component Change Detection Strategy ( Turn off auto detection, open manually ) changeDetection / ChangeDetectorRef / markForCheck

### day27 AsyncPipe Technique as / Rxjs Operator shareReplay

`<li *ngFor="let todo of todos$ | async">{{ todo.title }}</li>`

- In development habits, we add a $ symbol after variable to represent it is an observable.
- Automatically handles Promise, but mostly RxJS is used in Angular.
- Automatically manages change detection, less performance consumption.
- Pseudo-lazy loading.

```TS
<ng-container *ngIf="todos$ | async as todos; else loading">
  <ul>
    <!-- Inside here, no need to use todos$ | async, but use local variable todos after as -->
    <li *ngFor="let todo of todos">{{ todo.title }}</li>
  </ul>
</ng-container>
```

shareReplay: If you only want to call when first displayed, keeping recent N records, default will "replay" latest N records first.

### day28 AsyncPipe Advanced Techniques

- Automatic unsubscription
- Automatic request for change detection

### day29 RxJS operators Basics

1. map: Transforms data obtained from subscription into another piece of data
   - Scenario:
   - Data conversion in pipe chain to next layer, only keeping new organized format
   - A component needs to pass in an array as menu data source, and after getting data from network, hope to add a default value
2. tap: Does not affect anything, similar to middleware, can do something during that time period
   - Scenario:
   - console.log
   - Data assignment
3. switchMap: Receive observable data in order and transform into another observable / concatMap / mergeMap / exhaustMap
   - Scenario:
   - When route content (observable) changes, then request API (observable) data
   - A series of observables that have necessary order

```ts
constructor(private route: ActivatedRoute, private httpClient: HttpClient) { }

ngOnInit() {
  this.route.params.subscribe(params => {
    // The following part is also an observable, facing situation of nested ob wrapping ob
    // this.httpClient
    //   .get(`.../post/${params['id']}`)
    //     .subscribe(post => {
    //       this.post = post;
    // })
  });

  this.route.params.pipe(
    switchMap(params => this.httpClient.get(`.../post/${params['id']}`))
  );

  // More complex application
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

4. combineLatest: Parallel processing of observables without order, subsequent processing only after all observables have data
   - Scenario:
   - Data including search, sort and pagination, we can design search, sort and pagination as a single observable, using combineLatest to generate search results
   - startWith: Give empty data at start of program to generate search result, ensuring observable can have initial data

```ts
const posts$ = this.httpClient.get(".../posts");
const tags$ = this.httpClient.get(".../tags");

this.data$ = combineLatest(posts$, tags$).pipe(map(([posts, tags]) => ({ posts: posts, tags: tags })));
```

```ts
this.products$ = combineLatest(this.filterChange$.pipe(startWith("")), this.sortChange$.pipe(startWith({})), this.pageChange$.pipe(startWith({}))).pipe(exhaustMap(([keyword, sort, page]) => this.httpClient.post(`.../products`, { keyword: keyword, sort: sort, page: page })));
```

5. forkJoin: Only obtain final result after all observables are completed ( complete )
   - Scenario:
   - Integration of Http Requests

```ts
const posts$ = this.httpClient.get(".../posts");
const tags$ = this.httpClient.get(".../tags");

this.data$ = forkJoin(posts$, tags$).pipe(map(([posts, tags]) => ({ posts: posts, tags: tags })));
```

### day30 RxJS operators Advanced Application

5. debounceTime Buffer settings a time (milliseconds), temporarily ignore as long as there is new data coming in, until no update and then pass to next operators
   - Scenario:
   - Automatically search data after finishing input, without pressing a button, but sending API call at moment of data change would be too heavy loading for server

```ts
data$ = this.searchControl.valueChanges.pipe(
  debounceTime(300), // Search only when no new data for 300ms
  switchMap((keyword) => this.httpClient.get(`.../?q=${keyword}`))
);
```

6. distinctUntilChanged Actively ignore change when previous data is same as current data
   - Scenario:
   - Repeated keyword search

```ts
data$ = this.searchControl.valueChanges.pipe(
  debounceTime(300), // Search only when no new data for 300ms
  distinctUntilChanged(), // Search only when "content actually changed"
  switchMap((keyword) => this.httpClient.get(`.../?q=${keyword}`))
);
```

7. scan Above debounceTime uses time control, this uses count control, can also refer to following filter operators

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

8. filter Used for filtering data

```ts
data$ = this.searchControl.valueChanges.pipe(
  debounceTime(300), // Search only when no new data for 300ms
  distinctUntilChanged(), // Search only when "content actually changed"
  filter((keyword) => keyword.length >= 3), // Search only when keyword is greater than or equal to 3 characters
  switchMap((keyword) => this.httpClient.get(`.../?q=${keyword}`))
);
```

9. Subject Combined with service to pass data across components
   - The biggest problem when using Subject purely is that if no next() call happens during subscription, past data will not be received at all, can use next two operators

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

10. BehaviorSubject Can give initial data before data is subscribed, execute subscribe() before any next occurs will get initial data
11. ReplaySubject Will record all data changed by calling next(), replay all records when subscribed() (Can set to record recent N items)
12. AsyncSubject Can only subscribe to "data of last next()" when complete() method is called
13. observable Error handling catchError Intercept occurred error, and return another observable, allowing entire observable to continue operating smoothly
    - Scenario:
    - General error, as long as error occurs in any operator, entire observable will error and end
    - When using AsyncPipe, almost never subscribe() again;

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

15. observable Error handling throwError Hope to interrupt entirely when error creates, or actively throw error

```ts
this.httpClient.get(`.../posts`).pipe(
  tap((data) => {
    if (data.length === 0) {
      // Actively throw error
      throwError("no data");
    }
  }),
  catchError((error) => {
    console.log(error);
    return of([]);
  })
);
```

16. try ... catch ... finally => finalize Code that will definitely execute at end

```ts
this.isLoading = true; // Enter loading state
this.httpClient.get(`.../posts`).pipe(
  finalize(() => {
    // Will definitely enter finalize no matter what error encountered in middle program
    this.isLoading = false;
  })
);
```

## Headless Component Usage Scenarios

> Create headless component via Angular ComponentFactoryResolver / Component needs to register AppModule entryComponents

1. Dynamically generate component
2. Componentized service
3. Componentized rendering
4. Dynamically create directive
5. Dynamically create modal

### Dynamically Generate Component

In this example, we created an instance of MyComponent component in AppComponent and added it to the screen. When user clicks "Create Component" button, we use ComponentFactoryResolver to dynamically create instance of MyComponent component and set its name property.

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

### Componentized Service

In this example, we created a service named MyService which contains a doSomething method. We also created a MyComponent component which injected MyService and called doSomething method in ngOnInit. In AppComponent, we used ComponentFactoryResolver to dynamically create an instance of MyComponent component and added it to the screen. When user clicks "Create Component" button, we dynamically create instance of MyComponent component, this instance contains instance of MyService service. This way, we can use service in componentized environment, realizing componentization of service.

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

### Componentized Rendering

In this example, we created two dynamic components DynamicFormComponent and DynamicTableComponent, and dynamically created these two components in AppComponent. We also added a data property in DynamicTableComponent for setting data source of table component. By dynamically generating components and setting data source of components, we can build UI components flexibly, realizing highly configurable UI system.

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
    // Dynamically create form component
    const formFactory = this.resolver.resolveComponentFactory(DynamicFormComponent);
    const formRef = this.container.createComponent(formFactory);

    // Dynamically create table component
    const tableFactory = this.resolver.resolveComponentFactory(DynamicTableComponent);
    const tableRef = this.container.createComponent(tableFactory);

    // Set data source of table component
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

### Dynamically Create Directive

In this example, we created a directive TooltipDirective, which is used to add a tooltip to DOM element. When user hovers mouse over element, we use ComponentFactoryResolver to dynamically create an instance of TooltipComponent component and add it to DOM element. When user moves mouse away, we remove tooltip from DOM.

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

### Dynamically Create Modal

In this example, we created a modal ModalComponent, and dynamically created instance of this modal in AppComponent. We also set title and message of modal by setting title and message properties. When user clicks "Close" button, we emit a close event, and subscribe to this event in AppComponent, destroying instance of modal when event triggers. Through dynamically creating modal, we can implement more flexible features like alert box, confirm box etc.

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
