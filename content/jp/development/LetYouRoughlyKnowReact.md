---
title: React を大まかに理解させる
date: 2023-03-25
category: Development
author: johch3n611u
tags:
  - Note
  - React
---

[必見](https://ithelp.ithome.com.tw/m/users/20129300/ironman/5892)

## Tools

### React、ReactDOM Library

- [React](https://www.npmjs.com/package/react)：`ユーザーインターフェースを作成する`ためのライブラリであり、コンポーネントを定義するために必要な機能のみが含まれており、通常はレンダラーと一緒に使用されます。

React is a JavaScript library `for creating user interfaces`.

The react package contains `only the functionality necessary to define React components`. `It is typically used together with a React renderer` like react-dom for the web, or react-native for the native environments.

- [ReactDOM](https://www.npmjs.com/package/react-dom)：コンポーネントのレンダリング、モジュールのマウント、DOM の操作、SPA ルートノードの作成、JSX 解析の提供に使用されるレンダラーライブラリ。

This package serves as the `entry point to the DOM` and `server renderers for React`. `It is intended to be paired with the generic React package`, which is shipped as react to npm.

### NPM Trends

https://npmtrends.com/angular-vs-react-vs-vue

すべてが統合されている Angular と比較して、React は統合のためにこのような比較ツールがより必要であると感じられます。強力なコミュニティを持つパッケージを見つけることで、基礎となるパッケージの問題に遭遇するのを避けることができます。

### Create-React-App ( cli ) vs Next.js

- CRA は基本的な SPA 開発環境を提供します
- Next.js フレームワークは SPA CSR だけでなく SSR も実行できます。CRA を置き換えることができますが、CRA は Next.js の一部の機能を実行できません。
- CRA は @babel/plugin-proposal-class-properties などを統合しています (コンストラクタを省略して state を直接記述できます)

### React Developer Tools

- 以前 Angular の Tools を使用していたときは、コンポーネント検査のために Html にリンクし直す機能だけが便利でした。あとは、かっこいいモジュール依存関係図のスクリーンショットを撮って開発ドキュメントに載せるくらいでした。prop やその他の機能については、デバッグにはコード内に直接 `console.log` を入れる方が便利なようです。
- React の Tools で便利そうなのは、パフォーマンス表示の Profilers とストップウォッチ React.Suspense です。データ状態が適切に処理されていない場合、これらのコンポーネントで不必要なレンダリング回数が増える可能性があります。そのページの各コンポーネントのレンダリングにかかった時間と回数を確認できます。理由は [仮想 DOM の章](#Virtual-Dom) を参照してください。

### normalize.css

ネイティブブラウザのスタイルを保持し、いくつかのバグを修正する CSS リセットの一種で、使い勝手が良いようです。[Reset CSS と Normalize.css の違い](https://israynotarray.com/css/20210807/3641451940/)

### PWA (Progressive Web App)

1. `serviceWorker.unregister()` を `serviceWorker.register()` に変更
2. PWA の説明ファイル - manifest.json を定義
3. ブラウザ Chrome を使用して開きます。PWA の仕様に準拠しているため、ユーザーにインストールするかどうかを尋ねるプロンプトが自動的に表示されます。

https://create-react-app.dev/docs/making-a-progressive-web-app/

### Codecademy Learn React

https://www.codecademy.com/learn/react-101

### Day.js

https://github.com/pjchender/realtime-weather-app/commit/e37e940001f1acab18a44e21e319761815ac9489

## Virtual DOM

[ネット上ではリアル DOM の操作は遅いと言われていますが、テスト結果は React よりも高速です。なぜですか？ (尤雨溪)](https://www.zhihu.com/question/31809713)

[[Day 09] 単方向データフロー & DOM レンダリング戦略](https://ithelp.ithome.com.tw/articles/10296750?sc=iThelpR)

- repaint (再描画)
- reflow (リフロー)

Angular 2+ ではダーティチェック（dirty checking）を使用しなくなり、より効率的な変更検知を採用しました。Zone.js ライブラリに基づいて、Angular の変更検知器（ChangeDetector）で非同期イベントの実行を追跡およびキャプチャし、テンプレートにバインドされたビュー部分を自動的に更新できます。手動で変更検知をトリガーする方法には、`$apply()` メソッドの呼び出し、`zone.run()` メソッドの使用などがあります...尤氏が言うように、アプリケーションや顧客のニーズを見てフレームワークの使用を検討すべきです。

## React 命名規則

- JSX 属性、変数、関数、イベントハンドラは「キャメルケース（小駝峰）」、クラス、コンポーネントは「パスカルケース（大駝峰）」

## JSX

JavaScript XML ( JSX )：JSX を介すことで、HTML を JavaScript に直接入れて操作できるようになります。`querySelector` を使用して要素を選択してから置き換える必要はなく、HTML 内に JavaScript の変数を直接渡すことができます。

- ReactDOM Library は JSX 解析を提供します
- JSX の内容は `()` 内に入れて変数として扱うことができます
- キーワードの衝突を避けるために、JSX 内の元の属性はすべてキャメルケース名 `className` に変更されます
- キーワードの衝突を避けるために、JSX では `for` = `htmlFor`
- 式は 1 つの値（ルートノード）のみを返すか、`<React.Fragment>`、`<></>` コンテナを使用できます
- InlineStyle Css 属性はキャメルケースに変更する必要があります
- JSX では、タグ内にコンテンツがない場合、自分で閉じることができるため `<div />`、`<div></div>` は不要です
- babel.js が JSX をどのようにコンパイルするか深く理解したい場合は、ChatGPT に `jsx の <button onClick={pop()} /> と <button onClick={pop} /> は babel.js によって何にコンパイルされますか` と尋ねてみてください
- InlineStyle は `{}` である必要があります

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

### イベントハンドラ（Event Handlers）

- JSX `{}` 内は JS 式（Expression）
- 関数の後ろに `()` がない場合、即時実行されません。この方法を使用すると、パラメータが html に漏れる状況が少なくなります。
- `handleClick()` は関数内にラップされており、即時実行されません
- アロー関数を介して関数またはコールバック関数を返す

おそらく JSX は実際には JS のようなものであるため、ここに記述された関数は従来の Html onclick ではなく IIFE になるからだと思います。

```js
<div key={ id } data-id={ id }
     onClick = { 式（expression）}
     onClick={handleIncrement}
     onClick={handleClick('即時実行')}
     onClick={()=>handleClick('即時実行されない')}
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

### If / For フロー制御ロジックを使用して JSX を操作しない

JSX の `{}` 内には式（expressions）のみを入れることができます

`if...else...` ステートメントの代替方法は、論理演算子 `&&`、`||`、三項演算子を使用するか、JS の真偽値の自動変換を利用します。null、NaN、0、空文字列（""、''）、undefined は「false」に変換されます。

`For` ステートメントの代替方法は、配列の `Array.map` ネイティブメソッドを使用し、`<Counter />` 要素を返すことです。

[Array.from](https://juejin.cn/post/6844903926823649293)

```JS
// 要素数 10、要素値 0 ～ 9 の配列を生成
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
    // map を使用して複数の <Counter /> を生成
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

[[Day 11] React CSS の最も重要な些細なこと（下）](https://ithelp.ithome.com.tw/articles/10235714)

Angular と同様に、コンポーネントには独自の css があり、一緒にコンパイルされます。React では、これを統合するために追加のパッケージを使用する必要があります。現在 `styled-components`、`emotion` が選択可能です。パッケージを選択するときは、npm trends を介して同様の機能を持ついくつかのパッケージを比較し、傾向を見て適切なものを見つけることができます。

- CSS の命名衝突を減らす
- コンポーネント CSS のメンテナンスを簡素化
- CSS セレクターの過度なネストを回避
- スタイルを動的に生成するのに便利
- 動的なテーマスタイルを設定するのに便利

```js
// ./src/index.js
import React from "react";
import ReactDOM from "react-dom";
import WeatherApp from "./WeatherApp";

// このインポート方法では、CSS ファイルのスタイルがグローバルに適用されます
import "./styles.css";

function App() {
  return <WeatherApp />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// ./src/WeatherApp.js
import React from "react";
// emotion の styled パッケージをロード
import styled from "@emotion/styled";
// create-react-app が提供する ReactComponent を使用して SVG をロード（以下の方法とともに必要、または Webpack 設定を手動で調整する必要があります）
import { ReactComponent as Cloudy } from "./images/cloudy.svg";
// この方法を使用すると画像のパスが取得され、src 属性に配置する必要がありますが、svg ではなく img 要素の制御性に制限されます
import cloudyIcon from "./images/cloudy.svg";

// styled 付きのコンポーネントを定義
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

// styled(コンポーネント) を使用して、既存のコンポーネントにスタイルを取り込みます
const CloudyIcon = styled(Cloudy)`
  ${(props) => console.log(props)}
  color: ${(props) => (props.theme === "dark" ? "#dadada" : "#212121")};
  /* ここに CSS スタイルを記述 */
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
        description: "晴れ時々曇り",
        temperature: weatherElements.TEMP,
        windSpeed: weatherElements.WDSD,
        humid: weatherElements.HUMD,
      });
    });
};

const WeatherApp = () => {
  return (
    // 定義された styled-component を要素として使用
    <Container>
      <WeatherCard onClick={handleClick}>
        {CurrentWeather.observationTime}
        <img src={cloudyIcon} alt="cloudy icon" />
        <h1>Weather</h1>
        <Cloudy />
        // Emotion を介して作成された Styled Components も React コンポーネントであり、props は同じ方法で機能します
        <CloudyIcon theme="dark" />
      </WeatherCard>
    </Container>
  );
};

export default WeatherApp;
```

### Emotion では、記述された CSS スタイルを JavaScript 関数として保存できます

```JS
// Emotion が提供する css 関数をインポート
import { css } from '@emotion/core';

// CSS スタイルを JavaScript 関数として定義。共有スタイルの関数内でも、props を介して外部から渡されたデータを取得できます
const buttonDefault = (props) => css`
  display: block;
  width: 120px;
  height: 30px;
  font-size: 14px;
  background-color: transparent;
  color: ${props.theme === 'dark' ? '#dadada' : '#212121'};
`;

// Styled Components を定義するときに、定義された CSS スタイルをロードします。同じスタイルは、後で記述されたものが前のものを上書きします
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

### 複数の Icons CSS コンポーネントの記述方法

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

### テーマ theme 切り替え Emotion ThemeProvider コンポーネント

考え方：テーマの配色を定義し、`useState` でテーマ制御状態をバインドします。テーマ変更イベントハンドルでテーマパラメータを Styled Component に渡します。しかし、この方法ではコードを N 箇所変更する必要があるため、ng Service または event bus に似た Emotion `ThemeProvider` コンポーネントを使用し、すべての Styled Components が `ThemeProvider` コンポーネントに渡されたパラメータを取得できるようにします。

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
  // 分割代入
  background-color: ${({ theme }) => theme.backgroundColor};
  ...
`;

<ThemeProvider theme={theme.dark}>
    // <Container theme={theme.dark}>
    <Container />
</ThemeProvider>
```

## Internationalization API 時間表示の最適化

ブラウザネイティブの `Intl` メソッドを使用できます。正式名称は Internationalization API で、日付、時間、数字（通貨）などのデータに対して多言語表示処理を行うことができます。

```JS
{new Intl.DateTimeFormat('zh-TW', {
            hour: 'numeric',
            minute: 'numeric',
          }).format(new Date(currentWeather.observationTime))}
```

## Fetch Request データ取得後の処理

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


// データの処理
const weatherElements = locationData.weatherElement.reduce(
  (neededElements, item) => {
    if (['WDSD', 'TEMP', 'HUMD'].includes(item.elementName)) {
      neededElements[item.elementName] = item.elementValue;
    }
    return neededElements;
  },
  {} // 初期値
);
```

### 2 つ以上の API から取得したデータを Mix する必要がある場合（RxJS combineLatest に類似）

2 つの API Response の順序が不確定な場合、データの 上書きが問題になります。以前同様のシナリオでは、前後で API を Call するか、非同期で状態を更新していました。RxJS Zip combineLatest のようにデータを混合しない場合、実際にはバックエンドで処理するのが最良の選択です（API がこの機能に対して直接データを提供する）。React では、`SetSomething` の別の使用法で処理します。

```JS
const [weatherElement, setWeatherElement] = useState(/* ... */)

const fetchGetXXX1 = () => {
  fetch(...)
  .then((data)=>{
      // setWeatherElement に関数を渡すこともできます
      // この関数のパラメータを介して前のデータ状態を取得できます
      setWeatherElement((prevState => {
          // 新しいデータ状態を返すことを忘れないでください
          return {
              ...prevState            // 元のデータ状態を保持
              rainPossibility: 0.1    // データの追加または更新
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

### ロード中

考え方：ロード中かどうかを制御する状態 `isLoading` を追加し、初期値を `false` にします。`fetch` 開始時に値を `true` に変更し、Style Component を制御して UI を動かします。Response が返ってきたら値を `false` に変更します。

## [React Class-based & Functional Component](/Front-End/ReactClassAndFunctional/)

## Props 親コンポーネントから子コンポーネントへのデータ渡し

- Functional Component で props を使用してデータを渡す場合、key と value の命名は自由です。

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

### 子コンポーネントが親コンポーネントのデータ状態を変更する

`label` 属性の `for` キーワードは javascript の `for` と衝突するため、`htmlFor` に変更されます。

`datalist element`: select に似ていますが、オートコンプリートが可能です。

考え方：`react-router` を使用するのではなく、コンポーネント内のロジック制御パラメータを使用して Component を切り替え、親コンポーネントの制御パラメータ `setXXXXX` メソッドを子階層に props して制御パラメータを変更します。

## [Hooks](/Front-End/ReactHooksItHelpNote/)

## React API

### Ref DOM 操作

`document.getElementById`、`document.getElementsByClassName`...

- リアルタイムアニメーションのトリガー
- サードパーティの DOM ライブラリとの統合
- フォーカス、テキスト選択、またはメディア再生の管理

### forwardRef

`forwardRef` は React の重要な API の 1 つであり、主な目的は、子コンポーネント（child component）が親コンポーネント（parent component）にパラメータを渡せるようにすること、および子コンポーネントの DOM 要素への参照を取得できるようにすることです。

通常、親コンポーネントが子コンポーネント内の DOM 要素に直接アクセスできるようにするには、子コンポーネントでコールバック関数（callback function）を定義し、このコールバック関数を子コンポーネントの props に渡し、子コンポーネントが適切なタイミングでこのコールバック関数を呼び出して、DOM 要素をパラメータとして親コンポーネントに渡す必要があります。

`forwardRef` を使用すると、このプロセスを簡素化できます。`forwardRef` を介して、親コンポーネントは子コンポーネントでコールバック関数を定義することなく、子コンポーネントの DOM 要素への参照を直接取得できます。

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

> `TL;DR` useContext + useReducer (小規模プロジェクトに適しています) は redux を完全に置き換えることはできず、redux も十分であるためには observable にアップグレードする必要があります

vuex、flux、ngrx に似ています。ngrx の統合は優れており、オブザーバーパターン rxjs 関連のコンポーネントを直接使用できます。

Redux：ng service に似た prop drilling を解決します。`reducer` は DAO 層を実装する RxJS に似ていますが、非同期データ処理をサポートしていないため、非同期データリクエストを処理するために `redux-thunk`、`redux saga`、および `redux observable` が使用されます。

Redux useSelector (Provider は 1 つだけ)、async <=> React useContext + useReducer (複数の Provider が必要、ボイラープレート、競合状態の問題)

Reducer：action 命令による CRUD state

Store：すべての Reducer を統合

Provider：prop state に使用される jsx コンポーネント

useSelector：データを取得するための Redux hook

## React Router

https://ithelp.ithome.com.tw/articles/10243368

## 参照

- [[React Hook メモ] useReducer は本当に Redux を完全に置き換えることができますか？ ](https://medium.com/hannah-lin/react-hook-%E7%AD%86%E8%A8%98-usereducer-%E7%9C%9F%E7%9A%84%E8%83%BD%E5%AE%8C%E5%85%A8%E5%8F%96%E4%BB%A3-redux-%E5%97%8E-fabcc1e9b400)
- [Day 16 - Redux を useReducer に置き換える !?](https://ithelp.ithome.com.tw/m/articles/10276005)
- [【Day.22】React パフォーマンス - useContext のパフォーマンス問題を処理する方法](https://ithelp.ithome.com.tw/articles/10249827)
