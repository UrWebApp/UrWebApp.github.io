---
title: 讓你大概搞懂 JS 特性 prototype chain / Constructor / this / callback fun
date: 2023-03-22
categories: Web
author: johch3n611u
tags:
- Javascript
---

原先是在研究 React Class / Function 差異 [[Day 07] Functional Component v.s Class Component](https://www.tpisoftware.com/tpu/articleDetails/2822) 但看著看著發現對於 Js 底層了解太少，所以在此紀錄一下一些文章重點，方便以後查閱。

## 原型链 ( prototype chain )

[該來理解 JavaScript 的原型鍊了 #18](https://github.com/aszx87410/blog/issues/18)

相較於 c# / java 等語言，js 開發者的初衷是單純 script 輕量在沒有 class 的狀況下 ( ES6 的 class 也只是語法糖 ) 運行於客戶端，所以單純以原型鍊來做繼承的特性，讓一些屬性可以共用，构造函数在建構實例時會產生基於原型 ( 基礎型別 ) 的屬性 __proto__，一層層原型鍊的盡頭就是 Object.prototype，再往上找就是 null 。

## 构造函数 ( Constructor ) 和一般函数

```js
// 构造函数
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype = { surname:'Jones' }
Person.prototype.log = function () {
  console.log(this.name + ', age:' + this.age);
}

console.log(nick.log === peter.log) // true
nick.log(); // nick, age:18
peter.log(); // peter, age:20

// 创建 Person 对象实例
var person1 = new Person("Tom", 25);
var person2 = new Person("Jerry", 30);

console.log(person1.name); // 输出 "Tom"
console.log(person2.age); // 输出 30

// prototype
console.log(person1.surname); // 输出 Jones
console.log(person2.surname); // 输出 Jones

// 一般函数
function add(a, b) {
  return a + b;
}

var sum = add(2, 3);

console.log(sum); // 输出 5
```

## this

[淺談 JavaScript 頭號難題 this：絕對不完整，但保證好懂](https://blog.techbridge.cc/2019/02/23/javascript-this/)

在回调函数中，如果没有使用箭头函数或者显式地将 this 绑定到当前组件实例上，this 将会指向 undefined 或者全局对象，而不是当前组件实例。因此，我们通常会在构造函数中将 this 绑定到回调函数中，或者使用箭头函数来确保 this 指向当前组件实例。

## callback function

回调函数指的是将一个函数作为参数传递给另一个函数，并在后者的执行过程中被调用的函数。通常，回调函数被用于异步编程，例如在处理事件、执行网络请求或执行其他需要一定时间才能完成的任务时。

```js
function greet(name, callback) {
  console.log('Hello, ' + name + '!');
  callback();
}

function sayGoodbye() {
  console.log('Goodbye!');
}

greet('John', sayGoodbye);
```

* 处理事件

```js
document.getElementById('myButton').addEventListener('click', function() {
  console.log('Button clicked!');
});
```

* 执行网络请求

```js
function makeRequest(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      callback(xhr.responseText);
    }
  };
  xhr.open('GET', url, true);
  xhr.send();
}

makeRequest('https://api.example.com/data', function(data) {
  console.log('Received data:', data);
});
```

* 执行其他需要一定时间才能完成的任务

```js
function doSomethingAsync(callback) {
  setTimeout(function() {
    callback('done');
  }, 1000);
}

doSomethingAsync(function(result) {
  console.log(result);
});
```



什么是JavaScript？
JavaScript与Java有何不同？
JavaScript中的数据类型是什么？如何检查变量的数据类型？
什么是JavaScript的作用域？如何声明变量以使其在特定作用域中可用？
什么是闭包？它们有什么作用？
什么是原型？如何使用它创建对象？
什么是JavaScript的事件循环？它与同步和异步编程有什么关系？
如何使用JavaScript创建对象？什么是构造函数？
什么是回调函数？如何使用它们处理异步事件？
什么是Promise？如何使用它们处理异步事件？
什么是箭头函数？它们与普通函数有何不同？
什么是ES6（ECMAScript 6）？它带来了哪些新的功能和语法？
什么是JavaScript的REST参数？如何使用它们？
什么是解构？如何使用它们在JavaScript中处理对象和数组？
什么是闭包？它们有什么作用？
什么是IIFE（立即调用的函
事件循環（Event Loop）？它是如何工作的？
如何實現繼承（Inheritance）？JavaScript 支援哪些類型的繼承？
閉包（Closure）？你能舉一個使用閉包的例子嗎？
 call()、apply() 和 bind() 的區別？
如何避免 JavaScript 的“回呼地獄”（Callback Hell）？
箭頭函數（Arrow Functions）和傳統函數的區別？
 var、let 和 const 的區別？
如何處理 JavaScript 中的異步編程（Asynchronous Programming）？
原型繼承（Prototype Inheritance）的概念？
如何使用 Promise 進行異步操作，它是如何工作的？
 hoisting（變量提升）是什麼？
事件委派（Event Delegation）？它有什麼優點？
 DOM（Document Object Model）是什麼？如何操作 DOM？
 RESTful API？如何使用 JavaScript 來呼叫它們？
同步和異步的區別？如何使用 JavaScript 進行同步和異步編程？
 CORS（Cross-Origin Resource Sharing）是什麼？如何在 JavaScript 中處理它？
 event bubbling 和 event capturing？它們有什麼區別？
事件（Event）是什麼？如何處理事件？
虛擬 DOM（Virtual DOM）？它有什麼優點？
如何使用 JavaScript 來實現模組化（Modularization）？
嚴格模式（Strict Mode）是什麼？它有什麼優點？
 AJAX？如何使用 JavaScript 進行 AJAX 請求？
事件委託（Event Delegation）和事件繫結（Event Binding）是什麼？它們有什麼區別？
立即執行函數（Immediately Invoked Function Expression, IIFE）？它有什麼作用？
如何使用 JavaScript 中的 fetch() 方法來進行網絡請求？
 HTTP Cookies？如何使用 JavaScript 操作 Cookies？
解構賦值（Destructuring Assignment）是什麼？它有什麼優點？
模板字面量（Template Literals）？它們有什麼優點？
代碼注入（Code Injection）是什麼？如何避免它？
資料結構？JavaScript 中有哪些常見的資料結構？如何實現它們？
原型繼承（Prototype Inheritance）是什麼？它與傳統的繼承方式有何區別？
 Promise？如何使用 Promise 進行異步編程？
作用域（Scope）是什麼？它與閉包（Closure）有何關聯？
高階函數（Higher-Order Function）？它有什麼作用？
箭頭函數（Arrow Function）是什麼？它與傳統函數有何區別？
 Proxy？如何使用 Proxy 來監聽對象的操作？
事件循環（Event Loop）是什麼？它有什麼作用？
 Map 和 Set？它們與傳統的數組有何區別？
同源策略（Same-Origin Policy）是什麼？它如何保護網頁安全？
 JavaScript 中的模組（Module）？它有什麼優點？
 async/await 是什麼？它如何簡化異步編程？
 JavaScript 中的柯里化（Currying）？它有什麼優點？
事件冒泡（Event Bubbling）是什麼？它有什麼作用？
 JavaScript 中的回調函數（Callback）？如何使用回調函數進行異步編程？
原型鏈（Prototype Chain）是什麼？它有什麼作用？
 JavaScript 中的函數式編程（Functional Programming）？它與面向對象編程有何區別？
事件（Event）是什麼？它如何與 DOM 相關聯？
 JavaScript 中的垃圾回收（Garbage Collection）？它如何工作？
模板字面量（Template Literal）是什麼？它與傳統字符串有何區別？
 JavaScript 中的函數柯南特（Function Currying）？它有什麼優點？
事件循環（Event Loop）是什麼？它如何處理異步編程？
 JavaScript 中的閉包（Closure）？它有什麼作用？
 IIFE 是什麼？它有什麼作用？
 JavaScript 中的原型繼承（Prototype Inheritance）？它與傳統繼承有何區別？
箭頭函數（Arrow Function）是什麼？它與傳統函數有何區別？
 JavaScript 中的 Promise？它如何簡化異步編程？
變量作用域（Variable Scope）是什麼？它與作用域鏈有何區別？
 JavaScript 中的跨域請求（Cross-Origin Request）？它如何實現？
模塊化（Modularization）是什麼？它有什麼作用？
 JavaScript 中的遞迴（Recursion）？它如何實現？它與循環有何區別？
 hoisting 是什麼？它如何影響變量和函數聲明？
 JavaScript 中的事件委託（Event Delegation）？它有什麼作用？
綁定（Binding）是什麼？它與 this 關鍵字有什麼關係？
 JavaScript 中的 currying？它有什麼作用？
嚴格模式（Strict Mode）是什麼？它有什麼作用？
 JavaScript 中的生成器（Generator）？它有什麼作用？
封裝（Encapsulation）是什麼？它有什麼作用？
 JavaScript 中的 map() 和 reduce() 方法？它們有什麼作用？
事件捕獲（Event Capturing）和事件冒泡（Event Bubbling）是什麼？它們有什麼區別？
 JavaScript 中的代碼優化（Code Optimization）？你可以舉一些例子嗎？
 JavaScript 中的闭包（Closure）？它有什麼作用？可以舉一個實際的應用場景嗎？
作用域（Scope）是什麼？它與作用域鏈（Scope Chain）有什麼關係？
 JavaScript 中的原型（Prototype）？它有什麼作用？
事件循環（Event Loop）是什麼？它如何處理異步任務？
 JavaScript 中的箭頭函數（Arrow Function）？它有什麼優點？
 promise 是什麼？它如何處理異步操作？
 JavaScript 中的變量提升（Variable Hoisting）？它如何影響代碼執行？
模塊化（Module）是什麼？它有什麼作用？
 JavaScript 中的類（Class）？它與原型有什麼關係？
可變（Mutable）和不可變（Immutable）數據類型的區別？舉一些例子。