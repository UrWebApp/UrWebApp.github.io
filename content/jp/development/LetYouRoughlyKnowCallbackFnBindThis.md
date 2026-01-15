---
title: CallbackFn & Bind(this) を大まかに理解させる
date: 2023-06-03
category: Development
author: johch3n611u
tags:
  - JavaScript
  - Angular
authorsWords: フロントエンドにはアニメーション以外にも深く掘り下げるべき場所が本当にたくさんあります...
---

最近、外部から導入した script を Angular に統合する必要がある場面に遭遇しました。CallbackFn と this は別々に理解していました。Angular のコンポーネント内の this は通常、現在のコンポーネントインスタンスを指します。

しかし、CallbackFn に入った後、this が混乱しました。アロー関数も試してみましたが失敗し、最後は愚かな方法を使って、一旦 `localstorage` に保存してから取り出して使うようにしました。幸いなことに同僚が Code Review を手伝ってくれて、Bind というネイティブメソッドを使ってくれたことで、何が難しいのかに気づきました。

まず、Sage AI に CallFn Exceport をいくつか要求したところ、非常に単純でわかりやすいことがわかりました。

## Sage CallFunction Exceport

```js
function fetchData(callback) {
  // 非同期操作をシミュレート
  setTimeout(() => {
    const data = { name: "John", age: 30 };
    callback(data);
  }, 1000);
}

function displayData(data) {
  console.log(`Name: ${data.name}, Age: ${data.age}`);
}

//////////////////////

function sortArray(arr, compareFunc) {
  return arr.sort(compareFunc);
}

const numbers = [3, 1, 4, 1, 5, 9];
const compareFunc = (a, b) => a - b;
const sortedNumbers = sortArray(numbers, compareFunc);
console.log(sortedNumbers); // 出力 [1, 1, 3, 4, 5, 9]

///////////////////////

function filterArray(arr, filterFunc) {
  return arr.filter(filterFunc);
}

const numbers = [3, 1, 4, 1, 5, 9];
const filterFunc = (num) => num % 2 === 0;
const filteredNumbers = filterArray(numbers, filterFunc);
console.log(filteredNumbers); // 出力 [4]

//////////////////////

function addEventListener(element, eventName, callback) {
  element.addEventListener(eventName, callback);
}

const button = document.querySelector("#myButton");
const handleClick = () => console.log("Button clicked");
addEventListener(button, "click", handleClick);
```

## Sage CallFunction && this Exceport

```js
const myObj = {
  name: "John",
  age: 30,
  sayHello: function (callback) {
    console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
    callback();
  },
};

function logMessage() {
  console.log('The "sayHello" method has finished executing.');
}

myObj.sayHello(logMessage);

// Hello, my name is John and I am 30 years old.
// The "sayHello" method has finished executing.
```

## Sage CallFunction && this && Bind(this) Exceport

```js
const myObj = {
  name: "John",
  age: 30,
  sayHello: function () {
    console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
  },
};

const sayHelloFunc = myObj.sayHello.bind(myObj);
sayHelloFunc(); // 出力 "Hello, my name is John and I am 30 years old."
```

## Angular Component Mixd ChatScript

```js

  constructor(
    @Inject(DOCUMENT) private document: Document,
  ) { }

  this.initialize(this.document, "Freshchat-js-sdk");

  initialize(i, t) {
    // let w: any = window;
    // let freshChatConfig = JSON.parse(localStorage.getItem('freshChatConfig'));
    // if(!w.fcWidget){
    //     let e; i.getElementById(t) ?
    //     this.initFreshChat() : (
    //       (e = i.createElement("script")).id = t,
    //       e.async = !0,
    //       e.src = `${freshChatConfig.url}/js/widget.js`,
    //       e.onload = this.initFreshChat,
    //       i.head.appendChild(e)
    //     );
    let e;
    if(i.getElementById(t)){
      this.initFreshChat();
    } else {
      (e = i.createElement("script")).id = t,
      e.async = !0,
      e.src = "https://watsons4.freshchat.com/js/widget.js",
      e.onload = this.initFreshChat.bind(this),
      i.head.appendChild(e)
    }
    window.setTimeout(() => this.unreadCountNotify(this.freshChatService), 3000);
  }

  initFreshChat() {
    // let freshChatConfig = JSON.parse(localStorage.getItem('freshChatConfig'));
    let w: any = window;
    if (w.fcWidget) {
      w.fcWidget.init({
        // token: freshChatConfig.token,
        // host: freshChatConfig.url,
        token: this.freshChatToken,
        host: this.freshChatUrl,
        config: {
          headerProperty: {
            appName: 'freshChat',
            hideChatButton: true,
          }
        }
      });
    }
  }
```

```js
this.initialize(this.document, "Freshchat-js-sdk");

function initialize(e, t) {
  let e;
  i.getElementById(t)
    ? this.initFreshChat()
    : (((e = i.createElement("script")).id = t),
      (e.async = !0),
      (e.src = `${freshChatConfig.url}/js/widget.js`),
      (e.onload = this.initFreshChat), // callback fn
      i.head.appendChild(e));
}

// この関数は getElementById メソッドを使用して、t で識別される要素が存在するかどうかを確認します。存在する場合は initFreshChat 関数を呼び出し、存在しない場合は新しい script 要素を作成し、その id、async 属性、src 属性を指定された URL に設定して、head 要素に追加します。この script 要素の読み込みが完了すると、initFreshChat 関数を呼び出します。

function initFreshChat() {
  let w: any = window;
  if (w.fcWidget) {
    w.fcWidget.init({
      token: "",
      host: "",
      config: {
        headerProperty: {
          appName: "freshChat",
          hideChatButton: true,
        },
      },
    });
  }
}

// window オブジェクトを変数 w に代入します。次に、w.fcWidget が存在するかどうかを確認します。存在する場合は、fcWidget.init メソッドを呼び出し、token、host、config 属性を含むオブジェクトを渡します。この例では、config オブジェクトには headerProperty という属性が含まれており、その中には appName と hideChatButton という 2 つの属性が含まれ、それぞれ 'freshChat' と true に設定されています。これらの属性は、Freshchat ウィジェットの外観と動作を構成するために使用されます。
```

このコードでは、`initFreshChat` 関数がコールバック関数（callback function）として `onload` 属性に渡されており、その script 要素の読み込みが完了すると、`initFreshChat` 関数が呼び出されます。この場合、`initFreshChat` 関数内の `this` は、グローバルスコープで呼び出されているため、`window` オブジェクトを指します。

一方、`initialize` 関数内の `getElementById` メソッドが true を返し、`initFreshChat` 関数が呼び出された場合、`initFreshChat` 関数内の `this` は `fcWidget` オブジェクトを指します。これは、`initFreshChat` 関数が `fcWidget` オブジェクトのメソッドとして呼び出されているためです。この場合、`this` はメソッドが呼び出されたオブジェクト、つまり `fcWidget` オブジェクトにバインドされます。

[https://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-inside-a-callback](how-to-access-the-correct-this-inside-a-callback)

## アロー関数 & this

[アロー関数（arrow function）とそれが this に与える影響](https://pjchender.dev/javascript/js-arrow-function/)

todo 時間を見つけて追記する
