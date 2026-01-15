---
title: Let you roughly understand JS
date: 2023-03-22
category: Development
author: johch3n611u
tags:
  - Javascript
  - ES6
---

Originally, I was researching the difference between React Class / Function components [[React] Functional-component vs Class-component](https://www.tpisoftware.com/tpu/articleDetails/2822), but as I read on, I realized I knew too little about the underlying Js, so I recorded some key points here for future reference.

## Statement / Expression

- Statement: `Unit of code that performs some action`. For example, `if` statements, `for` loops, function declaration statements, etc. are statements. Statements usually end with a semicolon (;), used to indicate the end of the statement.
- Expression: `Unit of code that resolves to a value`. For example, arithmetic expressions, logical expressions, function call expressions, etc. are expressions. Expressions can contain variables, constants, operators, etc., and the calculation result is usually used in other operations.

## Prototype Chain

[It's time to understand JavaScript's Prototype Chain #18](https://github.com/aszx87410/blog/issues/18)

Compared to Class-based languages like C# / Java, the original intention of JS developers was a purely Script lightweight (Object / Prototype) -based language running on the client side without Classes (ES6 Classes are just syntactic sugar). Therefore, simply using the prototype chain for inheritance allows some properties to be shared;

When a constructor constructs an instance, it generates a property `__proto__` based on the prototype (base type). The end of the prototype chain is `Object.prototype`, and looking up further is `null`.

```js
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.log = function () {
  console.log(this.name + ", age:" + this.age);
};

var nick = new Person("nick", 18);

// As mentioned, nick.__proto__ points to Person.prototype
console.log(nick.__proto__ === Person.prototype); // true

// So who does Person.prototype.__proto__ point to? It points to Object.prototype
console.log(Person.prototype.__proto__ === Object.prototype); // true

// So who does Object.prototype.__proto__ point to? It points to null, this is the end of the prototype chain
console.log(Object.prototype.__proto__); // null
```

## Constructor and Normal Function

```js
// Constructor
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype = { surname: "Jones" };
Person.prototype.log = function () {
  console.log(this.name + ", age:" + this.age);
};

console.log(nick.log === peter.log); // true
nick.log(); // nick, age:18
peter.log(); // peter, age:20

// Create Person object instance
var person1 = new Person("Tom", 25);
var person2 = new Person("Jerry", 30);

console.log(person1.name); // Output "Tom"
console.log(person2.age); // Output 30

// prototype
console.log(person1.surname); // Output Jones
console.log(person2.surname); // Output Jones

// Normal Function
function add(a, b) {
  return a + b;
}

var sum = add(2, 3);

console.log(sum); // Output 5
```

## this & Arrow Function

[Discussing JavaScript's number one problem this: Definitely not complete, but guaranteed easy to understand](https://blog.techbridge.cc/2019/02/23/javascript-this/)

- `this` in an arrow function always points to `this` in the outer lexical scope, while `this` in a traditional function depends on the context object when the function is called.

```js
const obj = {
  name: "Alice",
  sayHello: () => {
    console.log(`Hello, my name is ${this.name}`); // `this` in arrow function always points to `this` in outer lexical scope, i.e., global object
  },
  sayHi: function () {
    console.log(`Hi, my name is ${this.name}`); // `this` in traditional function depends on the object calling the function, i.e., obj
  },
};

obj.sayHello(); // Hello, my name is undefined
obj.sayHi(); // Hi, my name is Alice
```

- `this` in an arrow function is fixed at definition time and does not change with usage context.

```js
const obj = {
  name: "Alice",
  sayHello: function () {
    const greet = () => {
      console.log(`Hello, my name is ${this.name}`); // `this` in arrow function is fixed at definition time, i.e., this of obj
    };
    greet();
  },
};

obj.sayHello(); // Hello, my name is Alice
```

- In a traditional function, if the function is not bound to an object, the value of `this` will be the global object (window object in browsers).

```js
function sayHi() {
  console.log(`Hi, my name is ${this.name}`); // Not bound to an object, value of this will be global object
}

name = "Bob";
sayHi(); // Hi, my name is Bob
```

- To avoid `this` binding issues in callback functions, usually `this` is bound to the callback function in the constructor, or arrow functions are used to ensure `this` points to the current component instance.

```js
class Counter {
  constructor() {
    this.count = 0;
  }

  increment() {
    setTimeout(function () {
      // Did not bind this to Counter instance, value of this will be global object
      console.log(`Count is ${this.count}`);
    }, 1000);
  }

  incrementArrow() {
    setTimeout(() => {
      // Use arrow function to ensure this points to current component instance
      console.log(`Count is ${this.count}`);
    }, 1000);
  }
}

const counter = new Counter();
counter.increment(); // Count is undefined
counter.incrementArrow(); // Count is 0 (displayed after 1 second)
```

## Callback Function

A callback function refers to a function passed as an argument to another function and invoked during the execution of the latter.

```js
function greet(name, callback) {
  console.log("Hello, " + name + "!");
  callback();
}

function sayGoodbye() {
  console.log("Goodbye!");
}

greet("John", sayGoodbye);
```

- Handling events

```js
document.getElementById("myButton").addEventListener("click", function () {
  console.log("Button clicked!");
});
```

- Executing network requests

```js
function makeRequest(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      callback(xhr.responseText);
    }
  };
  xhr.open("GET", url, true);
  xhr.send();
}

makeRequest("https://api.example.com/data", function (data) {
  console.log("Received data:", data);
});
```

- Executing other tasks that take time to complete

```js
function doSomethingAsync(callback) {
  setTimeout(function () {
    callback("done");
  }, 1000);
}

doSomethingAsync(function (result) {
  console.log(result);
});
```

- If you need to dynamically bind `this`, you still need to use traditional function syntax.

```js
// `this` in traditional function depends on context object when function is called
const obj1 = {
  name: "Object 1",
  sayName: function () {
    console.log(this.name);
  },
};

const obj2 = {
  name: "Object 2",
};

obj1.sayName(); // Output Object 1
obj1.sayName.call(obj2); // Output Object 2

function foo() {
  console.log(this);
}

foo(); // Output window

// `this` in arrow function always points to `this` in outer lexical scope
const obj3 = {
  name: "Object 3",
  sayName: () => {
    console.log(this.name);
  },
};

const obj4 = {
  name: "Object 4",
};

obj3.sayName(); // Output undefined

// Pass obj3.sayName to call function, invoke dynamically with obj4 to change value of this
obj3.sayName.call(obj4); // Output undefined
```

### Object.entries

Directly get name and value of all properties, returned as an array

```js
let object = { a: 1, b: 2, c: 3 };

console.log(Object.entries(object));
// [
//   ["a", 1],
//   ["b", 2],
//   ["c", 3]
// ]
```

### Array.find

Method returns the value of the first element that satisfies the provided testing function. Otherwise returns undefined.

```JS
const array1 = [5, 12, 8, 130, 44];

const found = array1.find(element => element > 10);

console.log(found);
// Expected output: 12
```

### Array.includes

Method determines whether an array includes a certain value among its entries, returning true or false as appropriate.

```JS
const array1 = [1, 2, 3];

console.log(array1.includes(2));
// Expected output: true

const pets = ['cat', 'dog', 'bat'];

console.log(pets.includes('cat'));
// Expected output: true

console.log(pets.includes('at'));
// Expected output: false
```

### || [] Usage Scenario

If `.find()` finds nothing (returns undefined), it becomes `[weatherType] = [];`. This is to avoid errors when `[weatherType]` receives `undefined` (not an array) during destructuring assignment.

```JS
const [weatherType] =
    Object.entries(weatherTypes).find(([weatherType, weatherCodes]) =>
      weatherCodes.includes(Number(weatherCode))
    ) || [];
```

---

```
What is JavaScript?
How is JavaScript different from Java?
What are data types in JavaScript? How to check data type of a variable?
What is scope in JavaScript? How to declare variables to make them available in specific scope?
What are closures? What is their function?
What is prototype? How to use it to create objects?
What is JavaScript event loop? How does it relate to synchronous and asynchronous programming?
How to create objects using JavaScript? What is a constructor?
What is a callback function? How to use them to handle asynchronous events?
What is a Promise? How to use them to handle asynchronous events?
What are arrow functions? How are they different from normal functions?
What is ES6 (ECMAScript 6)? What new features and syntax does it bring?
What are JavaScript REST parameters? How to use them?
What is destructuring? How to use them to handle objects and arrays in JavaScript?
What are closures? What is their function?
What is IIFE (Immediately Invoked Function Expression)?
Event Loop? How does it work?
How to implement Inheritance? What types of inheritance does JavaScript support?
Closure? Can you give an example using closure?
Difference between call(), apply() and bind()?
How to avoid JavaScript "Callback Hell"?
Difference between Arrow Functions and traditional functions?
Difference between var, let and const?
How to handle Asynchronous Programming in JavaScript?
Concept of Prototype Inheritance?
How to use Promise for asynchronous operations, how does it work?
What is hoisting (variable hoisting)?
Event Delegation? What are its advantages?
What is DOM (Document Object Model)? How to manipulate DOM?
RESTful API? How to call them using JavaScript?
Difference between synchronous and asynchronous? How to do synchronous and asynchronous programming using JavaScript?
What is CORS (Cross-Origin Resource Sharing)? How to handle it in JavaScript?
Event bubbling and event capturing? What is the difference?
What is Event? How to handle events?
Virtual DOM? What are its advantages?
How to implement Modularization using JavaScript?
What is Strict Mode? What are its advantages?
AJAX? How to make AJAX requests using JavaScript?
What are Event Delegation and Event Binding? What are their differences?
Immediately Invoked Function Expression, IIFE? What is its function?
How to make network requests using fetch() method in JavaScript?
HTTP Cookies? How to manipulate Cookies using JavaScript?
What is Destructuring Assignment? What are its advantages?
Template Literals? What are their advantages?
What is Code Injection? How to avoid it?
Data Structures? What are common data structures in JavaScript? How to implement them?
What is Prototype Inheritance? How does it differ from traditional inheritance?
Promise? How to use Promise for asynchronous programming?
What is Scope? How is it related to Closure?
Higher-Order Function? What is its function?
What is Arrow Function? How does it differ from traditional function?
Proxy? How to use Proxy to listen to object operations?
What is Event Loop? What is its function?
Map and Set? How do they differ from traditional arrays?
What is Same-Origin Policy? How does it protect web security?
Module in JavaScript? What are its advantages?
What is async/await? How does it simplify asynchronous programming?
Currying in JavaScript? What are its advantages?
What is Event Bubbling? What is its function?
Callback in JavaScript? How to use callback functions for asynchronous programming?
What is Prototype Chain? What is its function?
Functional Programming in JavaScript? How does it differ from Object-Oriented Programming?
What is Event? How is it related to DOM?
Garbage Collection in JavaScript? How does it work?
What is Template Literal? How does it differ from traditional strings?
Function Currying in JavaScript? What are its advantages?
What is Event Loop? How does it handle asynchronous programming?
Closure in JavaScript? What is its function?
What is IIFE? What is its function?
Prototype Inheritance in JavaScript? How does it differ from traditional inheritance?
What is Arrow Function? How does it differ from traditional function?
Promise in JavaScript? How does it simplify asynchronous programming?
What is Variable Scope? How does it differ from Scope Chain?
Cross-Origin Request in JavaScript? How to implement it?
What is Modularization? What is its function?
Recursion in JavaScript? How to implement it? How does it differ from loops?
What is hoisting? How does it affect variable and function declarations?
Event Delegation in JavaScript? What is its function?
What is Binding? What is its relation to `this` keyword?
Currying in JavaScript? What is its function?
What is Strict Mode? What is its function?
Generator in JavaScript? What is its function?
What is Encapsulation? What is its function?
map() and reduce() methods in JavaScript? What are their functions?
What are Event Capturing and Event Bubbling? What are their differences?
Code Optimization in JavaScript? Can you give some examples?
Closure in JavaScript? What is its function? Can you give a practical application scenario?
What is Scope? What is its relation to Scope Chain?
Prototype in JavaScript? What is its function?
What is Event Loop? How does it handle asynchronous tasks?
Arrow Function in JavaScript? What are its advantages?
What is promise? How does it handle asynchronous operations?
Variable Hoisting in JavaScript? How does it affect code execution?
What is Module? What is its function?
Class in JavaScript? What is its relation to prototype?
Difference between Mutable and Immutable data types? Give some examples.
```

## ES6 ( ES2015 )

[JavaScript ES6 Introduction](https://www.fooish.com/javascript/ES6/)

ES6 is actually a general term referring to the new generation of JavaScript language standards after ES5.1, covering ES2015, ES2016, ES2017, etc. ES2015 is the official name, specifically referring to the language standard released that year. Nowadays when people say ES6, they generally refer to the ES2015 standard.

### [ES6] Arrow Function

Arrow function: `const component = () => (/*return*/);`

### [ES6] Syntax Destructuring assignment

```js
const { observationTime, locationName, temperature, windSpeed, description, weatherCode, rainPossibility, comfortability, isLoading } = weatherElement;
```

### [ES6] Spread Syntax

### [ES6] Rest Syntax

### [ES6] Class

JavaScript is a Class-less language. Classes introduced in ES6 are mainly syntactic sugar for the existing prototype-based inheritance model.
You can define properties and methods of an object, and can use inheritance, static methods, instance methods, constructors, `new` and other features to create more complex classes.

[javascript-class-method-vs-class-prototype-method](https://stackoverflow.com/questions/1635116/javascript-class-method-vs-class-prototype-method)

```js
Class.method = function () { /* code */ }
Class.prototype.method = function () { /* code using this.values */ }

// Constructor
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

> `super()` uses the parent class's constructor

```js
class Father {
  constructor(age, weight) {
    this.age = age;
    this.weight = weight;
  }
}

class Child extends Father {
  constructor(age, weight, power) {
    // Calling this before super() will result in a reference error
    super();
    this.power = power;
  }
  hello() {
    console.log(`I am a SuperMAN with ${this.power} combat power`);
  }
}
```

> `super` object calls the parent class's prototype

- Add properties / Modify properties
- Call parent class methods
- Use properties in parent class's prototype
