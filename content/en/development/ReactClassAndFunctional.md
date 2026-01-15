---
title: React: Class-based & Functional Component
date: 2023-03-25
categories: Development
author: johch3n611u
tags:
- Note
- React
---

| Class-based                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Functional Component                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <ul><li>Needs to extend React.Component</li><li>Has lifecycle, can decide whether to render for certain situations</li><li>Need to set State ( Stateful Component )</li><li>Can always get latest this.props, because this changes constantly</li><li>[Requires more JS background knowledge](/Javascript/LetYouRoughlyUnderstandJsBasics/)</li><li>Cannot use Hook</li><li>Need to define render() and return content to be rendered on screen</li><li>this must be pointed at the beginning before it can be used</li></ul> | <ul><li>Mainstream writing style after v16.8 Hooks released in 2019</li><li>Simply a normal JavaScript function</li><li>Feels very like Vue 3</li><li>Lifecycle needs to go through useEffect Hook</li><li>Stateless component State needs to go through useState Hook</li><li>Can be declared with Arrow Function or normal Function</li><li>Compilation is faster with less code, no need to convert Class to ES5, does not inherit React Component</li><li>Closure characteristic props will always be the one originally passed in, and will not update with outer state, must control state through Hook</li><li>Closure characteristic this will strictly bind to component itself</li><li>Separating container components and presentational components becomes easier</li></ul> |

## Class-based

```js
class Car extends React.Component {
  constructor() {
    super(props); // super is needed only if using in constructor
    this.state = { name: "miaHsu" };
    this.handleInput = this.handleInput.bind(this);
  }

  handleInput(e) {
    this.setState({ input: e.target.value });
  }

  render() {
    <input onChange={handleInput} value={this.state.name} />
    <h2>Hi, I am a {this.props.name}!</h2>; // this.props can be used without super
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
      <button onClick={() => setName("BrainLin")}>Change Name</button>
    </div>
  );
}

let Car = (props) => {
  return <h2>Hi, I am a {props.name}!</h2>;
};
```

## Functional Programming

A programming style that avoids changing state and mutable data, uses recursion and higher-order functions, achieving concise code, easier testing, and avoiding errors.

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

[[React Hook Note] Custom Hooks - Building your own Hook](https://medium.com/hannah-lin/react-hook-%E7%AD%86%E8%A8%98-custom-hooks-%E4%B9%8B%E6%89%93%E9%80%A0%E8%87%AA%E5%B7%B1%E7%9A%84-hook-b046f6778f33)

- Hook: A new feature introduced in React 16.8 version, providing a unified name for using State, Lifecycle to manage different states or implement different functions in Functional Component;
- Custom Hook / Hook: Actually just JS Function extracted for reuse, can also use Hooks provided by React, but JavaScript function must be named starting with "use", and finally return some data or methods to change data.

- Hook methods cannot be called in conditions, loops or nested functions: This is because the calling order of Hooks has requirements. If Hook is called in conditions, loops or nested functions, it may cause the order of Hook calls to be wrong, thereby causing problems with component behavior.

- Variables and methods produced through use() can be used inside conditional statements: This is because in React, to avoid recreating objects excessively during rendering, states and methods returned in Hook are usually optimized, so they can be used inside conditional statements without causing rendering problems.

```js
import { useState, useEffect } from "react";

function useLocalStorage(key, initialValue) {
  // Define variable with state as value
  const [value, setValue] = useState(() => {
    // Get value of corresponding key from localStorage
    const item = window.localStorage.getItem(key);
    // If there is value in localStorage, return that value, otherwise return initial value
    return item ? JSON.parse(item) : initialValue;
  });

  useEffect(() => {
    // Update value of corresponding key to localStorage whenever value changes
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  // Return an object containing value and setValue
  return { value, setValue };
}
```

## Pure Component / React.memo ( HOC ) Higher Order Component

https://ithelp.ithome.com.tw/articles/10241071

- shouldComponentUpdate(): In Class-based Lifecycle, after State changes and before Render executes, return value decides whether Render executes
- Pure Component: [Higher Order Component is a function, pass it a component, it returns a new component](https://hackmd.io/@chrisHsiao/r1ZJu76DD)
- memo: Functional Component re-renders only when props change monitored through memo

```js
import React, { memo } from "react";

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

## Reference

- [React Class-based vs Functional Component Discussing differences and similarities of two writing styles from characteristics](https://linyencheng.github.io/2020/02/02/react-component-class-based-vs-functional/)
- [Starting from Hooks, make your web page React series](https://ithelp.ithome.com.tw/users/20103315/ironman/2668?sc=hot)
- [Functional-component vs Class-component](https://www.tpisoftware.com/tpu/articleDetails/2822)
- [React Class Components](https://www.w3schools.com/react/react_class.asp)
- [functional-vs-class-components](https://djoech.medium.com/functional-vs-class-components-in-react-231e3fbd7108)
- [React Beginner 30 Days Exploration Road [Day 07] Functional Component v.s Class Component](https://ithelp.ithome.com.tw/articles/10234746)
- [Call child method from parent](https://stackoverflow.com/questions/37949981/call-child-method-from-parent)
