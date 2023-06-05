---
title: 讓你大概搞懂 CallbackFn & Bind(this)
date: 2023-06-03
categories: Dev Tech
author: johch3n611u
tags:
- JavaScript
- Angular
---

最近遇到一個外部引入的 script ，因為對 CallbackFunction 與 this 不是很理解，在 Angular 中元件類中的 this 通常指向當前元件實例，而進到 CallbackFunction 後 this 亂了，印象當中有嘗試過箭頭函式也是失敗，最後用一個智障方法先保存在 localstage 在取出來用，還好是主管看 Code 用了 Bind，才想到有 Bind 這個原生方法，下定決心用一篇文章來搞懂它。

首先跟 Sage 要了一些 CallFn Exceport 發現，挺單純挺好懂得

## Sage CallFunction Exceport

```js
function fetchData(callback) {
  // 模拟异步操作
  setTimeout(() => {
    const data = { name: 'John', age: 30 };
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
console.log(sortedNumbers); // 输出 [1, 1, 3, 4, 5, 9]

///////////////////////

function filterArray(arr, filterFunc) {
  return arr.filter(filterFunc);
}

const numbers = [3, 1, 4, 1, 5, 9];
const filterFunc = (num) => num % 2 === 0;
const filteredNumbers = filterArray(numbers, filterFunc);
console.log(filteredNumbers); // 输出 [4]

//////////////////////

function addEventListener(element, eventName, callback) {
  element.addEventListener(eventName, callback);
}

const button = document.querySelector('#myButton');
const handleClick = () => console.log('Button clicked');
addEventListener(button, 'click', handleClick);
```

## Sage CallFunction && this Exceport

```js
const myObj = {
  name: 'John',
  age: 30,
  sayHello: function(callback) {
    console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
    callback();
  }
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
  name: 'John',
  age: 30,
  sayHello: function() {
    console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
  }
};

const sayHelloFunc = myObj.sayHello.bind(myObj);
sayHelloFunc(); // 输出 "Hello, my name is John and I am 30 years old."
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

function initialize(e,t){
        let e; 
        i.getElementById(t) ? 
        this.initFreshChat() : 
        (
          (e = i.createElement("script")).id = t,
          e.async = !0,
          e.src = `${freshChatConfig.url}/js/widget.js`,
          e.onload = this.initFreshChat, // callback fn
          i.head.appendChild(e)
        );
}

// 這個函數使用 getElementById 方法檢查是否存在 t 標識的元素。如果存在，則調用 initFreshChat 函数；否則，它會創建一個新的 script 元素，設置其 id、async 屬性和 src 屬性為指定的 URL，並將其添加到 head 元素中。當這個 script 元素完成加載時，它會調用 initFreshChat 函数。

function initFreshChat() {
    let w: any = window;
    if (w.fcWidget) {
      w.fcWidget.init({
        token: '',
        host: '',
        config: {
          headerProperty: {
            appName: 'freshChat',
            hideChatButton: true,
          }
        }
      });
    }
}

// 將 window 對象賦值給變量 w。然後，它檢查 w.fcWidget 是否存在。如果存在，它會調用 fcWidget.init 方法，並傳遞一個包含 token、host 和 config 屬性的對象。在此示例中，config 對象包含一個名為 headerProperty 的屬性，該屬性又包含兩個屬性：appName 和 hideChatButton，分別設置為 'freshChat' 和 true。這些屬性用於配置 Freshchat widget 的外觀和行為。
```

在這段代碼中，initFreshChat 函數是作為回調函數（callback function）傳遞給 onload 屬性的，當該 script 元素加載完成時，就會調用 initFreshChat 函數。在這種情況下，initFreshChat 函數中的 this 會指向 window 對象，因為它是在全局作用域中被調用的。

另一方面，當 initialize 函數中的 getElementById 方法返回 true，並且調用了 initFreshChat 函數時，initFreshChat 函數中的 this 則會指向 fcWidget 對象，因為 initFreshChat 函數是作為 fcWidget 對象的一個方法被調用的。在這種情況下，this 會被繫結到方法被調用的對象上，即 fcWidget 對象。

[https://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-inside-a-callback](how-to-access-the-correct-this-inside-a-callback)