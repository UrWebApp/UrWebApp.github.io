---
title: React-Hooks
date: 2023-03-25
categories: Development
author: johch3n611u
tags:
  - Note
  - React
---

## useState

3. useState( Data Default Value ): Create a monitored data variable "variable (count)" and "method that React uses to re-render the screen when modifying this variable (setCount)"

- Every setSomething uses new data to overwrite the old one, even if format is different it will overwrite. Cannot just write object properties to modify or add.
- Use spread operator to bring destroy assignment old data into new object, then add or modify data you want to change.
- Related data should be put in same State, while unrelated data should be defined in separate useState.
- prevState: In useSomething series, except for initialization, it is best to use prevState to be the value of previous setSomething.

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

## useEffect

Before knowing useEffect, need to understand what is side effect.

- Side Effect: Refers to operations unrelated to rendering results, such as data fetching, subscription events, modifying DOM, etc. These operations may affect component rendering results, but are not directly related to rendering results. React will execute side effects after component rendering to update component rendering results.

- useEffect( callback function, dependency list ): After "every" screen rendering is completed, `if passed dependency list changed` it will be called. So you can pass a fixed [] as dependency list to execute only once, can also be utilized to handle side effects.

- A Component from Creation => Update => Destruction

![react-hooks-lifecycle](./img/ReactHookLifecycle.jpeg)

https://wavez.github.io/react-hooks-lifecycle/

![react-class-lifecycle](./img/ReactClassLifecycle.jpeg)

https://yakimhsu.com/project/project_w21_03_React_life_componentDidUpdate.html

![react-lifecycle](./img/ReactLifecycle.jpg)

https://twitter.com/siddharthkmr1/status/1294733239429369857?lang=zh-Hant

