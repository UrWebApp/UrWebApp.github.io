---
title: React Class-based & Functional Component
date: 2023-03-25
categories: Front-End
author: johch3n611u
tags:
- Note
- React
---

|Class-based|Functional Component|
|-------------|-------------|
|<ul><li>需繼承 React.Component</li><li>具有生命週期，可以針對某些情境決定是否渲染</li><li>需要在設置 State ( Stateful Component )</li><li>每次都可以拿到最新的 this.props，因為 this 隨時都在變化</li><li>[需要比較多 JS 的背景知識](/Web/LetYouRoughlyUnderstandJsBasics/)</li><li>不能使用 Hook</li><li>需定義 render() 並將要渲染到畫面上的內容 return</li><li>this 必須在一開始被指向才可以使用</li></ul>||

<table>
    <tr>
        <td>Class-based</td>
        <td>Functional Component</td>
    </tr>
    <tr>
        <td>
<ul>
<li>需繼承 React.Component</li>
<li>具有生命週期，可以針對某些情境決定是否渲染</li>
<li>需要在設置 State ( Stateful Component )</li>
<li>每次都可以拿到最新的 this.props，因為 this 隨時都在變化</li>
<li>[需要比較多 JS 的背景知識](/Web/LetYouRoughlyUnderstandJsBasics/)</li>
<li>不能使用 Hook</li>
<li>需定義 render() 並將要渲染到畫面上的內容 return</li>
<li>this 必須在一開始被指向才可以使用</li>
</ul>
        </td>
        <td>
        </td>
    </tr>
</table>

|Class-based|Functional Component|
|-----|-----|
| * 需繼承 React.Component
  * 具有生命週期，可以針對某些情境決定是否渲染
  * 需要在設置 State ( Stateful Component )
  * 每次都可以拿到最新的 this.props，因為 this 隨時都在變化
  * [需要比較多 JS 的背景知識](/Web/LetYouRoughlyUnderstandJsBasics/)
  * 不能使用 Hook
  * 需定義 render() 並將要渲染到畫面上的內容 return
  * this 必須在一開始被指向才可以使用| |

* Class-based


```js
class Car extends React.Component { 
  constructor() { 
    super(props);
    this.state = { name: "miaHsu" };
  }

  render() {
    return <h2>Hi, I am a {this.props.name}!</h2>;
  }

  this.setState({name: 'BrainLin'});
}
```

* Functional Component
  * 2019 年 v16.8 Hooks 釋出後的主流寫法
  * 單純只是一個普通的 JavaScript 函式
  * 感覺很像 Vue 3
  * 生命週期要透過 useEffect Hook
  * 無狀態組件 State（Stateless）要透過 useState Hook
  * 可以用 Arrow Function 宣告或是一般的 Function
  * 編譯快程式碼更少，不用將 Class 轉換成 ES5，不繼承 React Component
  * 閉包的特性 props 會一直是原本傳進來的那個，而不會跟著外層狀態更新，必須透過 Hook 管控狀態
  * 閉包的特性 this 會直接綁定元件本身
  * 分離容器組件和展示組件會變得更容易

```js
function Car(props) {
  const [count, setCount] = useState(0);
  return <h2>Hi, I am a {props.name}!</h2>;
}

let Car = (props) => {
  return <h2>Hi, I am a {props.name}!</h2>;
}
```

* Functional Programming

* Hooks

## 參考

* [React Class-based vs Functional Component 從特性淺談兩種寫法之異同](https://linyencheng.github.io/2020/02/02/react-component-class-based-vs-functional/)
* [從 Hooks 開始，讓你的網頁 React 起來系列](https://ithelp.ithome.com.tw/users/20103315/ironman/2668?sc=hot)
* [Functional-component vs Class-component](https://www.tpisoftware.com/tpu/articleDetails/2822)
* [React Class Components](https://www.w3schools.com/react/react_class.asp)
* [functional-vs-class-components](https://djoech.medium.com/functional-vs-class-components-in-react-231e3fbd7108)
* [React初心者30天的探索之路 [Day 07] Functional Component v.s Class Component](https://ithelp.ithome.com.tw/articles/10234746)
* [Call child method from parent](https://stackoverflow.com/questions/37949981/call-child-method-from-parent)