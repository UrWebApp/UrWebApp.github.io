---
title: 讓你大概搞懂 React
date: 2023-03-25
categories: Dev Tech
author: johch3n611u
tags:
- Note
- React
---

[必看](https://ithelp.ithome.com.tw/m/users/20129300/ironman/5892)


## Tools

### React、ReactDOM Library

* [React](https://www.npmjs.com/package/react)：用於創建用戶界面的函式庫，只有定義元件所必需的功能，通常與渲染器一起使用。

React is a JavaScript library `for creating user interfaces`. 

The react package contains `only the functionality necessary to define React components`. `It is typically used together with a React renderer` like react-dom for the web, or react-native for the native environments.

* [ReactDOM](https://www.npmjs.com/package/react-dom)：渲染器函式庫，用於渲染元件、掛載模組、操作 DOM、創建 SPA 根結點、提供 JSX 解析

This package serves as the `entry point to the DOM` and `server renderers for React`. `It is intended to be paired with the generic React package`, which is shipped as react to npm.

### NPM Trends

https://npmtrends.com/angular-vs-react-vs-vue

相較於 AG 整個都整合好了，React 感覺在整合上更需要這種比較工具，找社群力大的才比較不會遇到套件底層問題

### Create-React-App ( cli ) vs Next.js

* CRA 提供了一個基礎的 SPA 開發環境
* Next.js 框架可以做 SPA CSR 也可以 SSR，可以取代 CRA 但 CRA 做不到 Next.js 部分功能
* CRA 整合像是 @babel/plugin-proposal-class-properties ( 可省略建構子直接寫 state )

### React Developer Tools

* 以往在使用 AG 的 Tools 只有組件檢視連結回 Html 這個功能比較好用，再者就是可以截很炫炮的模組依賴圖放在開發文件內，至於 prop 或其他功能似乎因為 debug 還是要更連結 code 不如在程式碼內放 console.log 來的方便
* React 的 Tools 看起來比較有用的是效能檢視 Profilers 、碼表 React.Suspense，資料狀態沒有處理好的情況下，可能會使得這些組件多了一些不必要的渲染次數，可以去看該頁面內各組件渲染所花費的時間和次數。原因可以看[Virtual DOM 章節](#Virtual-Dom)

### normalize.css

一種 css reset 保留了原生瀏覽器的樣式，與修正一些 bug 似乎較好用。 [Reset CSS 與 Normalize.css 差異](https://israynotarray.com/css/20210807/3641451940/)

### PWA (Progressive Web App)

1. serviceWorker.unregister() 改成 serviceWorker.register()
2. 定義 PWA 的說明檔 - manifest.json
3. 使用瀏覽器 Chrome 開啟，符合 PWA 的規範，所以會自動跳出提示來詢問使用者是否要安裝

https://create-react-app.dev/docs/making-a-progressive-web-app/

### Codecademy Learn React

https://www.codecademy.com/learn/react-101

### Day.js

https://github.com/pjchender/realtime-weather-app/commit/e37e940001f1acab18a44e21e319761815ac9489

## Virtual DOM

[网上都说操作真实 DOM 慢，但测试结果却比 React 更快，为什么？(尤雨溪)](https://www.zhihu.com/question/31809713)

[[Day 09] 單向資料流 & DOM 渲染策略](https://ithelp.ithome.com.tw/articles/10296750?sc=iThelpR)

* repaint 重繪
* reflow 回流

Angular 2+ 不再使用脏检查（dirty checking），采用了更高效变更检测。基于Zone.js库，它可以在Angular 中变更检测器（ChangeDetector）跟踪和捕获异步事件的执行，自动更新与模板绑定相关的视图部分。手动触发变更检测的方法，如调用$apply()方法、使用zone.run()方法等...如尤大所說應該看應用與客戶需求去看使用框架。

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

## CSS-in-JS

[[Day 11] React CSS 最重要的小事（下）](https://ithelp.ithome.com.tw/articles/10235714)

類似 Angular 一樣，component 有自己的 css 會編譯再一起，在 React 內需要用額外套件去整合這件事，現存的有 styled-components、emotion 可以選擇，挑選套件時，可以透過 npm trends 把幾個具有相似功能的套件進行比較，看出趨勢找到適合的。

* 減少 CSS 命名衝突
* 組件簡化 CSS 維護
* 避免 CSS 選擇器過度嵌套
* 方便動態生成樣式
* 方便設定動態主題樣式

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

## Internationalization API 優化時間呈現

可以使用瀏覽器原生的 Intl 這個方法，這個方法的全名是 Internationalization API，它可以針對日期、時間、數字（貨幣）等資料進行多語系的呈現處理

```JS
{new Intl.DateTimeFormat('zh-TW', {
            hour: 'numeric',
            minute: 'numeric',
          }).format(new Date(currentWeather.observationTime))}
```

## Fetch Request 資料撈回來後的處理

https://ithelp.ithome.com.tw/articles/10237982

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

### 兩支以上 API 取得的資料需要做 Mix 時 ( 類似 RxJS combineLatest )

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

### 載入中

思路：新增一控制是否再載入中的狀態 isLoading 初始值 false ，fetch 一開始將值改為 true ，並且控制 Style Component 讓 UI 動起來，Response 回來時在將值改為 false。

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

### 子層組件修改父層組件資料狀態

label 屬性 for 關鍵字與 javascript for 衝突，改為 htmlFor

datalist element：類似 select 但是可以 autocomplete

思路：不透過 react-router 而是在組件內透過控制參數邏輯判別切換 Component，將父層組件的控制參數 setXXXXX 方法 props 到子層使用修改控制參數。

## [Hooks](/Front-End/ReactHooksItHelpNote/)

## React API

### Ref 操作 DOM

document.getElementById、document.getElementsByClassName...

* 觸發即時動畫
* 與第三方 DOM 函式庫整合。
* 管理 focus、選擇文字、或影音播放

### forwardRef

forwardRef 是 React 中一個重要的 API 之一，其主要用途是允許子組件（child component）向父組件（parent component）傳遞參數，並且可以獲得對子組件 DOM 元素的引用。

在一般情況下，如果要讓父組件能夠直接訪問子組件中的 DOM 元素，需要在子組件中定義一個回調函數（callback function），然後將這個回調函數傳遞給子組件的 props，讓子組件在適當的時候調用這個回調函數，將 DOM 元素作為參數傳遞給父組件。

使用 forwardRef 可以簡化這個過程，通過 forwardRef，父組件可以直接獲得對子組件 DOM 元素的引用，而無需在子組件中定義回調函數。

```js
import React, { forwardRef } from 'react';

const MyInput = forwardRef((props, ref) => {
  return (
    <input type="text" ref={ref} {...props} />
  );
});

const App = () => {
  const inputRef = React.createRef();

  const handleButtonClick = () => {
    console.log(inputRef.current.value);
  };

  return (
    <div>
      <MyInput ref={inputRef} />
      <button onClick={handleButtonClick}>Submit</button>
    </div>
  );
};
```

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

## React Router

https://ithelp.ithome.com.tw/articles/10243368

## 參考

* [[React Hook 筆記] useReducer 真的能完全取代 Redux 嗎?](https://medium.com/hannah-lin/react-hook-%E7%AD%86%E8%A8%98-usereducer-%E7%9C%9F%E7%9A%84%E8%83%BD%E5%AE%8C%E5%85%A8%E5%8F%96%E4%BB%A3-redux-%E5%97%8E-fabcc1e9b400)
* [Day 16 - 用 useReducer 取代 Redux !?](https://ithelp.ithome.com.tw/m/articles/10276005)
* [【Day.22】React效能 - 如何處理useContext的效能問題](https://ithelp.ithome.com.tw/articles/10249827)