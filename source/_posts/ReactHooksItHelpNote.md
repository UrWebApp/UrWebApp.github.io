---
title: 筆記 React Hooks
date: 2023-01-14
categories: Front-End
author: johch3n611u
tags:
- Note
- React
---

工作上有需要編輯 SAP 的 impEx 定義檔，所以想透過 React 寫個簡單的編輯器，順便研究一下 React 怎麼使用。

> 筆記內容節錄 [[筆記]從 Hooks 開始，讓你的網頁 React 起來系列](https://ithelp.ithome.com.tw/users/20203315/ironman/2668) 閱讀重點，如有侵權煩請告知，會立刻將文章移除，感謝。
> `TL;DR` 不管是 React function 還是 class Component ，感覺就算是 AG 前端摸的深，很容易陷入在技術債陷阱，而不是商業邏輯上... 但還是歹學歹用

## Hooks ? Functional / class ?

直接用最新的，但維護的時候要維護舊的

* [Functional-component vs Class-component](https://www.tpisoftware.com/tpu/articleDetails/2822)
* [React Class Components](https://www.w3schools.com/react/react_class.asp)
* [functional-vs-class-components](https://djoech.medium.com/functional-vs-class-components-in-react-231e3fbd7108)
* [React初心者30天的探索之路 [Day 07] Functional Component v.s Class Component](https://ithelp.ithome.com.tw/articles/10234746)
* [該來理解 JavaScript 的原型鍊了 ](https://github.com/aszx87410/blog/issues/18)
* [淺談 JavaScript 頭號難題 this：絕對不完整，但保證好懂](https://blog.techbridge.cc/2019/02/23/javascript-this/)

> class component

* 需繼承 React.Component
* 具有生命週期，可以針對某些情境決定是否渲染，ex shouldComponentUpdate()
* 需要在設置 state ( Stateful component )
* 每次都可以拿到最新的 this.props，因為 this 隨時都在變化
* 需要比較多 JS 的背景知識。this 概念 怎麼 Call function 決定、需要有物件導向的知識
* 具有生命週期。
* 不能使用 Hook。
* 需定義 render() 並將要渲染到畫面上的內容 return。
* this 必須在一開始被指向才可以使用

```js
// Example
class Car extends React.Component { 
  // extends React.Component 可以在內部使用一些 setState() 之類的語法
  constructor() { this.state = { name: "miaHsu" }; }
  render() {
    return <h2>Hi, I am a Car!</h2>;
  }

  this.setState({name: 'BrainLin'});
}
```

> hook / functional programming / Function Components

* 感覺很像 vue 3
* 2019 年 v16.8 Hooks 釋出後的寫法
* 生命週期要透過 userEffect Hook
* 無狀態組件 state（Stateless）要透過 useState Hook
* 可以用 arrow function 宣告或是一般的 function
* 編譯快程式碼更少，不用將 class 轉換成 es5，不繼承 react component
* props 會一直是原本傳進來的那個，而不會跟著更新，閉包的概念，this 會直接指向 component 本身
* 分離容器組件和展示組件會變得更容易

```js
// Example 單純只是一個普通的 JavaScript 函數
function Car(props) {
  const [count, setCount] = useState(0); // hook
  return <h2>Hi, I am a Car!</h2>;
}

let Car = (props) => {
  return <h2>Hi, I am a Car!</h2>;
}
```

## es6 Syntax

解構賦值（Destructuring assignment）

展開語法（Spread Syntax）

其餘語法 ( Rest Syntax )

## JSX

JSX ( JavaScript Syntax Extension and occasionally referred as JavaScript XML ) ： 透過 JSX 等於我們可以直接把 HTML 放到 JavaScript 中去操作，不再需要先用 querySelector 去選到該元素後才能換掉，而是可以在 HTML 中直接帶入 JavaScript 的變數。

`感覺有點像把 View 又跟 Function 卡在一起的感覺，不確定是好是壞，在個人開發經驗中行數不多時是不排斥，還蠻好寫的，可能用這種方式就要盡量拆元件？像是 Angular 通常又會拆出 TS 檔與 Html 檔，不確定 Html 的部分，底層是不是也是類似 JSX 的處理方式`

```JS
1. // 需要引入 Babel：JavaScript 前處理器（Preprocessor）
const word = 'React';
2. // ReactDOM 套件：渲染綁定 Html
const root = ReactDOM.createRoot(document.getElementById('root'));
3. // <h1> 的部分及為 JSX
4. // React 套件：提供 JSX 解析
5. // JSX {} 內為 JavaScript 表達式（expression）
root.render(<h1>Hello, {word}!</h1>);
```

## React、ReactDOM Library

* [React](https://www.npmjs.com/package/react)

React is a JavaScript library `for creating user interfaces`.

The react package contains `only the functionality necessary to define React components`. `It is typically used together with a React renderer` like react-dom for the web, or react-native for the native environments.

* [ReactDOM](https://www.npmjs.com/package/react-dom)

This package serves as the `entry point to the DOM` and `server renderers for React`. `It is intended to be paired with the generic React package`, which is shipped as react to npm.

```JS
1. // 定義 inline-style 行內樣式
const someStyle = {
  backgroundColor: white,
  fontSize: '20px',          2. // 也可以寫 20，引號和 px 可以省略
  border: '1px solid white',
  padding: 10,               3. // 省略 px，樣式會自動帶入單位變成 '10px'
}

1. // JSX 的內容可以放到 () 內當成變數
2. // 避免關鍵字衝突，在 JSX 中把原本的 CSS class 都改成用 className
const Counter = (
  <div className="container" style={someStyle}>
    <div className="chevron chevron-up" />
    <div className="number">256</div>
    3. // 直接把定義 inline-style 的物件，放到 style={} 的 {} 內
    <div className="chevron chevron-down" style={{
      color: '#FFE8E8',
      textShadow: '2px 2px #434a54',
    }} />
  </div>
);

1. `React 18 後已經棄用 ReactDOM.render()，改用 ReactDOM.createRoot()`
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(Counter);
```

## React Component、[Hooks] useState、[Hooks] useEffect

1. arrow function： const component = () => (/*return*/);

`該函式只是單純回傳某一值時，可以把要回傳的內容直接放到 => 後面而不用額外再寫 return`

2. `不能在條件式（conditions）、迴圈（loops）或嵌套函式（nested functions）中呼叫 Hook 方法，避免 React 組件紀錄 Hooks 調用順序錯誤，但透過 use() 產出的變數和方法，可以在判斷式內使用`

3. useEffect()：(side-effect) 這個函式會在「每次」畫面渲染完成後，`丟入的觀察值改變了`就會被呼叫，所以可以把觀察值參數 dependencies 丟個固定 []？

```JS
1.// React Hooks - useState：呼叫 useState 方法後可以建立一個被監控的資料變數「變數（count）」和「改變該變數 React 會幫我們重新轉譯畫面的方法（setCount）」
2.// React.useState(); // 直接透過 `.` 來取用 React 物件內的方法
3. `只要開頭為 use 的函式，就表示它是個 "Hook"`
const { useState, useEffect } = React; // 透過物件的解構賦值把 useState 方法取出

1. // 建立一個名為 Counter 的 React 元件
2. `React 的「元件名稱」會以大寫駝峰的方式來命名，如果沒這麼做的話，React 會把它當作一般的 HTML 元素處理，並跳出錯誤提示。其他像是 HTML 中的屬性、CSS 樣式屬性或一般的函式來說，則會遵行 JavaScript 以小寫駝峰來命名變數的慣例，不然一樣會拋出錯誤。`
const Counter = () => {

  1. // 透過 useState 建立 `count` 取得修改變數的 `setCount` 方法
  2. // const arrayReturnFromUseState = useState(<資料預設值>);
  3. // 陣列中的第一個元素是「想要監控的資料」
  4. // const count = arrayReturnFromUseState[0];
  5. // 陣列中的第二個元素是「修改該資料的方法」
  6. // const setCount = arrayReturnFromUseState[1];
  7. `useState 得到的變數和方法名稱是可以自己取的，而慣例上用來改變變數的方法名稱會以 set開頭；預設值也可以不一定要是字串或數值，而是可以帶入物件。`
  const [count, setCount] = useState(256);

  // 抽函式
  const handleIncrement = () => setCount(count + 1);
  const handleDecrement = () => setCount(count - 1);
  const handleClick = (type) => {
    if (type === 'increment') {
      setCount(count + 1);
    }
    if (type === 'decrement') {
      setCount(count - 1);
    }
  };

  // 渲染過後執行一次，並在第二個參數 [] 改變時在重複進行
  useEffect(() => {
    console.log('execute function in useEffect');
    return () => {
      // cleanup function ， component 即將從畫面離開前、每次 component 重新渲染前
    }
  },[]);

  return (
    1. // 一個 JSX 元素只能有一個根節點
    <div className="container">
      <div className="chevron chevron-up"
      2. // 也可以將此邏輯寫在上面 className
      style={{
          visibility: count >= 10 && 'hidden',
      }}
      3. // 事件處理器（event handlers）
      onClick={() => {
          4. // setCount(參數) 參數必須有改變 React 才會偵測到重新渲染
          5. // 每次 setSomething 時都是用新的資料覆蓋舊的，格式不一樣也會蓋，不能只寫出要修改或添加的物件屬性
          6. // 先透過解構賦值把舊資料帶入新物件中，再去添加或修改想要變更的資料
          7. // 有關聯的資料放在同一個物件中，而沒有關聯的資料，就另外在使用 useState 去定義資料狀態
          setCount({
            ...currentWeather,
            temperature: 31,
          });
        }}
      7. // JSX 中標籤內如果沒有內容的話可以自己關閉 <div /> 所以不用 <div></div>
      />
      <div className="number"
      8. // onClick={表達式（expression）}
         // 函式後面沒有()不會立即執行：
         // onClick={handleIncrement}
         // 立即執行：
         // onClick={handleClick('increment')}
         // 需要把 handleClick() 包在一個函式中不被立即執行：
         // onClick={()=>handleClick('increment')}
         `我猜應該是因為 JSX 其實就像是 JS 導致寫在這的函式變為 IIFE 而不是傳統意義上的 Html onclick <= 小寫`
      onClick={()=>handleClick('decrement')}>256</div>
      <div className="chevron chevron-down"
      onClick={handleDecrement}
      />
      <input
      type="number"
      onChange={() => console.log('onChange')}
      className="input-number"
      min="0"
      />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
// 使用 <Counter /> 來帶入 React 元件
root.render(<Counter />);

// 重複使用三次 <Counter /> 元件
root.render(
   <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
    }}
  >
    <Counter />
    <Counter />
    <Counter />
  </div>
);
```

## 邏輯運算子（Expressions - Logical operator）&& ||、三元判斷式（ternary operator）? ... : ...

`在 JSX 中的 {} 內只能放入表達式（expressions），而不能寫入像是 if...else... 這種陳述句（statement），因此在 React 中很常時候都會使用邏輯運算子這種語法。`

`JavaScript 中的真假值在判斷會自動作轉型，因此像是 null、NaN、0、空字串（""、''）、undefined 都會被轉型並判斷為「false（假）」`

### || 或（or）

a 為 false（為假）時就用 b，當 a 為 true（為真）時就直接用 a

### && 與 (and)

當 a 為 true（為真）時，就拿後面的 b，否則拿 a

```Js
style={{
          visibility: count >= 10 && 'hidden',
          1. // count 大於 10 => false 或 true，當前參數 false 則回傳 (count >= 10) 等於回傳 false
      }}
```

### ? ... : ... (若 ... 則 ...，否則...)

## 函式執行後回傳另一個函式 Callback Function

> 延伸閱讀 [JavaScript基本功修練：Day22 - 回傳函式與立即函式(IIFE)](https://ithelp.ithome.com.tw/articles/10250445)
>
> * 回傳函式 (Callback Function) 回傳函式不一定是非同步
>   e.g. `btn.addEventListener('click',function(){console.log('You clicked the button')});`
> * IIFE (Immediately Invoked Function Expression) 定義完馬上就執行的 Function

```JS
return (
    <div
      className="chevron chevron-up"
      onClick={handleClick('increment')}
      style={{
        visibility: count >= 10 && 'hidden',
      }}
    />
);
// handleClick('increment') 執行的時候實際上是回傳一個 type 為 increment 的函式
const handleClick = (type) => {
  return function () {
    if (type === 'increment') {
      setCount(count + 1);
    }
    if (type === 'decrement') {
      setCount(count - 1);
    }
  };
};

const handleClick = (type) => () =>{
    if (type === 'increment') {
      setCount(count + 1);
    }
    if (type === 'decrement') {
      setCount(count - 1);
    }
};

const handleClick = (type) => () =>
  setCount(type === 'increment' ? count + 1 : count - 1);
```

## 如何在 JSX 流程控制邏輯 IF / FOR

for 迴圈、if 判斷 本身是個 statements 而非 expressions，JSX 無法 run statements

React 中會透過陣列的 Array.map 猿聲方法並且回傳 <Counter /> 元素

`感覺用這種方法有種多此一舉的狀況，不確定意義性在哪，感覺是為了 JSX 而去多做一步`

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
       display: 'flex',
       flexWrap: 'wrap',
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

## React 的 ng-container => <React.Fragment>

```JS
// // <></> 是 <React.Fragment></React.Fragment> 的縮寫
const Counter = () => (
  <>
    <div class="container">
      <div class="chevron chevron-up" />
      <div class="number">256</div>
      <div class="chevron chevron-down" />
    </div>
    <div class="other-container">
    </div>
  </>
);
```

## 條件轉譯

```JS
const CardFooter = () => {
  let inputValue = 30;
  let criteria;
  // 根據 inputValue 改變要顯示的內容和背景色
  if (!inputValue) {
    criteria = {
      title: '---',
      backgroundColor: '#d3d8e2',
    };
  } else if (inputValue < 15) {
    criteria = {
      title: 'SLOW',
      backgroundColor: '#ee362d',
    };
  } else if (inputValue < 40) {
    criteria = {
      title: 'GOOD',
      backgroundColor: '#1b82f1',
    };
  } else if (inputValue >= 40) {
    criteria = {
      title: 'FAST',
      backgroundColor: '#13d569',
    };
  }

  return (
  <div
    style={{
      backgroundColor: criteria.backgroundColor,
    }}
  >
    {criteria.title}
  </div>
);
};
```

## 將資料從父層組件傳遞到子層組件

`使用 props 傳遞資料時， key 和 value 的命名可以自己取`

```Js
// ChildComponent({ firstName, lastName, inputValue }) {
const ChildComponent = (props) => {
  const { firstName, lastName , inputValue } = props;
  return <h1>Hello, {firstName} {lastName} {inputValue}</h1>;
}
const FatherComponent = () => {
    const [inputValue, setInputValue] = useState(0);
    return (<ChildComponent firstName="Aaron" lastName="Chen" inputValue={inputValue} />)
};
```

## React Developer Tools

### 元件檢視

1. props 就是指由外部傳入該組件內的資料
2. hooks 裡面的 State 表示的是該組件自身內部的資料，也就是使用 useState 產生的資料
3. 碼表 React.Suspense 組件 等待畫面

### 效能檢視 Profilers

資料狀態沒有處理好的情況下，可能會使得這些組件多了一些不必要的渲染次數，可以去看該頁面內各組件渲染所花費的時間和次數。

## React 專案架構

create-react-app：工具建立 React 開發環境，不然 webpack 需要自己設定。

public：靜態檔案，不須再 preprocess、compile。

src：開發用的資料夾，內層的 js 檔通常需要 webpack 打包，組要透過 es6 modules 串起來。

CSS-in-JS：類似 Angular 一樣，component 有自己的 css 會編譯再一起，在 React 內需要用額外套件去整合這件事，現存的有 styled-components、emotion 可以選擇，挑選套件時，可以透過 npm trends 把幾個具有相似功能的套件進行比較，看出趨勢找到適合的。

normalize.css：一種 css reset 保留了原生瀏覽器的樣式，與修正一些 bug 似乎較好用。 參考：[Reset CSS 與 Normalize.css 差異](https://israynotarray.com/css/20210807/3641451940/)

prevState：useSomething 系列內除了初始化，最好還是用 prevState 才會是上一次 setSomething 的值

```js
// ./src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import WeatherApp from './WeatherApp';

// 這種引入的方式 CSS 檔的樣式會作用到全域
import './styles.css';

function App() {
  return <WeatherApp />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// ./src/WeatherApp.js
import React from 'react';
// 載入 emotion 的 styled 套件
import styled from '@emotion/styled';
// 使用 create-react-app 提供的 ReactComponent 載入 SVG，( 與以下方式都需要，或者需要自行調整 Webpack 設定 )
import { ReactComponent as Cloudy } from './images/cloudy.svg';
// 使用此種方式會取得該圖檔路徑，須放置於 src 屬性，但會侷限於 img element 不是 svg 的可控性
import cloudyIcon from './images/cloudy.svg';

// 定義帶有 styled 的 component
const Container = styled.div`
  background-color: #ededed;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WeatherCard = styled.div`
  position: relative;
  min-width: 360px;
  box-shadow: 0 1px 3px 0 #999999;
  background-color: #f9f9f9;
  box-sizing: border-box;
  padding: 30px 15px;

  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

// 透過 styled(組件) 來把樣式帶入已存在的組件中
const CloudyIcon = styled(Cloudy)`
  ${props => console.log(props)}
  color: ${props => props.theme === 'dark' ? '#dadada' : '#212121'};
  /* 在這裡寫入 CSS 樣式 */
  flex-basis: 30%;
`;

// Fetch Request
const handleClick = () => {
  fetch(
    'Url'
  )
    .then((response) => response.json())
    .then((data) => {
         setCurrentWeather({
            observationTime: locationData.time.obsTime,
            locationName: locationData.locationName,
            description: '多雲時晴',
            temperature: weatherElements.TEMP,
            windSpeed: weatherElements.WDSD,
            humid: weatherElements.HUMD,
         });
    });
};

const WeatherApp = () => {
  return (
    // 定義好的 styled-component 當成元件使用
    <Container>
      <WeatherCard onClick={handleClick}>
        { CurrentWeather.observationTime }
        <img src={cloudyIcon} alt="cloudy icon" />
        <h1>Weather</h1>
        <Cloudy />
        // 透過 Emotion 建立的 Styled Components 中仍然是個 React 的組件，props 是同樣的方式
        <CloudyIcon theme="dark"/>
      </WeatherCard>
    </Container>
  );
};

export default WeatherApp;
```

### Emotion 中可以把撰寫好的 CSS 樣式當作 JavaScript 函式保存起來

```JS
// 匯入 Emotion 提供的 css 函式
import { css } from '@emotion/core';

// CSS 樣式定義成 JavaScript 函式，在共用樣式的函式中，一樣可以透過 props 取得外部傳來的資料
const buttonDefault = (props) => css`
  display: block;
  width: 120px;
  height: 30px;
  font-size: 14px;
  background-color: transparent;
  color: ${props.theme === 'dark' ? '#dadada' : '#212121'};
`;

// 在定義 Styled Components 時載入定義好的 CSS 樣式，同樣的樣式後面寫的會覆蓋前面寫的
const rejectButton = styled.button`
  ${buttonDefault}
  background-color: red;
`;

const acceptButton = styled.button`
  ${buttonDefault}
  background-color: green;
`;

export default ;
```

### Internationalization API 優化時間呈現

可以使用瀏覽器原生的 Intl 這個方法，這個方法的全名是 Internationalization API，它可以針對日期、時間、數字（貨幣）等資料進行多語系的呈現處理

```JS
{new Intl.DateTimeFormat('zh-TW', {
            hour: 'numeric',
            minute: 'numeric',
          }).format(new Date(currentWeather.observationTime))}
```

### Fetch Request 資料撈回來後的處理

[Array.reduce()](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)
[Array.includes()](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)

```JS
const array1 = [1, 2, 3, 4];

// 0 + 1 + 2 + 3 + 4
const initialValue = 0;
const sumWithInitial = array1.reduce(
  (accumulator, currentValue) => accumulator + currentValue,
  initialValue
);

// Expected output: 10
console.log(sumWithInitial);

const array1 = [1, 2, 3];
// Expected output: true
console.log(array1.includes(2));


// 處理資料
const weatherElements = locationData.weatherElement.reduce(
  (neededElements, item) => {
    if (['WDSD', 'TEMP', 'HUMD'].includes(item.elementName)) {
      neededElements[item.elementName] = item.elementValue;
    }
    return neededElements;
  },
  {} // 初始值
);
```

## 兩支以上 API 取得的資料需要做 Mix 時 ( 類似 RxJS combineLatest )

兩支 API Response 先後順序不確定的狀況下，資料覆蓋會成為問題，以前做過類似情境就是分前後 Call API 或用非同步更新狀態，若不使用類似 RxJS Zip combineLatest 混合資料，其實就是後端做掉是最好的選擇 ( API 直接針對這個功能給資料 )，React 這邊則是透過 SetSomething 的別種用法處理。

```JS
const [weatherElement, setWeatherElement] = useState(/* ... */)

const fetchGetXXX1 = () => {
  fetch(...)
  .then((data)=>{
      // 在 setWeatherElement 中也可以帶入函式
      // 可以透過這個函式的參數取得前一次的資料狀態
      setWeatherElement((prevState => {
          // 記得要回傳新的資料狀態回去
          return {
              ...prevState            // 保留原有的資料狀態
              rainPossibility: 0.1    // 添加或更新的資料
          }
      }));
}

const fetchGetXXX2 = () => {
  fetch(...2)
  .then((data)=>{
      setWeatherElement((prevState => ({
                ...prevState
                rainPossibility: 0.1
            })
      ));
  });
}
```

### [Hooks] useCallback => 情境： 當...後，才能.../ 回呼函式（callback function） / Promise / async function

上述方式會造成同畫面，資料不同速度回來，所以分別渲染兩次，也可以透過 async 非同步去等待兩者都回來後再做一次渲染。

取得所有資料後觸發一次畫面的更新，不複用的化，可以寫在 useEffect 內，但因為 [] 觀察值 相依參數 dependencies 都不會更新所以只會執行一次渲染

```JS
 useEffect(() => {
    // 在 useEffect 中定義 async function 取名為 fetchData
    const fetchData = async () => {
      // 使用 Promise.all 搭配 await 等待兩個 API 都取得回應後才繼續
      // 使用陣列的解構賦值把資料取出
      const [currentWeather, weatherForecast] = await Promise.all([
        fetchCurrentWeather(),
        fetchWeatherForecast(),
      ]);

      // 把取得的資料透過物件的解構賦值放入
      setWeatherElement({
        ...currentWeather,
        ...weatherForecast,
      });
    };

    // 呼叫 fetchData 這個方法
    fetchData();
  }, []);

  const fetchCurrentWeather = () => {
    // 加上 return 直接把 fetch API 回傳的 Promise 回傳出去
    return fetch(/* ... */)
      .then((response) => response.json())
      .then((data) => {
        // ...
        // 把取得的資料內容回傳出去，而不是在這裡 setWeatherElement
        return {
          observationTime: locationData.time.obsTime,
          locationName: locationData.locationName,
          temperature: weatherElements.TEMP,
          windSpeed: weatherElements.WDSD,
          humid: weatherElements.HUMD,
        };
      });
  };

  const fetchWeatherForecast = () => {
    // 加上 return 直接把 fetch API 回傳的 Promise 回傳出去
    return fetch(/* ... */)
      .then((response) => response.json())
      .then((data) => {
        // ...
        // 把取得的資料內容回傳出去，而不是在這裡 setWeatherElement
        return {
          description: weatherElements.Wx.parameterName,
          weatherCode: weatherElements.Wx.parameterValue,
          rainPossibility: weatherElements.PoP.parameterName,
          comfortability: weatherElements.CI.parameterName,
        };
      });
  };
```

為了複用重新呼叫，將共用函式搬到 useEffect 之外，但 useEffect 有包裝過內部使用到的函式雖然可以直接複用但此處會被 eslint 報錯，必須相依才可複用，所以需要再 dependencies 定義相依，重點來了`此時將 handleClick 放入 dependencies 時，一樣會發生偵測 handleClick 不一樣所以重複執行 useEffect，主要是因為 JS 特性 [call by ref & value & sharing]，「物件」、「陣列」、「函式」 => 物件 !== 物件`，此時就要透過 `useCallback` 來解決這個問題。

[深入探討 JavaScript 中的參數傳遞：call by value 還是 reference？](https://blog.techbridge.cc/2018/06/23/javascript-call-by-value-or-reference/)

```JS
const handleClick = async () => {
            const [currentWeather, weatherForecast] = await Promise.all([
              fetchCurrentWeather(),
              fetchWeatherForecast(),
            ]);
            setWeatherElement({
              ...currentWeather,
              ...weatherForecast,
            });
};

<Redo onClick={handleClick}>
           {/* ... */}
</Redo>

useEffect(() => {
    handleClick();
}, [handleClick]);

// call by ref
const a = {
  aa: 'aaa',
};

const b = a;

const c = {
  aa: 'aaa',
};

console.log(a === b); // true
console.log(a === c); // false

b.aa = 'bbb';
console.log(a); // { title: 'bbb' }
```

useCallback (函式,dependencies)：它不會隨著每次組件重新執行後，因為作用域不同而得到兩個不同的函式，`會回傳一個函式，只有當 dependencies 有改變時，這個回傳的函式才會改變`，可以避免因為 Functional Component 每次重新執行後，函式內容明明相同，但卻被判斷為不同，進而導致 useEffect 又再次被呼叫到的情況。

`如果某個函式不需要被覆用，那麼可以直接定義在 useEffect 中，但若該方法會需要被共用，則把該方法提到 useEffect 外面後，記得用 useCallback 進行處理後再放到 useEffect 的 dependencies 中`

```JS
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

console.log(memoizedCallback === memoizedCallback) // true
```

```JS
const fetchData = useCallback(() => {
    const fetchingData = async () => {
      const [currentWeather, weatherForecast] = await Promise.all([
        fetchCurrentWeather(),
        fetchWeatherForecast(),
      ]);

      setWeatherElement({
        ...currentWeather,
        ...weatherForecast,
      });
    };

    fetchingData();
    // 因為 fetchingData 沒有相依到 React 組件中的資料狀態，所以 dependencies 陣列中不帶入元素
}, []);

useEffect(() => {
    fetchData();
    // 把透過 useCallback 回傳的函式放到 useEffect 的 dependencies 中
  }, [fetchData]);
```


### [Hooks] useMemo 保存複雜運算的資料結果

會在 dependencies 沒有改變的情況下，useMemo 就會直接使用上一次計算過的結果而不會重新在運算一次，`useMemo 會在組件渲染時（rendering）被呼叫，因此不應該在這個時間點進行任何會有副作用（side effect）的操作；若需要有副作用的操作，則應該使用的是 useEffect 而不是 useMemo`。

`useCallback(fn, deps) 等同於 useMemo(() => fn, deps)`

```JS
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// 搬到組件外
const weatherCode2Type = (weatherCode) => {
  const [weatherType] =
    Object.entries(weatherTypes).find(([weatherType, weatherCodes]) =>
      weatherCodes.includes(Number(weatherCode))
    ) || [];

  return weatherType;
};
```

### [Hooks] useRef / controlled & uncontrolled components

Controlled 和 Uncontrolled 指的是「資料受不受到 React 所控制」，`<input />` 這類的表單元素本身就可以保有自己的資料狀態，而透過 React 控制則是類似 ngModel 或 Reative Form 綁定表單元素那樣，可以做驗證或更新等等需求。

Controlled：透過 useState 與 事件監聽去與表單元素雙向綁定

Uncontrolled：有些時候可能只是想要很簡單的去取得表單中某個欄位的值，或者是有一些情況下需要直接操作 DOM，可以使用 useRef。

`useRef：會回傳一個物件（refContainer），這個物件不會隨著每一次畫面重新渲染而指稱到不同的物件，而是可以一直指稱到同一個物件`。

```JS
const refContainer = useRef(initialValue);
const InputElement = () => (
  // refContainer.current 就會指稱到這個 <input>
  <input ref={refContainer} />
)
```



### 多 Icons CSS 組件寫法

```JS
let currentWeatherIcon = weatherIcons[moment][currentWeather];

const weatherIcons = {
  day: {
    isThunderstorm: <DayThunderstorm />,
    isClear: <DayClear />,
    isCloudyFog: <DayCloudyFog />,
    isCloudy: <DayCloudy />,
    isFog: <DayFog />,
    isPartiallyClearWithRain: <DayPartiallyClearWithRain />,
    isSnowing: <DaySnowing />,
  },
  night: {
    isThunderstorm: <NightThunderstorm />,
    isClear: <NightClear />,
    isCloudyFog: <NightCloudyFog />,
    isCloudy: <NightCloudy />,
    isFog: <NightFog />,
    isPartiallyClearWithRain: <NightPartiallyClearWithRain />,
    isSnowing: <NightSnowing />,
  },
};
```

### Object.entries

直接取得所有 property 的 name 和 value，並以陣列回傳

```js
let object = {a: 1, b: 2, c: 3};

console.log(Object.entries(object));
// [
//   ["a", 1],
//   ["b", 2],
//   ["c", 3]
// ]
```

### Array.find

方法會回傳第一個滿足所提供之測試函式的元素值。否則回傳 undefined

```JS
const array1 = [5, 12, 8, 130, 44];

const found = array1.find(element => element > 10);

console.log(found);
// Expected output: 12
```

### Array.includes

方法會判斷陣列是否包含特定的元素，並以此來回傳 true 或 false。

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

### || [] 使用情境

.find()如果沒有找到東西(回傳undefined)的話，會變成[weatherType]=[];，應該是要避免[weatherType]在解構賦值的時候接到undefined(非陣列)，導致報錯。

```JS
const [weatherType] =
    Object.entries(weatherTypes).find(([weatherType, weatherCodes]) =>
      weatherCodes.includes(Number(weatherCode))
    ) || [];
```

### 物件的解構賦值

```js
const {
    observationTime,
    locationName,
    temperature,
    windSpeed,
    description,
    weatherCode,
    rainPossibility,
    comfortability,
    isLoading,
} = weatherElement;
```

### 載入中

思路：新增一控制是否再載入中的狀態 isLoading 初始值 false ，fetch 一開始將值改為 true ，並且控制 Style Component 讓 UI 動起來，Response 回來時在將值改為 false。

### 主題 theme 切換 Emotion ThemeProvider 組件

思路：定義主題配色與 useState 綁定主題控制狀態，在改變主題事件 handle 傳入主題參數到 Styled Component，但這樣程式碼會議動到 N 處，所以要利用 Emotion ThemeProvider 組件，類似 ng Service 或者是 event bus，所有的 Styled Components 都可以取得傳入 ThemeProvider 組件的參數。

```js
import { ThemeProvider } from 'emotion-theming';

const theme = {
  light: {
    backgroundColor: '#ededed',
    ...
  },
  dark: {
    backgroundColor: '#1F2022',
    ...
  },
};

const Container = styled.div`
  // 解構賦值
  background-color: ${({ theme }) => theme.backgroundColor};
  ...
`;

<ThemeProvider theme={theme.dark}>
    // <Container theme={theme.dark}>
    <Container />
</ThemeProvider>
```

## 自定義鉤子 Custom Hook 類似 ng Service

`透過 props 不只可以傳遞「字串」、「物件」、「陣列」、「數值」這類資料，也可以直接把「函式」傳進去，並透過解構賦值解出使用`，在 Custom Hook 中一樣可以使用 useState、useEffect 這些原本 React 就有提供的 Hooks，只是在 React Component 中最後你會回傳的是 JSX，而在 Hook 中最後回傳的是一些資料或改變資料的方法。

```js
// useWeatherApi.js
import { useState, useEffect, useCallback } from 'react';

const fetchCurrentWeather = (locationName) => {
  // ...
};

const fetchWeatherForecast = (cityName) => {
  // ...
};

const useWeatherApi = (currentLocation) => {
  const [weatherElement, setWeatherElement] = useState({
    // ...
  });

  const fetchData = useCallback(() => {
    const fetchingData = async () => {
      // ...
    };

    setWeatherElement((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    fetchingData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 把要給其他 React 組件使用的資料或方法回傳出去
  return [weatherElement, fetchData];
};

export default useWeatherApi;

// other Component
import useWeatherApi from './useWeatherApi';
const [weatherElement, fetchData] = useWeatherApi();
<WeatherCard
          weatherElement={weatherElement}
          moment={moment}
          fetchData={fetchData}
/>
```

## 子層組件修改父層組件資料狀態

label 屬性 for 關鍵字與 javascript for 衝突，改為 htmlFor

datalist element：類似 select 但是可以 autocomplete

思路：不透過 react-router 而是在組件內透過控制參數邏輯判別切換 Component，將父層組件的控制參數 setXXXXX 方法 props 到子層使用修改控制參數。

## Create React App ( Cli )

## PWA (Progressive Web App)

1. serviceWorker.unregister() 改成 serviceWorker.register()
2. 定義 PWA 的說明檔 - manifest.json
3. 使用瀏覽器 Chrome 開啟，符合 PWA 的規範，所以會自動跳出提示來詢問使用者是否要安裝

https://create-react-app.dev/docs/making-a-progressive-web-app/

## Codecademy Learn React

https://www.codecademy.com/learn/react-101

### Day.js

https://github.com/pjchender/realtime-weather-app/commit/e37e940001f1acab18a44e21e319761815ac9489

## Redux

https://pjchender.dev/webdev/note-without-redux/

> `TL;DR` useContext + useReducer (適合小專案) 無法完全取代 redux 而 redux 也需要提升到 observable 才夠用

類似 vuex、flux、ngrx 感覺 ngrx 整合度比較好直接有觀察者模式 rxjs 的相關部件可以直接使用。

Redux：解決 prop drilling 類似 ng service， reducer 類似 RxJS 實作 DAO 層，但不支援非同步的資料處理，所以透過 redux-thunk、redux saga 和 redux observable 這些用來處理非同步資料請求的工具。

Redux useSelector (只要一層 Provider)、async <=> React useContext + useReducer (需要多層 Provider、boilerplate、race condition 問題)

Reducer：透過 action 指令 CRUD state

Store：整合所有 Reducer

Provider：jsx 組件用於 prop state

useSelector：Redux 獲取資料的 hook

### [Hooks] useContext

https://medium.com/hannah-lin/react-hook-%E7%AD%86%E8%A8%98-usecontext-4bc289976847

useContext 每一次 contex t更新時都會迫使「有使用 useContext 取得該 context 」的元件更新，必須拆分 Context，但這又會造成 boilerplate

```js
export const OpenContext = React.createContext(true);
export const SetOpenContext = React.createContext(()=>{});
<OpenContext.Provider value={isOpen}>
            <SetOpenContext.Provider value={setIsOpen}>
            </SetOpenContext.Provider>
</OpenContext.Provider>
```

### [Hooks] useReducer

useReducer 是無法存取 global store，必須搭配 useContext

### [Hooks] useLayoutEffect

## 參考

* [[React Hook 筆記] useReducer 真的能完全取代 Redux 嗎?](https://medium.com/hannah-lin/react-hook-%E7%AD%86%E8%A8%98-usereducer-%E7%9C%9F%E7%9A%84%E8%83%BD%E5%AE%8C%E5%85%A8%E5%8F%96%E4%BB%A3-redux-%E5%97%8E-fabcc1e9b400)
* [Day 16 - 用 useReducer 取代 Redux !?](https://ithelp.ithome.com.tw/m/articles/10276005)
* [【Day.22】React效能 - 如何處理useContext的效能問題](https://ithelp.ithome.com.tw/articles/10249827)