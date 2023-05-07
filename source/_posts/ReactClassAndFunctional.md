---
title: React:Class-based & Functional Component
date: 2023-03-25
categories: Dev Tech
author: johch3n611u
tags:
- Note
- React
---

|Class-based|Functional Component|
|-------------|-------------|
|<ul><li>需繼承 React.Component</li><li>具有生命週期，可以針對某些情境決定是否渲染</li><li>需要在設置 State ( Stateful Component )</li><li>每次都可以拿到最新的 this.props，因為 this 隨時都在變化</li><li>[需要比較多 JS 的背景知識](/Javascript/LetYouRoughlyUnderstandJsBasics/)</li><li>不能使用 Hook</li><li>需定義 render() 並將要渲染到畫面上的內容 return</li><li>this 必須在一開始被指向才可以使用</li></ul>|<ul><li>2019 年 v16.8 Hooks 釋出後的主流寫法</li><li>單純只是一個普通的 JavaScript 函式</li><li>感覺很像 Vue 3</li><li>生命週期要透過 useEffect Hook</li><li>無狀態組件 State（Stateless）要透過 useState Hook</li><li>可以用 Arrow Function 宣告或是一般的 Function</li><li>編譯快程式碼更少，不用將 Class 轉換成 ES5，不繼承 React Component</li><li>閉包的特性 props 會一直是原本傳進來的那個，而不會跟著外層狀態更新，必須透過 Hook 管控狀態</li><li>閉包的特性 this 會直接綁定元件本身</li><li>分離容器組件和展示組件會變得更容易</li></ul>|

## Class-based

```js
class Car extends React.Component { 
  constructor() { 
    super(props); // 要在 constructor 中使用才需要 super
    this.state = { name: "miaHsu" };
    this.handleInput = this.handleInput.bind(this);
  }

  handleInput(e) {
    this.setState({ input: e.target.value });
  }

  render() {
    <input onChange={handleInput} value={this.state.name} />
    <h2>Hi, I am a {this.props.name}!</h2>; // 不需要 super 也可以使用 this.props
  }

  this.setState({name: 'BrainLin'});
}
```

## Functional Component

```js
function Car(props) {
  const [name, setName] = useState("miaHsu");

  function handleInput(e) {
    setName(e.target.value);
  }

  return (
    <div>
      <input onChange={handleInput} value={name} />
      <h2>Hi, I am a {props.name}!</h2>
      <button onClick={() => setName('BrainLin')}>Change Name</button>
    </div>
  );
}

let Car = (props) => {
  return <h2>Hi, I am a {props.name}!</h2>;
}
```

## Functional Programming

一種程式設計風格，避免改變狀態和可變數據，使用遞歸和高階函數，實現代碼簡潔、易於測試、避免產生錯誤

```js
// No Functional Programming
const arr = [1, 2, 3, 4, 5, 6];

let result = [];
for (let i = 0; i < arr.length; i++) {
  if (arr[i] % 2 === 0) {
    result.push(arr[i] * 2);
  }
}

// Functional Programming
result = arr.filter((x) => x % 2 === 0).map((x) => x * 2);
```

## Hooks

[[React Hook 筆記] Custom Hooks 之打造自己的 Hook](https://medium.com/hannah-lin/react-hook-%E7%AD%86%E8%A8%98-custom-hooks-%E4%B9%8B%E6%89%93%E9%80%A0%E8%87%AA%E5%B7%B1%E7%9A%84-hook-b046f6778f33)

* Hook：React 16.8版本引入的一個新特性，提供了在 Functional Component 使用 State、Lifecycle 管理不同的狀態或實現不同的功能的統一稱呼；
* Custom Hook / Hook：其實就只是 JS Function 抽出來利於重覆利用，一樣可以使用 React 就有提供的 Hooks，但必須以 「 use 」為開頭命名的 JavaScript function，並在最後 回傳的是一些資料或改變資料的方法。

* Hook 方法不能在條件式、迴圈或嵌套函式中呼叫：這是因為 Hook 的調用順序是有要求的，如果在條件式、迴圈或嵌套函式中呼叫 Hook，可能會導致 Hook 調用的順序錯誤，從而導致組件的行為出現問題。

* 透過 use() 產出的變數和方法，可以在判斷式內使用：這是因為在 React 中，為了避免在渲染期間過多地重新創建對象，Hook 中返回的狀態和方法通常是經過優化的，因此可以在判斷式內使用，而不會導致渲染問題。

```js
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  // 定義狀態為 value 的變數
  const [value, setValue] = useState(() => {
    // 從 localStorage 中獲取對應 key 的值
    const item = window.localStorage.getItem(key);
    // 如果 localStorage 中有值，返回該值，否則返回初始值
    return item ? JSON.parse(item) : initialValue;
  });

  useEffect(() => {
    // 在每次 value 改變時，將對應 key 的值更新到 localStorage 中
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  // 返回一個包含 value 和 setValue 的對象
  return { value, setValue };
}
```

## Pure Component / React.memo ( HOC ) Higher Order Component 

https://ithelp.ithome.com.tw/articles/10241071

* shouldComponentUpdate()：Class-based Lifecycle 改變 State 之後、執行 Render 之前，回傳值決定了 Render 是否執行
* Pure Component：[高階組件就是一個函數，傳給它一個組件，它返回一個新的組件](https://hackmd.io/@chrisHsiao/r1ZJu76DD)
* memo：Functional Component 後透過 memo 監控 props 發生變化時才會重新渲染

```js
import React, { memo } from 'react';

function MyComponent(props) {
    return (
      <div>
        <h2>{props.title}</h2>
        <p>{props.content}</p>
      </div>
    );
}

export default memo(MyComponent);
```

## 參考

* [React Class-based vs Functional Component 從特性淺談兩種寫法之異同](https://linyencheng.github.io/2020/02/02/react-component-class-based-vs-functional/)
* [從 Hooks 開始，讓你的網頁 React 起來系列](https://ithelp.ithome.com.tw/users/20103315/ironman/2668?sc=hot)
* [Functional-component vs Class-component](https://www.tpisoftware.com/tpu/articleDetails/2822)
* [React Class Components](https://www.w3schools.com/react/react_class.asp)
* [functional-vs-class-components](https://djoech.medium.com/functional-vs-class-components-in-react-231e3fbd7108)
* [React初心者30天的探索之路 [Day 07] Functional Component v.s Class Component](https://ithelp.ithome.com.tw/articles/10234746)
* [Call child method from parent](https://stackoverflow.com/questions/37949981/call-child-method-from-parent)