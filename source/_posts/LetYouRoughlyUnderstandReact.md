---
title: 讓你大概搞懂 React
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

## Tools

### Create-React-App ( cli ) vs Next.js

* @babel/plugin-proposal-class-properties ( 可省略建構子直接寫 state )
* Next.js 可以做 SPA CSR 也可以 SSR，可以取代 CRA 但 CRA 做不到 Next.js 部分功能

### React Developer Tools

* 以往在使用 AG 的 Tools 只有組件檢視連結回 Html 這個功能比較好用，再者就是可以截很炫炮的模組依賴圖放在開發文件內，至於 prop 或其他功能似乎因為 debug 還是要更連結 code 不如在程式碼內放 console.log 來的方便
* React 的 Tools 看起來比較有用的是效能檢視 Profilers 、碼表 React.Suspense，原因可以看 )[Virtual DOM 章節](#virtual-dom)

## Virtual DOM

[网上都说操作真实 DOM 慢，但测试结果却比 React 更快，为什么？(尤雨溪)](https://www.zhihu.com/question/31809713)

[[Day 09] 單向資料流 & DOM 渲染策略](https://ithelp.ithome.com.tw/articles/10296750?sc=iThelpR)

* repaint 重繪
* reflow 回流

Angular 2+ 不再使用脏检查（dirty checking），采用了更高效变更检测。基于Zone.js库，它可以在Angular应用中跟踪和捕获异步事件的执行，并自动更新相关的视图部分。

相比脏检查机制，变更检测机制具有更高的性能和更好的可伸缩性，因为它只会检测与模板绑定相关的部分，而不会检测整个应用的作用域。

在Angular中，每个组件都会有一个变更检测器（ChangeDetector），用于跟踪组件的变化，并在需要时更新视图。当组件中的数据发生变化时，变更检测器会标记该组件为“脏”状态，并在下一次Angular的变更检测周期中检测该组件的变化，并更新相应的视图。

Angular还提供了一些手动触发变更检测的方法，如调用$apply()方法、使用zone.run()方法等。这些方法可以用于在Angular应用中手动触发变更检测，并更新相应的视图。

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

## [React Class-based & Functional Component](/Front-End/ReactClassAndFunctional/)

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

## [Hooks](/Front-End/ReactHooksItHelpNote/)

