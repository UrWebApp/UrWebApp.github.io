---
title: React: クラスベースと関数コンポーネント
date: 2023-03-25
categories: Development
author: johch3n611u
tags:
- Note
- React
---

| Class-based                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Functional Component                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <ul><li>React.Component を継承する必要がある</li><li>ライフサイクルがあり、特定の状況でレンダリングするかどうかを決定できる</li><li>State を設定する必要がある ( Stateful Component )</li><li>this は常に変化するため、いつでも最新の this.props を取得できる</li><li>[より多くの JS の背景知識が必要](/Javascript/LetYouRoughlyUnderstandJsBasics/)</li><li>Hook を使用できない</li><li>render() を定義し、画面にレンダリングする内容を return する必要がある</li><li>this は使用する前に最初にポイントされている必要がある</li></ul> | <ul><li>2019 年 v16.8 Hooks リリース後の主流の書き方</li><li>単なる普通の JavaScript 関数</li><li>Vue 3 に非常によく似ている</li><li>ライフサイクルは useEffect Hook を介する必要がある</li><li>ステートレスコンポーネント State（Stateless）は useState Hook を介する必要がある</li><li>アロー関数または通常の関数で宣言できる</li><li>コンパイルが速くコードが少なく、Class を ES5 に変換する必要がなく、React Component を継承しない</li><li>クロージャーの特性 props は常に最初に渡されたものであり、外側の状態の更新に伴って更新されないため、Hook を介して状態を管理する必要がある</li><li>クロージャーの特性 this はコンポーネント自体に直接バインドされる</li><li>コンテナコンポーネントとプレゼンテーションコンポーネントの分離が容易になる</li></ul> |

## Class-based

```js
class Car extends React.Component {
  constructor() {
    super(props); // constructor で使用する場合にのみ super が必要
    this.state = { name: "miaHsu" };
    this.handleInput = this.handleInput.bind(this);
  }

  handleInput(e) {
    this.setState({ input: e.target.value });
  }

  render() {
    <input onChange={handleInput} value={this.state.name} />
    <h2>Hi, I am a {this.props.name}!</h2>; // super がなくても this.props は使用可能
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

状態や可変データを変更することを避け、再帰や高階関数を使用することで、コードを簡潔にし、テストしやすくし、エラーの発生を回避するプログラミングスタイル。

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

[[React Hook ノート] Custom Hooks - 独自の Hook を構築する](https://medium.com/hannah-lin/react-hook-%E7%AD%86%E8%A8%98-custom-hooks-%E4%B9%8B%E6%89%93%E9%80%A0%E8%87%AA%E5%B7%B1%E7%9A%84-hook-b046f6778f33)

- Hook：React 16.8 バージョンで導入された新機能で、Functional Component で State、Lifecycle を使用してさまざまな状態を管理したり、さまざまな機能を実装したりするための統一された呼び名を提供します。
- Custom Hook / Hook：実際には再利用のために抽出された JS 関数であり、React が提供する Hooks を同様に使用できますが、JavaScript 関数は「use」で始まる名前である必要があり、最終的にデータまたはデータを変更するメソッドを返します。

- Hook メソッドは条件式、ループ、またはネストされた関数内で呼び出すことはできません：これは、Hook の呼び出し順序に要件があるためです。条件式、ループ、またはネストされた関数内で Hook を呼び出すと、Hook 呼び出しの順序が間違ってしまい、コンポーネントの動作に問題が発生する可能性があります。

- use() を介して生成された変数とメソッドは、条件式内で使用できます：これは、React では、レンダリング中にオブジェクトを過度に再作成することを避けるために、Hook で返される状態とメソッドが通常最適化されているため、レンダリングの問題を引き起こすことなく条件式内で使用できるためです。

```js
import { useState, useEffect } from "react";

function useLocalStorage(key, initialValue) {
  // 状態を value とする変数を定義
  const [value, setValue] = useState(() => {
    // localStorage から対応する key の値を取得
    const item = window.localStorage.getItem(key);
    // localStorage に値がある場合はその値を返し、そうでない場合は初期値を返す
    return item ? JSON.parse(item) : initialValue;
  });

  useEffect(() => {
    // value が変更されるたびに、対応する key の値を localStorage に更新
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  // value と setValue を含むオブジェクトを返す
  return { value, setValue };
}
```

## Pure Component / React.memo ( HOC ) Higher Order Component

https://ithelp.ithome.com.tw/articles/10241071

- shouldComponentUpdate()：Class-based Lifecycle で State が変更された後、Render が実行される前に、戻り値によって Render を実行するかどうかが決定されます
- Pure Component：[高階コンポーネントは関数であり、コンポーネントを渡すと新しいコンポーネントを返します](https://hackmd.io/@chrisHsiao/r1ZJu76DD)
- memo：Functional Component 後、memo を介して props が変更されたことを監視する場合にのみ再レンダリングします

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

## 参考

- [React Class-based vs Functional Component 特性から 2 つの書き方の異同について簡単に説明](https://linyencheng.github.io/2020/02/02/react-component-class-based-vs-functional/)
- [Hooks から始めて、Web ページを React にするシリーズ](https://ithelp.ithome.com.tw/users/20103315/ironman/2668?sc=hot)
- [Functional-component vs Class-component](https://www.tpisoftware.com/tpu/articleDetails/2822)
- [React Class Components](https://www.w3schools.com/react/react_class.asp)
- [functional-vs-class-components](https://djoech.medium.com/functional-vs-class-components-in-react-231e3fbd7108)
- [React 初心者 30 日の探索の道 [Day 07] Functional Component v.s Class Component](https://ithelp.ithome.com.tw/articles/10234746)
- [Call child method from parent](https://stackoverflow.com/questions/37949981/call-child-method-from-parent)
