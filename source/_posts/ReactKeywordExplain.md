---
title: [React] Keyword Explain
date: 2023-03-25
categories: React
author: johch3n611u
tags:
- Note
- React
---

## React、ReactDOM Library

* [React](https://www.npmjs.com/package/react)：用於創建用戶界面的函式庫，只有定義元件所必需的功能，通常與渲染器一起使用。

React is a JavaScript library `for creating user interfaces`. 

The react package contains `only the functionality necessary to define React components`. `It is typically used together with a React renderer` like react-dom for the web, or react-native for the native environments.

* [ReactDOM](https://www.npmjs.com/package/react-dom)：渲染器函式庫，用於渲染元件、掛載模組、操作 DOM、創建 SPA 根結點、提供 JSX 解析

This package serves as the `entry point to the DOM` and `server renderers for React`. `It is intended to be paired with the generic React package`, which is shipped as react to npm.

## Virtual DOM

* repaint 重繪
* reflow 回流

## Create-React-App ( cli )

* @babel/plugin-proposal-class-properties ( 可省略建構子直接寫 state )

## React 命名規則

* JSX 屬性、變數、函式、事件處理器 "小駝峰"，類別、元件則是 "大駝峰"

## JSX

JavaScript XML  ( JSX )：透過 JSX 等於我們可以直接把 HTML 放到 JavaScript 中去操作，不再需要先用 querySelector 去選到該元素後才能換掉，而是可以在 HTML 中直接帶入 JavaScript 的變數。

* ReactDOM Library 提供 JSX 解析
* JSX 的內容可以放到 () 內當成變數
* 避免關鍵字衝突，在 JSX 中把原本的屬性都改成用小駝峰命名 className
* 避免關鍵字衝突，在 JSX 中 for = htmlFor
* 表達式只能返回一個值 ( 根節點 ) 或用 `<React.Fragment>`、`<></>` 容器
* InlineStyle Css 屬性需要改為駝峰式
* JSX 中標籤內如果沒有內容的話可以自己關閉 `<div />` 所以不用 `<div></div>`
* 想要深入了解 babel.js 如何編譯 JSX 可以問 ChatGPT `jsx 中 <button onClick={pop()} /> 與 <button onClick={pop} /> 會被 babel.js 編譯為什麼`
* InlineStyle 必須要 {}

```js
const someStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
};

const Counter = (
  <div className="container" style={someStyle}>
    <div className="chevron chevron-up" />
    <div className="number">256</div>
    <div className="chevron chevron-down" style={{
      color: '#FFE8E8',
      textShadow: '2px 2px #434a54',
    }} />
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(Counter); // JSX
```

### 事件處理器（Event Handlers）

* JSX {} 內為 JS 表達式（Expression）
* 函式後面沒有 () 不會立即執行，透過此種方法就比較不會有參數外漏在 html 的狀況
* handleClick() 包在一個函式中不被立即執行
* 透過箭頭函式回傳函式或 Callback Function

我猜應該是因為 JSX 其實就像是 JS 導致寫在這的函式變為 IIFE 而不是傳統意義上的 Html onclick

```js
<div key={ id } data-id={ id }
     onClick = { 表達式（expression）}
     onClick={handleIncrement}
     onClick={handleClick('立即執行')}
     onClick={()=>handleClick('不會立即執行')}
>256</div>

const handleIncrement = (event) => {
  const { id } = event.target.dataset;
}

function handleClick(type){
  setCount(type === 'increment' ? count + 1 : count - 1);
}

// const handleClick = (type) => () =>
//   setCount(
//     type === 'increment' ? count + 1 : count - 1
//   );
```

### 不使用 If / For 流程控制邏輯操作 JSX 

在 JSX 中的 {} 內只能放入表達式（expressions）

if...else... 陳述句的取代方式會使用邏輯運算子，&& ||、三元判斷式，或利用 JS 真假值自動轉型，null、NaN、0、空字串（""、''）、undefined 轉型為「false」

For 陳述句的取代方式會透過陣列的 Array.map 原生方法並且回傳 `<Counter />` 元素

[Array.from](https://juejin.cn/post/6844903926823649293)

```JS
// 產生元素數目為 10，元素值為 0 ~ 9 的陣列
const counters = [...Array(5).keys()];
//const counters = Array.from({ length: 10 }, (_, index) => index);
// [0, 1, 2, ..., 8, 9]
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
   <div
     style={{
       display: count >= 10 && 'flex',
       flexWrap: count >= 10 ? unset : 'wrap',
     }}
   >
    // 使用 map 產生多個 <Counter />
    {counters.map((item) => (
      <Counter />
    ))}

    // {[
    //  <Counter />,
    //  <Counter />,
    //  <Counter />,
    //  ...
    // ]}
  </div>
);
```

## Props 將資料從父層組件傳遞到子層組件

* Functional Component 使用 props 傳遞資料時， key 和 value 的命名可以自己取

```Js
const ChildComponent = (props) => {
  const { firstName, lastName , inputValue } = props;
  return <h1>Hello, {firstName} {lastName} {inputValue}</h1>;
}
const FatherComponent = () => {
    const [inputValue, setInputValue] = useState(0);
    return (<ChildComponent firstName="Aaron" lastName="Chen" inputValue={inputValue} />)
};
```