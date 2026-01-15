---
title: Let you roughly understand CallbackFn & Bind(this)
date: 2023-06-03
category: Development
author: johch3n611u
tags:
  - JavaScript
  - Angular
authorsWords: Apart from animation, there are really so many places in frontend that can be delved into...
---

Recently, I encountered an external script that needs to be integrated into Angular. CallbackFn and this can be understood separately; in Angular, `this` in a component usually refers to the current component instance.

However, after entering CallbackFn, `this` got messed up. I tried arrow functions but failed. Finally, I used a stupid method: save it in `localstorage` first and then take it out for use. Fortunately, a colleague helped with Code Review and used the native method `Bind`, only then did I realize what the difficult part was.

First, I asked Sage AI for some CallFn Exceport and found it quite simple and easy to understand.

## Sage CallFunction Exceport

```js
function fetchData(callback) {
  // Simulate asynchronous operation
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
console.log(sortedNumbers); // Output [1, 1, 3, 4, 5, 9]

///////////////////////

function filterArray(arr, filterFunc) {
  return arr.filter(filterFunc);
}

const numbers = [3, 1, 4, 1, 5, 9];
const filterFunc = (num) => num % 2 === 0;
const filteredNumbers = filterArray(numbers, filterFunc);
console.log(filteredNumbers); // Output [4]

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
sayHelloFunc(); // Output "Hello, my name is John and I am 30 years old."
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

// This function uses the getElementById method to check if the element identified by t exists. If it exists, it calls the initFreshChat function; otherwise, it creates a new script element, sets its id, async property, and src property to the specified URL, and adds it to the head element. When this script element finishes loading, it calls the initFreshChat function.

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

// Assigns the window object to variable w. Then, it checks if w.fcWidget exists. If it exists, it calls the w.fcWidget.init method and passes an object containing token, host, and config properties. In this example, the config object contains a property named headerProperty, which in turn contains two properties: appName and hideChatButton, set to 'freshChat' and true respectively. These properties are used to configure the appearance and behavior of the Freshchat widget.
```

In this code, the `initFreshChat` function is passed as a callback function to the `onload` property, and when the script element finishes loading, `initFreshChat` function is called. In this case, `this` in the `initFreshChat` function will refer to the `window` object because it is called in global scope.

On the other hand, when the `getElementById` method within the `initialize` function returns true and calls the `initFreshChat` function, `this` in the `initFreshChat` function will refer to the `fcWidget` object, because `initFreshChat` function is called as a method of the `fcWidget` object. In this case, `this` is bound to the object the method is called on, i.e., the `fcWidget` object.

[https://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-inside-a-callback](how-to-access-the-correct-this-inside-a-callback)

## Arrow Function & this

[Arrow function and its effect on this](https://pjchender.dev/javascript/js-arrow-function/)

todo Find time to fill this
