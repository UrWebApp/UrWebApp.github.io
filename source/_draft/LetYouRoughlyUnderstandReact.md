---
title: 筆記 React Hooks
date: 2023-01-14
categories: Front-End
author: johch3n611u
tags:
- Note
- React
---

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

### [Hooks] useMergedState

[react-component/util/useMergedState](https://github.com/react-component/util/blob/master/src/hooks/useMergedState.ts)

[我们应该如何优雅的处理 React 中受控与非受控](https://juejin.cn/post/7178485530223444026)

[[Day 15] React controlled components v.s uncontrolled components](https://ithelp.ithome.com.tw/articles/10237281)

通过该 Hook 你可以自由定义表单控件的受控和非受控状态。

在前端工程中，受控元素和被控元素是指在表單中的輸入元素。

受控元素是指表單中的輸入元素，如input、textarea、select等元素，其值是由React或其他JavaScript框架管理的元素。這些元素的值被存儲在組件狀態中，並且只能通過setState()方法更改。

被控元素是指表單中的輸入元素，其值由DOM管理。這些元素的值可以通過JavaScript編程更改，也可以由用戶輸入更改。但是，值並不存儲在組件狀態中，因此在React或其他JavaScript框架中，它們需要透過refs來讀取或更改。

簡而言之，受控元素是由React或其他JavaScript框架管理其值的元素，而被控元素則由DOM管理其值的元素。受控元素的值存儲在組件狀態中，而被控元素的值不是。

### [Hooks] useEffect

一個 Component 從 建立 => ️️ 更新 => 銷毀

![react-hooks-lifecycle](./img/ReactHookLifecycle.jpeg)

https://wavez.github.io/react-hooks-lifecycle/

![react-class-lifecycle](./img/ReactClassLifecycle.jpeg)

https://yakimhsu.com/project/project_w21_03_React_life_componentDidUpdate.html

![react-lifecycle](./img/ReactLifecycle.jpg)

https://twitter.com/siddharthkmr1/status/1294733239429369857?lang=zh-Hant

### pure function

https://ithelp.ithome.com.tw/articles/10241071

### 副作用（side effect）

## Style Component

[[Day 11] React CSS 最重要的小事（下）](https://ithelp.ithome.com.tw/articles/10235714)

## HOC component

## Ref 操作 DOM

document.getElementById、document.getElementsByClassName...

* 觸發即時動畫
* 與第三方 DOM 函式庫整合。
* 管理 focus、選擇文字、或影音播放

## 呼叫 api with fetch & axios

https://ithelp.ithome.com.tw/articles/10237982

## React Router

https://ithelp.ithome.com.tw/articles/10243368

## 參考

* [[React Hook 筆記] useReducer 真的能完全取代 Redux 嗎?](https://medium.com/hannah-lin/react-hook-%E7%AD%86%E8%A8%98-usereducer-%E7%9C%9F%E7%9A%84%E8%83%BD%E5%AE%8C%E5%85%A8%E5%8F%96%E4%BB%A3-redux-%E5%97%8E-fabcc1e9b400)
* [Day 16 - 用 useReducer 取代 Redux !?](https://ithelp.ithome.com.tw/m/articles/10276005)
* [【Day.22】React效能 - 如何處理useContext的效能問題](https://ithelp.ithome.com.tw/articles/10249827)