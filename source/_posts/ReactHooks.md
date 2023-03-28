---
title: [React] Hooks
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
* prevState：useSomething 系列內除了初始化，最好還是用 prevState 才會是上一次 setSomething 的值

```js
import React, { useState } from 'react';

function Counter() {
  const [but, setbut] = useState({name:'BIG',count:0});

  const increment = () => {
    setbut((prevState)=>{
        ...prevState,
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

* 一個 Component 從 建立 => ️️ 更新 => 銷毀

![react-hooks-lifecycle](./img/ReactHookLifecycle.jpeg)

https://wavez.github.io/react-hooks-lifecycle/

![react-class-lifecycle](./img/ReactClassLifecycle.jpeg)

https://yakimhsu.com/project/project_w21_03_React_life_componentDidUpdate.html

![react-lifecycle](./img/ReactLifecycle.jpg)

https://twitter.com/siddharthkmr1/status/1294733239429369857?lang=zh-Hant

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

## [Hooks] useCallback => 情境： 當...後，才能.../ 回呼函式（callback function） / Promise / async function

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

## [Hooks] useContext

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

## [Hooks] useReducer

useReducer 是無法存取 global store，必須搭配 useContext

## [Hooks] useLayoutEffect

## [Hooks] useMergedState

[react-component/util/useMergedState](https://github.com/react-component/util/blob/master/src/hooks/useMergedState.ts)

[我们应该如何优雅的处理 React 中受控与非受控](https://juejin.cn/post/7178485530223444026)

[[Day 15] React controlled components v.s uncontrolled components](https://ithelp.ithome.com.tw/articles/10237281)

通过该 Hook 你可以自由定义表单控件的受控和非受控状态。

在前端工程中，受控元素和被控元素是指在表單中的輸入元素。

受控元素是指表單中的輸入元素，如input、textarea、select等元素，其值是由React或其他JavaScript框架管理的元素。這些元素的值被存儲在組件狀態中，並且只能通過setState()方法更改。

被控元素是指表單中的輸入元素，其值由DOM管理。這些元素的值可以通過JavaScript編程更改，也可以由用戶輸入更改。但是，值並不存儲在組件狀態中，因此在React或其他JavaScript框架中，它們需要透過refs來讀取或更改。

簡而言之，受控元素是由React或其他JavaScript框架管理其值的元素，而被控元素則由DOM管理其值的元素。受控元素的值存儲在組件狀態中，而被控元素的值不是。

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
