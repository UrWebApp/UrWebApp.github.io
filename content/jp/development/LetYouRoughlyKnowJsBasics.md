---
title: JS を大まかに理解させる
date: 2023-03-22
category: Development
author: johch3n611u
tags:
  - Javascript
  - ES6
---

元々は React Class / Function コンポーネントの違い [[React] Functional-component vs Class-component](https://www.tpisoftware.com/tpu/articleDetails/2822) を研究していましたが、読んでいるうちに基礎となる JS についての知識が少なすぎることに気づいたため、後で参照できるように重要なポイントをここに記録しました。

## 文（Statement）/ 式（Expression）

- Statement（文）：`何らかの操作を実行するコードの単位`。たとえば、if 文、for ループ、関数宣言文などはすべて文です。文は通常、文の終わりを示すセミコロン (;) で終わります。
- Expression（式）：`値を生成するために使用されるコードの単位`。たとえば、算術式、論理式、関数呼び出し式などはすべて式です。式には変数、定数、演算子などを含めることができ、計算結果は通常他の操作で使用されます。

## プロトタイプチェーン ( prototype chain )

[そろそろ JavaScript のプロトタイプチェーンを理解しよう #18](https://github.com/aszx87410/blog/issues/18)

C# / Java などのクラスベースの言語と比較して、JS 開発者の当初の目的は、クライアント側でクラスなし (ES6 の Class も単なるシンタックスシュガーにすぎない) で実行される純粋なスクリプト軽量 (Object / Prototype) ベースであったため、プロトタイプチェーンを使用して継承を行うという単純な特性により、一部のプロパティを共有できます。

コンストラクタがインスタンスを構築するとき、プロトタイプ（基本型）に基づいてプロパティ `__proto__` を生成します。プロトタイプチェーンの終わりは `Object.prototype` であり、さらに上を探すと `null` になります。

```js
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.log = function () {
  console.log(this.name + ", age:" + this.age);
};

var nick = new Person("nick", 18);

// 先ほど述べたように、nick.__proto__ は Person.prototype を指します
console.log(nick.__proto__ === Person.prototype); // true

// では Person.prototype.__proto__ は誰を指すのでしょうか？Object.prototype を指します
console.log(Person.prototype.__proto__ === Object.prototype); // true

// では Object.prototype.__proto__ は誰を指すのでしょうか？null を指します。これがプロトタイプチェーンの頂点です
console.log(Object.prototype.__proto__); // null
```

## コンストラクタ ( Constructor ) と通常関数

```js
// コンストラクタ
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

// Person オブジェクトのインスタンスを作成
var person1 = new Person("Tom", 25);
var person2 = new Person("Jerry", 30);

console.log(person1.name); // 出力 "Tom"
console.log(person2.age); // 出力 30

// prototype
console.log(person1.surname); // 出力 Jones
console.log(person2.surname); // 出力 Jones

// 通常関数
function add(a, b) {
  return a + b;
}

var sum = add(2, 3);

console.log(sum); // 出力 5
```

## this & アロー関数

[JavaScript 最大の難問 this について語る：間違いなく不完全だが、わかりやすさは保証する](https://blog.techbridge.cc/2019/02/23/javascript-this/)

- アロー関数内の `this` は常に外部のレキシカルスコープ内の `this` を指しますが、従来の関数内の `this` の値は、関数が呼び出されたときのコンテキストオブジェクトに依存します。

```js
const obj = {
  name: "Alice",
  sayHello: () => {
    console.log(`Hello, my name is ${this.name}`); // アロー関数内の this は常に外部レキシカルスコープの this、つまりグローバルオブジェクトを指す
  },
  sayHi: function () {
    console.log(`Hi, my name is ${this.name}`); // 従来の関数内の this は関数を呼び出したオブジェクト、つまり obj に依存する
  },
};

obj.sayHello(); // Hello, my name is undefined
obj.sayHi(); // Hi, my name is Alice
```

- アロー関数内の `this` は定義時に固定され、使用時のコンテキストによって変化しません。

```js
const obj = {
  name: "Alice",
  sayHello: function () {
    const greet = () => {
      console.log(`Hello, my name is ${this.name}`); // アロー関数内の this は定義時に固定される、つまり obj の this
    };
    greet();
  },
};

obj.sayHello(); // Hello, my name is Alice
```

- 従来の関数では、関数がオブジェクトにバインドされていない場合、`this` の値はグローバルオブジェクト（ブラウザでは window オブジェクト）になります。

```js
function sayHi() {
  console.log(`Hi, my name is ${this.name}`); // オブジェクトにバインドされていないため、this の値はグローバルオブジェクトになります
}

name = "Bob";
sayHi(); // Hi, my name is Bob
```

- コールバック関数での `this` バインディングの問題を回避するために、通常、コンストラクタで `this` をコールバック関数にバインドするか、アロー関数を使用して `this` が現在のコンポーネントインスタンスを指すようにします。

```js
class Counter {
  constructor() {
    this.count = 0;
  }

  increment() {
    setTimeout(function () {
      // this を Counter のインスタンスにバインドしていないため、this の値はグローバルオブジェクトになります
      console.log(`Count is ${this.count}`);
    }, 1000);
  }

  incrementArrow() {
    setTimeout(() => {
      // アロー関数を使用して this が現在のコンポーネントインスタンスを指すようにする
      console.log(`Count is ${this.count}`);
    }, 1000);
  }
}

const counter = new Counter();
counter.increment(); // Count is undefined
counter.incrementArrow(); // Count is 0（1秒後に表示）
```

## コールバック関数 (Callback Function)

コールバック関数とは、引数として別の関数に渡され、後者の実行中に呼び出される関数のことです。

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

- イベントの処理

```js
document.getElementById("myButton").addEventListener("click", function () {
  console.log("Button clicked!");
});
```

- ネットワークリクエストの実行

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

- 完了までに時間がかかるその他のタスクの実行

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

- `this` を動的にバインドする必要がある場合は、従来の関数構文を使用する必要があります。

```js
// 従来の関数内の this は関数が呼び出されたときのコンテキストオブジェクトに依存する
const obj1 = {
  name: "Object 1",
  sayName: function () {
    console.log(this.name);
  },
};

const obj2 = {
  name: "Object 2",
};

obj1.sayName(); // 出力 Object 1
obj1.sayName.call(obj2); // 出力 Object 2

function foo() {
  console.log(this);
}

foo(); // 出力 window

// アロー関数内の this は常に外部レキシカルスコープの this を指す
const obj3 = {
  name: "Object 3",
  sayName: () => {
    console.log(this.name);
  },
};

const obj4 = {
  name: "Object 4",
};

obj3.sayName(); // 出力 undefined

// obj3.sayName を call 関数に渡し、obj4 を使って動的に呼び出し、this の値を変更する
obj3.sayName.call(obj4); // 出力 undefined
```

### Object.entries

すべてのプロパティの name と value を直接取得し、配列として返します。

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

メソッドは、提供されたテスト関数を満たす最初の要素の値を返します。そうでない場合は undefined を返します。

```JS
const array1 = [5, 12, 8, 130, 44];

const found = array1.find(element => element > 10);

console.log(found);
// Expected output: 12
```

### Array.includes

メソッドは、配列に特定の要素が含まれているかどうかを判断し、それに応じて true または false を返します。

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

### || [] 使用シナリオ

.find() で何も見つからなかった（undefined を返した）場合、`[weatherType] = [];` になります。これは、分割代入時に `[weatherType]` が `undefined`（非配列）を受け取り、エラーが発生するのを避けるためです。

```JS
const [weatherType] =
    Object.entries(weatherTypes).find(([weatherType, weatherCodes]) =>
      weatherCodes.includes(Number(weatherCode))
    ) || [];
```

---

```
JavaScriptとは何ですか？
JavaScriptとJavaの違いは何ですか？
JavaScriptのデータ型は何ですか？変数のデータ型を確認するにはどうすればよいですか？
JavaScriptのスコープとは何ですか？特定のスコープで変数を利用できるように宣言するにはどうすればよいですか？
クロージャとは何ですか？それらの役割は何ですか？
プロトタイプとは何ですか？オブジェクトを作成するためにどのように使用しますか？
JavaScriptのイベントループとは何ですか？同期および非同期プログラミングとどのような関係がありますか？
JavaScriptを使用してオブジェクトを作成するにはどうすればよいですか？コンストラクタとは何ですか？
コールバック関数とは何ですか？非同期イベントを処理するためにどのように使用しますか？
Promiseとは何ですか？非同期イベントを処理するためにどのように使用しますか？
アロー関数とは何ですか？通常の関数とどう違いますか？
ES6（ECMAScript 6）とは何ですか？どのような新しい機能と構文をもたらしましたか？
JavaScriptのRESTパラメータとは何ですか？どのように使用しますか？
分割代入とは何ですか？JavaScriptでオブジェクトや配列を処理するためにどのように使用しますか？
クロージャとは何ですか？それらの役割は何ですか？
IIFE（即時実行関数式）とは何ですか？
イベントループ（Event Loop）とは？どのように機能しますか？
継承（Inheritance）をどのように実装しますか？JavaScriptはどのような種類の継承をサポートしていますか？
クロージャ（Closure）とは？クロージャを使用した例を挙げられますか？
call()、apply()、bind()の違いは何ですか？
JavaScriptの「コールバック地獄」（Callback Hell）を回避するにはどうすればよいですか？
アロー関数（Arrow Functions）と従来の関数の違いは何ですか？
var、let、constの違いは何ですか？
JavaScriptでの非同期プログラミング（Asynchronous Programming）をどのように処理しますか？
プロトタイプ継承（Prototype Inheritance）の概念は？
非同期操作にPromiseを使用する方法とその仕組みは？
hoisting（変数巻き上げ）とは何ですか？
イベント委譲（Event Delegation）とは？どのような利点がありますか？
DOM（Document Object Model）とは何ですか？DOMをどのように操作しますか？
RESTful APIとは？JavaScriptを使用してそれらを呼び出すにはどうすればよいですか？
同期と非同期の違いは何ですか？JavaScriptを使用して同期および非同期プログラミングを行うにはどうすればよいですか？
CORS（Cross-Origin Resource Sharing）とは何ですか？JavaScriptでどのように処理しますか？
イベントバブリングとイベントキャプチャリングとは？違いは何ですか？
イベント（Event）とは何ですか？イベントをどのように処理しますか？
仮想DOM（Virtual DOM）とは？どのような利点がありますか？
JavaScriptを使用してモジュール化（Modularization）を実装するにはどうすればよいですか？
厳格モード（Strict Mode）とは何ですか？どのような利点がありますか？
AJAXとは？JavaScriptを使用してAJAXリクエストを行うにはどうすればよいですか？
イベント委譲（Event Delegation）とイベントバインディング（Event Binding）とは何ですか？違いは何ですか？
即時実行関数式（Immediately Invoked Function Expression, IIFE）とは？どのような役割がありますか？
JavaScriptのfetch()メソッドを使用してネットワークリクエストを行うにはどうすればよいですか？
HTTP Cookieとは？JavaScriptを使用してCookieを操作するにはどうすればよいですか？
分割代入（Destructuring Assignment）とは何ですか？どのような利点がありますか？
テンプレートリテラル（Template Literals）とは？どのような利点がありますか？
コードインジェクション（Code Injection）とは何ですか？それを回避するにはどうすればよいですか？
データ構造とは？JavaScriptにはどのような一般的なデータ構造がありますか？それらをどのように実装しますか？
プロトタイプ継承（Prototype Inheritance）とは何ですか？従来の継承方法とどう違いますか？
Promiseとは？非同期プログラミングにPromiseを使用するにはどうすればよいですか？
スコープ（Scope）とは何ですか？クロージャ（Closure）とどのような関連がありますか？
高階関数（Higher-Order Function）とは？どのような役割がありますか？
アロー関数（Arrow Function）とは何ですか？従来の関数とどう違いますか？
Proxyとは？オブジェクトの操作を監視するためにProxyをどのように使用しますか？
イベントループ（Event Loop）とは何ですか？どのような役割がありますか？
MapとSetとは？従来の配列とどう違いますか？
同一生成元ポリシー（Same-Origin Policy）とは何ですか？Webセキュリティをどのように保護しますか？
JavaScriptのモジュール（Module）とは？どのような利点がありますか？
async/awaitとは何ですか？非同期プログラミングをどのように簡素化しますか？
JavaScriptのカリー化（Currying）とは？どのような利点がありますか？
イベントバブリング（Event Bubbling）とは何ですか？どのような役割がありますか？
JavaScriptのコールバック関数（Callback）とは？非同期プログラミングにコールバック関数をどのように使用しますか？
プロトタイプチェーン（Prototype Chain）とは何ですか？どのような役割がありますか？
JavaScriptの関数型プログラミング（Functional Programming）とは？オブジェクト指向プログラミングとどう違いますか？
イベント（Event）とは何ですか？DOMとどのように関連していますか？
JavaScriptのガベージコレクション（Garbage Collection）とは？どのように機能しますか？
テンプレートリテラル（Template Literal）とは何ですか？従来の文字列とどう違いますか？
JavaScriptの関数カリー化（Function Currying）とは？どのような利点がありますか？
イベントループ（Event Loop）とは何ですか？非同期プログラミングをどのように処理しますか？
JavaScriptのクロージャ（Closure）とは？どのような役割がありますか？
IIFEとは何ですか？どのような役割がありますか？
JavaScriptのプロトタイプ継承（Prototype Inheritance）とは？従来の継承とどう違いますか？
アロー関数（Arrow Function）とは何ですか？従来の関数とどう違いますか？
JavaScriptのPromiseとは？非同期プログラミングをどのように簡素化しますか？
変数スコープ（Variable Scope）とは何ですか？スコープチェーンとどう違いますか？
JavaScriptのクロスオリジンリクエスト（Cross-Origin Request）とは？どのように実装しますか？
モジュール化（Modularization）とは何ですか？どのような役割がありますか？
JavaScriptの再帰（Recursion）とは？どのように実装しますか？ループとどう違いますか？
hoistingとは何ですか？変数宣言と関数宣言にどのように影響しますか？
JavaScriptのイベント委譲（Event Delegation）とは？どのような役割がありますか？
バインディング（Binding）とは何ですか？thisキーワードとどのような関係がありますか？
JavaScriptのcurryingとは？どのような役割がありますか？
厳格モード（Strict Mode）とは何ですか？どのような役割がありますか？
JavaScriptのジェネレーター（Generator）とは？どのような役割がありますか？
カプセル化（Encapsulation）とは何ですか？どのような役割がありますか？
JavaScriptのmap()およびreduce()メソッドとは？それらの役割は何ですか？
イベントキャプチャリング（Event Capturing）とイベントバブリング（Event Bubbling）とは何ですか？違いは何ですか？
JavaScriptのコード最適化（Code Optimization）とは？例を挙げられますか？
JavaScriptのクロージャ（Closure）とは？役割は何ですか？実際の応用シナリオを挙げられますか？
スコープ（Scope）とは何ですか？スコープチェーン（Scope Chain）とどのような関係がありますか？
JavaScriptのプロトタイプ（Prototype）とは？役割は何ですか？
イベントループ（Event Loop）とは何ですか？非同期タスクをどのように処理しますか？
JavaScriptのアロー関数（Arrow Function）とは？どのような利点がありますか？
promiseとは何ですか？非同期操作をどのように処理しますか？
JavaScriptの変数巻き上げ（Variable Hoisting）とは？コード実行にどのように影響しますか？
モジュール（Module）とは何ですか？役割は何ですか？
JavaScriptのクラス（Class）とは？プロトタイプとどのような関係がありますか？
可変（Mutable）データ型と不変（Immutable）データ型の違いは何ですか？いくつか例を挙げてください。
```

## ES6 ( ES2015 )

[JavaScript ES6 紹介](https://www.fooish.com/javascript/ES6/)

ES6 は実際には、ES5.1 以降の新世代の JavaScript 言語標準を指す一般的な用語であり、ES2015、ES2016、ES2017 などを網羅しています。ES2015 は正式名称であり、特にその年にリリースされた言語標準を指します。現在人々が ES6 と言う場合、一般的には ES2015 標準を指します。

### [ES6] アロー関数

Arrow function： `const component = () => (/*return*/);`

### [ES6] Syntax 分割代入（Destructuring assignment）

```js
const { observationTime, locationName, temperature, windSpeed, description, weatherCode, rainPossibility, comfortability, isLoading } = weatherElement;
```

### [ES6] スプレッド構文（Spread Syntax）

### [ES6] 残余構文（Rest Syntax）

### [ES6] Class

JavaScript はクラスのない言語です。ES6 のクラスで導入されたのは、主に既存のプロトタイプベースの継承モデルに対するシンタックスシュガーです。
オブジェクトのプロパティとメソッドを定義でき、継承、静的メソッド、インスタンスメソッド、コンストラクタ、new などの機能を利用して、より複雑なクラスを作成できます。

[javascript-class-method-vs-class-prototype-method](https://stackoverflow.com/questions/1635116/javascript-class-method-vs-class-prototype-method)

```js
Class.method = function () { /* code */ }
Class.prototype.method = function () { /* code using this.values */ }

// コンストラクタ
function MyClass (firstName, lastName) {

  // es5
  this.firstName = firstName;
  this.lastName = lastName;
  // es6
  constructor(firstName, lastName) {
      this.firstName = firstName;
      this.lastName = lastName;
  }

  var privateVariable; // コンストラクタ関数内でのみ使用可能なプライベートメンバー

  // es5
  this.privilegedMethod = function (obj) { // プライベートメンバーにアクセス可能
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
MyClass.privilegedMethod(aminu); // true を返す

// '静的メソッド'、これは単なる通常の関数のようなものです
// どの 'MyClass' オブジェクトインスタンスとも関係ありません
MyClass.staticMethod = function () {};

// es5
MyClass.prototype.publicMethod = function () {
  // インスタンスメソッド
  // 'this' キーワードはオブジェクトインスタンスを指します
  // 'privileged' および 'public' メンバーにのみアクセスできます
};

var myObj = new MyClass(); // 新しいオブジェクトインスタンス

myObj.publicMethod();
MyClass.staticMethod();
```

#### super

> `super()` は親クラスのコンストラクタを使用します

```js
class Father {
  constructor(age, weight) {
    this.age = age;
    this.weight = weight;
  }
}

class Child extends Father {
  constructor(age, weight, power) {
    // super() の前に this を呼び出すと、reference error になります
    super();
    this.power = power;
  }
  hello() {
    console.log(`私は戦闘力 ${this.power} のスーパーマンです`);
  }
}
```

> `super` オブジェクトは親クラスのプロトタイプを呼び出します

- プロパティの追加 / プロパティの変更
- 親クラスのメソッドの呼び出し
- 親クラスの prototype 内のプロパティの使用