```js
import { useState, useEffect } from "react";

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

## useCallback => Scenario: Only when... then... / callback function / Promise / async function

The above method will cause same screen to have data coming back at different speeds, thus rendering twice separately. Can also use async asynchronous to wait for both to return before rendering once.

Trigger screen update once after getting all data. If not reusing, can write inside useEffect, but because [] observation value dependency parameters won't update, so it will only execute rendering once.

```JS
 useEffect(() => {
    // Define async function named fetchData in useEffect
    const fetchData = async () => {
      // Use Promise.all with await to wait for both APIs to get response before continuing
      // Use array destructuring assignment to take out data
      const [currentWeather, weatherForecast] = await Promise.all([
        fetchCurrentWeather(),
        fetchWeatherForecast(),
      ]);

      // Put obtained data via object destructuring assignment
      setWeatherElement({
        ...currentWeather,
        ...weatherForecast,
      });
    };

    // Call fetchData method
    fetchData();
  }, []);

  const fetchCurrentWeather = () => {
    // Add return to directly return Promise returned by fetch API
    return fetch(/* ... */)
      .then((response) => response.json())
      .then((data) => {
        // ...
        // Return obtained data content, instead of setWeatherElement here
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
    // Add return to directly return Promise returned by fetch API
    return fetch(/* ... */)
      .then((response) => response.json())
      .then((data) => {
        // ...
        // Return obtained data content, instead of setWeatherElement here
        return {
          description: weatherElements.Wx.parameterName,
          weatherCode: weatherElements.Wx.parameterValue,
          rainPossibility: weatherElements.PoP.parameterName,
          comfortability: weatherElements.CI.parameterName,
        };
      });
  };
```

To reuse and re-call, move shared function out of useEffect. But function used inside useEffect although can be reused directly, eslint will report error here. Must depend to reuse, so need to define dependency in dependencies. Here is the key point `At this time when placing handleClick into dependencies, it will occur again that detecting handleClick is different so repeat execution of useEffect. Mainly because of JS characteristics [call by ref & value & sharing], "Object", "Array", "Function" => Object !== Object`. At this time, need to use `useCallback` to solve this problem.

[Deep dive into parameter passing in JavaScript: call by value or reference?](https://blog.techbridge.cc/2018/06/23/javascript-call-by-value-or-reference/)

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

useCallback (function, dependencies): It will not get two different functions because of different scopes after each component re-execution. `It will return a function, only when dependencies change, this returned function will change`. Can avoid useEffect being called again because function content is same but judged as different after Functional Component re-execution.

`If a function does not need to be reused, it can be defined directly in useEffect. But if that method needs to be shared, then after moving that method out of useEffect, remember to process with useCallback then put into dependencies of useEffect`

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
    // Because fetchingData does not depend on data state in React component, dependencies array does not take in elements
}, []);

useEffect(() => {
    fetchData();
    // Put function returned through useCallback into dependencies of useEffect
  }, [fetchData]);
```

## useMemo Save complex calculation data results

In case of dependencies not changed, useMemo will directly use result calculated last time without re-calculating once more. `useMemo will be called when component is rendering, therefore should not perform any operation with side effect at this time point; if operation with side effect is needed, should use useEffect instead of useMemo`.

`useCallback(fn, deps) is equivalent to useMemo(() => fn, deps)`

```JS
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// Move out of component
const weatherCode2Type = (weatherCode) => {
  const [weatherType] =
    Object.entries(weatherTypes).find(([weatherType, weatherCodes]) =>
      weatherCodes.includes(Number(weatherCode))
    ) || [];

  return weatherType;
};
```

## useRef / controlled & uncontrolled components

Controlled and Uncontrolled refer to "Whether data is controlled by React". Form elements like `<input />` can keep their own data state, while controlled by React is like ngModel or Reactive Form binding form elements, can do validation or update etc requirements.

Controlled: Two-way binding with form elements through useState and event listening

Uncontrolled: Sometimes may just want to simply get value of certain field in form, or under some situations need to directly operate DOM, can use useRef.

`useRef: Will return an object (refContainer), this object will not refer to different object as every screen re-renders, but can always refer to same object`.

```JS
const refContainer = useRef(initialValue);
const InputElement = () => (
  // refContainer.current will refer to this <input>
  <input ref={refContainer} />
)
```

## useContext

https://medium.com/hannah-lin/react-hook-%E7%AD%86%E8%A8%98-usecontext-4bc289976847

useContext Every time context updates, it will force "Components using useContext to get that context" to update. Must split Context, but this will cause boilerplate.

```js
export const OpenContext = React.createContext(true);
export const SetOpenContext = React.createContext(() => {});
<OpenContext.Provider value={isOpen}>
  <SetOpenContext.Provider value={setIsOpen}></SetOpenContext.Provider>
</OpenContext.Provider>;
```

## useReducer

useReducer cannot access global store, must be paired with useContext

## useLayoutEffect

## useMergedState

[react-component/util/useMergedState](https://github.com/react-component/util/blob/master/src/hooks/useMergedState.ts)

[How should we elegantly handle controlled and uncontrolled in React](https://juejin.cn/post/7178485530223444026)

[[Day 15] React controlled components v.s uncontrolled components](https://ithelp.ithome.com.tw/articles/10237281)

Through this Hook you can freely define controlled and uncontrolled states of form controls.

In frontend engineering, controlled elements and uncontrolled elements refer to input elements in forms.

Controlled elements refer to input elements in form, such as input, textarea, select etc. elements. Their values are managed by React or other JavaScript frameworks. Values of these elements are stored in component state, and can only be changed via setState() method.

Uncontrolled elements refer to input elements in form, their values are managed by DOM. Values of these elements can be changed via JavaScript programming, or changed by user input. However, values are not stored in component state, therefore in React or other JavaScript frameworks, they need to be read or changed via refs.

In short, controlled elements are elements whose values are managed by React or other JavaScript frameworks, while uncontrolled elements are elements whose values are managed by DOM. Value of controlled element is stored in component state, while value of uncontrolled element is not.

## Custom Hook Similar to ng Service

`Through props not only can pass "string", "object", "array", "number" these data types, but also can directly pass "function" in, and extract to use via destructuring assignment`. In Custom Hook, can also use Hooks provided by React like useState, useEffect. Just that in React Component finally you will return JSX, while in Hook finally returns some data or methods to change data.

```js
// useWeatherApi.js
import { useState, useEffect, useCallback } from "react";

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

  // Return data or methods to be used by other React components
  return [weatherElement, fetchData];
};

export default useWeatherApi;

// other Component
import useWeatherApi from "./useWeatherApi";
const [weatherElement, fetchData] = useWeatherApi();
<WeatherCard weatherElement={weatherElement} moment={moment} fetchData={fetchData} />;
```
