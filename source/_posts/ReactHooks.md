---
title: 讓你大概搞懂 React Hooks
date: 2023-03-25
categories: React
author: johch3n611u
tags:
- Note
- React
---

## [Hooks] useState

useState( 資料預設值 )：建立一個被監控的資料變數「變數（count）」和「改變該變數 React 會幫我們重新轉譯畫面的方法（setCount）」

* 每次 setSomething 時都是用新的資料覆蓋舊的，格式不一樣也會蓋，不能只寫出要修改或添加的物件屬性
* 透過展開運算符把解構賦值的舊資料帶入新物件中，再去添加或修改想要變更的資料
* 有關聯的資料放在同一個 State 中，而沒有關聯的資料，就另外在使用 useState 去定義資料狀態

```js
import React, { useState } from 'react';

function Counter() {
  const [but, setbut] = useState({name:'BIG',count:0});

  const increment = () => {
    setbut({
        ...but,
        count : but.count + 1
    });
  };

  return (
    <div>
      <p>Count: {but.count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

## [Hooks] useEffect

想知道 useEffect 前需要了解什麼是副作用

* Side Effect：指的是一些與渲染結果無關的操作，例如數據獲取、訂閱事件、修改 DOM 等。這些操作可能會影響到組件的渲染結果，但不直接與渲染結果相關，React 會在組件渲染之後執行副作用以便更新組件的渲染結果

* useEffect( 回調函數、依賴列表 )：在「每次」畫面渲染完成後，`丟入的依賴列表改變了`就會被呼叫，所以可以把依賴列表 Dependencies 丟個固定 [] 只執行一次，也可以利用來處理副作用

```js
import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

## [Hooks] useContext

## [Hooks] useReducer

## [Hooks] useLayoutEffect

## [Hooks] useMergedState