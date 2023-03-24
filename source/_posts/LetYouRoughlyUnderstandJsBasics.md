---
title: 讓你大概搞懂 JS 特性大全
date: 2023-03-22
categories: Web
author: johch3n611u
tags:
- Javascript
---

原先是在研究 React Class / Function 差異 [[React] Functional-component vs Class-component](https://www.tpisoftware.com/tpu/articleDetails/2822) 但看著看著發現對於 Js 底層了解太少，所以在此紀錄一下一些文章重點，方便以後查閱。

## 原型鏈 ( prototype chain )

[該來理解 JavaScript 的原型鍊了 #18](https://github.com/aszx87410/blog/issues/18)

相較於 c# / java 等 class-base 語言，js 開發者的初衷是單純 script 輕量 ( object / prototype ) -base 在沒有 class 的狀況下 ( ES6 的 class 也只是語法糖 ) 運行於客戶端，所以單純以原型鍊來做繼承的特性，讓一些屬性可以共用；

构造函数在建構實例時會產生基於原型 ( 基礎型別 ) 的屬性 __proto__，一層層原型鍊的盡頭就是 Object.prototype，再往上找就是 null 。

```js
function Person(name, age) {
  this.name = name;
  this.age = age;
}
  
Person.prototype.log = function () {
  console.log(this.name + ', age:' + this.age);
}
  
var nick = new Person('nick', 18);
  
// 這個剛講過了，nick.__proto__ 會指向 Person.prototype
console.log(nick.__proto__ === Person.prototype) // true
  
// 那 Person.prototype.__proto__ 會指向誰呢？會指向 Object.prototype
console.log(Person.prototype.__proto__ === Object.prototype) // true
  
// 那 Object.prototype.__proto__ 又會指向誰呢？會指向 null，這就是原型鍊的頂端了
console.log(Object.prototype.__proto__) // null
```

## 構造函數 ( Constructor ) 和一般函数

```js
// 構造函數
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

// 創建 Person 物件實例
var person1 = new Person("Tom", 25);
var person2 = new Person("Jerry", 30);

console.log(person1.name); // 輸出 "Tom"
console.log(person2.age); // 輸出 30

// prototype
console.log(person1.surname); // 輸出 Jones
console.log(person2.surname); // 輸出 Jones

// 一般函數
function add(a, b) {
  return a + b;
}

var sum = add(2, 3);

console.log(sum); // 輸出 5
```

## this & 箭頭凾式

[淺談 JavaScript 頭號難題 this：絕對不完整，但保證好懂](https://blog.techbridge.cc/2019/02/23/javascript-this/)

* 箭頭函式中的 this 始終指向外部詞法作用域中的 this，而傳統函式中的 this 值則取決於函式被調用時的上下文對象。

```js
const obj = {
  name: 'Alice',
  sayHello: () => {
    console.log(`Hello, my name is ${this.name}`); // 箭頭函式中的 this 始終指向外部詞法作用域中的 this，即全域對象
  },
  sayHi: function() {
    console.log(`Hi, my name is ${this.name}`); // 傳統函式中的 this 取決於調用該函式的對象，即 obj
  }
};

obj.sayHello(); // Hello, my name is undefined
obj.sayHi(); // Hi, my name is Alice
```

* 箭頭函式中的 this 在定義時就固定了，而不會隨著使用時的脈絡而改變。

```js
const obj = {
  name: 'Alice',
  sayHello: function() {
    const greet = () => {
      console.log(`Hello, my name is ${this.name}`); // 箭頭函式中的 this 在定義時就固定了，即 obj 的 this
    }
    greet();
  }
};

obj.sayHello(); // Hello, my name is Alice
```

* 在傳統函式中，如果函式沒有被綁定到一個對象上，this 的值將是全域對象（在瀏覽器中是 window 對象）。

```js
function sayHi() {
  console.log(`Hi, my name is ${this.name}`); // 沒有綁定到對象上，this 的值將是全域對象
}

name = 'Bob';
sayHi(); // Hi, my name is Bob
```

* 為避免在回調函式中出現 this 綁定問題，通常會在構造函式中將 this 綁定到回調函式中，或使用箭頭函式來確保 this 指向當前元件實例。

```js
class Counter {
  constructor() {
    this.count = 0;
  }

  increment() {
    setTimeout(function() {
      // 沒有將 this 綁定到 Counter 的實例，this 的值將是全域對象
      console.log(`Count is ${this.count}`);
    }, 1000);
  }

  incrementArrow() {
    setTimeout(() => {
      // 使用箭頭函式確保 this 指向當前元件實例
      console.log(`Count is ${this.count}`);
    }, 1000);
  }
}

const counter = new Counter();
counter.increment(); // Count is undefined
counter.incrementArrow(); // Count is 0（1 秒後顯示）
```

## callback function

回调函数指的是将一个函数作为参数传递给另一个函数，并在后者的执行过程中被调用的函数。

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

* 如果需要動態綁定 this，仍需使用傳統函式語法。

```js
// 傳統函式中的 this 取決於函式被調用時的上下文對象
const obj1 = {
  name: 'Object 1',
  sayName: function() {
    console.log(this.name);
  }
};

const obj2 = {
  name: 'Object 2'
};

obj1.sayName(); // 輸出 Object 1
obj1.sayName.call(obj2); // 輸出 Object 2

function foo() {
  console.log(this);
}

foo(); // 輸出 window

// 箭頭函式中的 this 始終指向外部詞法作用域中的 this
const obj3 = {
  name: 'Object 3',
  sayName: () => {
    console.log(this.name);
  }
};

const obj4 = {
  name: 'Object 4'
};

obj3.sayName(); // 輸出 undefined

// obj3.sayName 傳遞給 call 函式，用 obj4 來動態調用改變 this 的值
obj3.sayName.call(obj4); // 輸出 undefined
```

---

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

## ES6 ( ES2015 )

[JavaScript ES6 介紹](https://www.fooish.com/javascript/ES6/)

ES6 其實是一個泛指的名詞，泛指 ES5.1 版以後的新一代 JavaScript 語言標準，涵蓋了 ES2015, ES2016, ES2017 等等，ES2015 則是正式名稱，特指該年度發佈的語言標準，現在常聽到人家說的 ES6，一般是指 ES2015 標準。

### [ES6] Syntax 解構賦值（Destructuring assignment）

### [ES6] 展開語法（Spread Syntax）

### [ES6] 其餘語法 ( Rest Syntax )

### [ES6] Class

JavaScript 是一種無 class 語言。ES6 class 中引入的主要是對現有的基於原型的繼承模型的語法糖，
可以定义一个对象的属性和方法，可以利用 继承、静态方法、实例方法、构造函数、new 等特性，創造更複雜的 class。

[javascript-class-method-vs-class-prototype-method](https://stackoverflow.com/questions/1635116/javascript-class-method-vs-class-prototype-method)

```js
Class.method = function () { /* code */ }
Class.prototype.method = function () { /* code using this.values */ }

// 構造函數 
function MyClass (firstName, lastName) {

  // es5
  this.firstName = firstName;
  this.lastName = lastName;
  // es6
  constructor(firstName, lastName) {
      this.firstName = firstName;
      this.lastName = lastName;
  }

  var privateVariable; // private member only available within the constructor fn

  // es5
  this.privilegedMethod = function (obj) { // it can access private members
    return obj.constructor === MyClass;
  };

  // es6
  static privilegedMethod(obj) {
    return obj.constructor === Person;
  }

  // es6
  publicMethod() {
      return `Hi ${this.firstName}`;
  }
}

var aminu = new MyClass("Aminu", "Abubakar");
MyClass.privilegedMethod(aminu); // will return true

// A 'static method', it's just like a normal function 
// it has no relation with any 'MyClass' object instance
MyClass.staticMethod = function () {}; 

// es5
MyClass.prototype.publicMethod = function () {
  // instance method
  // the 'this' keyword refers to the object instance
  // you can access only 'privileged' and 'public' members
};

var myObj = new MyClass(); // new object instance

myObj.publicMethod();
MyClass.staticMethod();
```

#### super

> super () 使用父類別的建構函式

```js
class Father{
    constructor(age,weight){
        this.age=age;
        this.weight=weight;
    }
}

class Child extends Father {
	constructor(age,weight,power){
    // 如果在super()之前就呼叫this 的話，會refference error
		super();
		this.power=power;		
	}
  hello(){
		console.log(`我是個有 ${this.power} 戰鬥力的SuperMAN`);
	}
}
```

> super 物件呼叫父類別的原型

* 增加屬性 / 修改屬性
* 呼叫父類別的方法
* 使用父類別 prototype 中的屬性