---
title: Let you roughly understand React
date: 2023-03-25
category: Development
author: johch3n611u
tags:
  - Note
  - React
---

[Must Watch](https://ithelp.ithome.com.tw/m/users/20129300/ironman/5892)

## Tools

### React, ReactDOM Library

- [React](https://www.npmjs.com/package/react): A library for `creating user interfaces`. It only contains the functionality necessary to define components and is typically used together with a renderer.

React is a JavaScript library `for creating user interfaces`.

The react package contains `only the functionality necessary to define React components`. `It is typically used together with a React renderer` like react-dom for the web, or react-native for the native environments.

- [ReactDOM](https://www.npmjs.com/package/react-dom): A renderer library used for rendering components, mounting modules, manipulating the DOM, creating SPA root nodes, and providing JSX parsing.

This package serves as the `entry point to the DOM` and `server renderers for React`. `It is intended to be paired with the generic React package`, which is shipped as react to npm.

### NPM Trends

https://npmtrends.com/angular-vs-react-vs-vue

Compared to Angular where everything is integrated, React feels like it needs this kind of comparison tool more for integration. Finding packages with strong community support avoids encountering underlying package issues.

### Create-React-App ( cli ) vs Next.js

- CRA provides a basic SPA development environment.
- Next.js framework can do SPA CSR as well as SSR. It can replace CRA, but CRA cannot do some of Next.js functions.
- CRA integrates things like @babel/plugin-proposal-class-properties (can omit constructor and write state directly).

### React Developer Tools

- In the past when using Angular Tools, only the function linking back to Html for component inspection was useful. Also, taking screenshots of the cool module dependency graph to put in development documentation. As for props or other functions, it seems debugging is still more convenient by putting `console.log` directly in the code.
- React Tools seem more useful for performance viewing with Profilers and stopwatch React.Suspense. If data state is not handled well, it might cause these components to have unnecessary extra rendering times. You can see the time spent and frequency of rendering for each component in that page. For the reason, see [Virtual DOM chapter](#Virtual-Dom).

### normalize.css

A type of css reset that preserves native browser styles and fixes some bugs, seemingly better to use. [Difference between Reset CSS and Normalize.css](https://israynotarray.com/css/20210807/3641451940/)

### PWA (Progressive Web App)

1. Change `serviceWorker.unregister()` to `serviceWorker.register()`
2. Define PWA description file - manifest.json
3. Use Chrome browser to open. It conforms to PWA standards, so a prompt will automatically pop up asking the user if they want to install.

https://create-react-app.dev/docs/making-a-progressive-web-app/

### Codecademy Learn React

https://www.codecademy.com/learn/react-101

### Day.js

https://github.com/pjchender/realtime-weather-app/commit/e37e940001f1acab18a44e21e319761815ac9489

## Virtual DOM

[Everyone online says manipulating real DOM is slow, but test results are faster than React, why? (Evan You)](https://www.zhihu.com/question/31809713)

[[Day 09] One-way data flow & DOM rendering strategy](https://ithelp.ithome.com.tw/articles/10296750?sc=iThelpR)

- repaint
- reflow

Angular 2+ no longer uses dirty checking, adopting more efficient change detection. Based on the Zone.js library, it can track and capture the execution of asynchronous events in the ChangeDetector in Angular, automatically updating the view parts bound to the template. Manual methods to trigger change detection include calling `$apply()` method, using `zone.run()` method, etc... As Evan You said, one should look at the application and customer needs to decide which framework to use.

## React Naming Conventions

- JSX attributes, variables, functions, event handlers use "camelCase", classes and components use "PascalCase".

## JSX

JavaScript XML ( JSX ): Through JSX, we can directly put HTML into JavaScript to operate. We no longer need to use `querySelector` to select the element before replacing it, but can directly pass JavaScript variables within HTML.

- ReactDOM Library provides JSX parsing
- Content of JSX can be put into `()` and treated as a variable
- To avoid keyword conflicts, original attributes in JSX are changed to camelCase naming `className`
- To avoid keyword conflicts, `for` = `htmlFor` in JSX
- Expressions can only return one value (root node) or use `<React.Fragment>`, `<></>` containers
- InlineStyle Css attributes need to be changed to camelCase
- In JSX if a tag has no content, it can be closed by itself `<div />` so `<div></div>` is not needed
- If you want to deeply understand how babel.js compiles JSX, you can ask ChatGPT `What does babel.js compile <button onClick={pop()} /> and <button onClick={pop} /> into in jsx`
- InlineStyle must use `{}`

```js
const someStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
};

const Counter = (
  <div className="container" style={someStyle}>
    <div className="chevron chevron-up" />
    <div className="number">256</div>
    <div
      className="chevron chevron-down"
      style={{
        color: "#FFE8E8",
        textShadow: "2px 2px #434a54",
      }}
    />
  </div>
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(Counter); // JSX
```

### Event Handlers

- JSX `{}` contains JS expressions
- Without `()` after the function, it will not execute immediately. This method prevents parameter leakage in html.
- `handleClick()` wrapped in a function is not executed immediately
- Return function or Callback Function via arrow function

I guess it's because JSX is actually like JS, causing functions written here to become IIFE instead of Html onclick in the traditional sense.

```js
<div key={id} data-id={id} onClick={expression} onClick={handleIncrement} onClick={handleClick("Execute immediately")} onClick={() => handleClick("Will not execute immediately")}>
  256
</div>;

const handleIncrement = (event) => {
  const { id } = event.target.dataset;
};

function handleClick(type) {
  setCount(type === "increment" ? count + 1 : count - 1);
}

// const handleClick = (type) => () =>
//   setCount(
//     type === 'increment' ? count + 1 : count - 1
//   );
```

### Not using If / For flow control logic to manipulate JSX

Only expressions can be put inside `{}` in JSX.

The replacement for `if...else...` statements uses logical operators, `&&`, `||`, ternary operators, or utilizing JS truthy/falsy value automatic conversion, null, NaN, 0, empty string ("", ''), undefined convert to "false".

The replacement for `For` statements uses the array's `Array.map` native method and returns `<Counter />` elements.

[Array.from](https://juejin.cn/post/6844903926823649293)

```JS
// Create an array with 10 elements, values 0 ~ 9
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
    // Use map to generate multiple <Counter />
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

[[Day 11] The most important small things in React CSS (Part 2)](https://ithelp.ithome.com.tw/articles/10235714)

Similar to Angular, components have their own css compiled together. In React, extra packages are needed to integrate this. Currently `styled-components`, `emotion` are available choices. When choosing a package, you can compare several packages with similar functions via npm trends to see the trend and find a suitable one.

- Reduce CSS naming conflicts
- Simplify component CSS maintenance
- Avoid excessive nesting of CSS selectors
- Convenient for dynamically generating styles
- Convenient for setting dynamic theme styles

```js
// ./src/index.js
import React from "react";
import ReactDOM from "react-dom";
import WeatherApp from "./WeatherApp";

// This import method makes the styles in the CSS file global
import "./styles.css";

function App() {
  return <WeatherApp />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// ./src/WeatherApp.js
import React from "react";
// Load emotion's styled package
import styled from "@emotion/styled";
// Use ReactComponent provided by create-react-app to load SVG (required with the following method, or need to adjust Webpack settings manually)
import { ReactComponent as Cloudy } from "./images/cloudy.svg";
// Using this method gets the image path, must be placed in src attribute, but limited to img element not svg controllability
import cloudyIcon from "./images/cloudy.svg";

// Define component with styled
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

// Use styled(component) to bring styles into existing components
const CloudyIcon = styled(Cloudy)`
  ${(props) => console.log(props)}
  color: ${(props) => (props.theme === "dark" ? "#dadada" : "#212121")};
  /* Write CSS styles here */
  flex-basis: 30%;
`;

// Fetch Request
const handleClick = () => {
  fetch("Url")
    .then((response) => response.json())
    .then((data) => {
      setCurrentWeather({
        observationTime: locationData.time.obsTime,
        locationName: locationData.locationName,
        description: "Partly Cloudy",
        temperature: weatherElements.TEMP,
        windSpeed: weatherElements.WDSD,
        humid: weatherElements.HUMD,
      });
    });
};

const WeatherApp = () => {
  return (
    // Use defined styled-component as an element
    <Container>
      <WeatherCard onClick={handleClick}>
        {CurrentWeather.observationTime}
        <img src={cloudyIcon} alt="cloudy icon" />
        <h1>Weather</h1>
        <Cloudy />
        // Styled Components created via Emotion are still React components, props work the same way
        <CloudyIcon theme="dark" />
      </WeatherCard>
    </Container>
  );
};

export default WeatherApp;
```

### Emotion can save written CSS styles as JavaScript functions

```JS
// Import css function provided by Emotion
import { css } from '@emotion/core';

// CSS styles defined as JavaScript function. In shared style functions, data from outside can also be obtained via props
const buttonDefault = (props) => css`
  display: block;
  width: 120px;
  height: 30px;
  font-size: 14px;
  background-color: transparent;
  color: ${props.theme === 'dark' ? '#dadada' : '#212121'};
`;

// Load defined CSS styles when defining Styled Components. Styles written later override those written earlier
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

### Multi Icons CSS Component Writing Style

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

### Theme switching Emotion ThemeProvider Component

Idea: Define theme color scheme and bind theme control state with `useState`. Pass theme parameter to Styled Component in change theme event handle. But this way code needs to be modified in N places, so use Emotion `ThemeProvider` component, similar to ng Service or event bus, all Styled Components can get the parameters passed into `ThemeProvider` component.

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
  // Destructuring assignment
  background-color: ${({ theme }) => theme.backgroundColor};
  ...
`;

<ThemeProvider theme={theme.dark}>
    // <Container theme={theme.dark}>
    <Container />
</ThemeProvider>
```

## Internationalization API optimize time presentation

Can use browser native `Intl` method, the full name is Internationalization API. It can handle multi-language presentation for data such as date, time, numbers (currency).

```JS
{new Intl.DateTimeFormat('zh-TW', {
            hour: 'numeric',
            minute: 'numeric',
          }).format(new Date(currentWeather.observationTime))}
```

## Processing after Fetch Request data retrieval

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


// Process data
const weatherElements = locationData.weatherElement.reduce(
  (neededElements, item) => {
    if (['WDSD', 'TEMP', 'HUMD'].includes(item.elementName)) {
      neededElements[item.elementName] = item.elementValue;
    }
    return neededElements;
  },
  {} // Initial value
);
```

### When Mix is needed for data obtained from two or more APIs (Similar to RxJS combineLatest)

In the case where the order of two API Responses is uncertain, data overwriting becomes a problem. Previously in similar scenarios, I used sequential Call API or asynchronous update state. If not using similar RxJS Zip combineLatest to mix data, actually handling it in backend is the best choice (API directly gives data for this function). React handles it through another usage of `SetSomething`.

```JS
const [weatherElement, setWeatherElement] = useState(/* ... */)

const fetchGetXXX1 = () => {
  fetch(...)
  .then((data)=>{
      // Can also pass function in setWeatherElement
      // Can get previous data state through parameter of this function
      setWeatherElement((prevState => {
          // Remember to return new data state
          return {
              ...prevState            // Preserve original data state
              rainPossibility: 0.1    // Add or update data
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

### Loading

Idea: Add a state `isLoading` to control whether it is loading, initial value `false`. `fetch` changes value to `true` at the beginning, and controls Style Component to animate UI. Change value to `false` when Response returns.

## [React Class-based & Functional Component](/Front-End/ReactClassAndFunctional/)

## Props Pass data from parent component to child component

- When Functional Component uses props to pass data, key and value naming is up to you.

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

### Child component modifies parent component data state

`label` attribute `for` keyword conflicts with javascript `for`, changed to `htmlFor`.

`datalist element`: Similar to select but allows autocomplete.

Idea: Instead of using `react-router`, use logic control parameters within component to switch Component. Prop the parent component's control parameter `setXXXXX` method to child layer to use for modifying control parameters.

## [Hooks](/Front-End/ReactHooksItHelpNote/)

## React API

### Ref Manipulate DOM

`document.getElementById`, `document.getElementsByClassName`...

- Trigger real-time animation
- Integrate with third-party DOM libraries.
- Manage focus, text selection, or media playback

### forwardRef

`forwardRef` is one of the important APIs in React. Its main purpose is to allow child components to pass parameters to parent components, and can obtain reference to child component DOM elements.

In general, to allow parent component to directly access DOM elements in child component, a callback function needs to be defined in child component, then pass this callback function to child component's props, letting child component call this callback function at appropriate time, passing DOM element as parameter to parent component.

Using `forwardRef` can simplify this process. Through `forwardRef`, parent component can directly obtain reference to child component DOM element without defining callback function in child component.

```js
import React, { forwardRef } from "react";

const MyInput = forwardRef((props, ref) => {
  return <input type="text" ref={ref} {...props} />;
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

> `TL;DR` useContext + useReducer (Suitable for small projects) cannot completely replace redux, and redux also needs to be upgraded to observable to be sufficient.

Similar to vuex, flux, ngrx. Feel that ngrx integration is better, directly having observer pattern rxjs related components to use.

Redux: Solves prop drilling similar to ng service. `reducer` is similar to RxJS implementing DAO layer, but does not support asynchronous data processing, so `redux-thunk`, `redux saga` and `redux observable` are used to handle asynchronous data requests.

Redux useSelector (Just one Provider), async <=> React useContext + useReducer (Needs multiple Providers, boilerplate, race condition issues)

Reducer: CRUD state via action instructions

Store: Integrates all Reducers

Provider: jsx component used for prop state

useSelector: Redux hook to get data

## React Router

https://ithelp.ithome.com.tw/articles/10243368

## References

- [[React Hook Notes] Can useReducer really completely replace Redux?](https://medium.com/hannah-lin/react-hook-%E7%AD%86%E8%A8%98-usereducer-%E7%9C%9F%E7%9A%84%E8%83%BD%E5%AE%8C%E5%85%A8%E5%8F%96%E4%BB%A3-redux-%E5%97%8E-fabcc1e9b400)
- [Day 16 - Replace Redux with useReducer !?](https://ithelp.ithome.com.tw/m/articles/10276005)
- [【Day.22】React Performance - How to handle useContext performance issues](https://ithelp.ithome.com.tw/articles/10249827)
