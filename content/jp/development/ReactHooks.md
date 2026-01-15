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

useState( データのデフォルト値 )：監視されるデータ変数「変数（count）」と「その変数を変更すると React が画面を再レンダリングするメソッド（setCount）」を作成します

- setSomething を行うたびに、新しいデータで古いデータを上書きします。形式が異なっていても上書きされます。変更または追加したいオブジェクトプロパティを書き出すだけではだめです。
- スプレッド構文を使用して、古いデータを新しいオブジェクトに展開し、変更したいデータを追加または修正します。
- 関連するデータは同じ State に配置し、関連のないデータは別の useState を使用してデータ状態を定義します。
- prevState：useSomething シリーズでは、初期化を除いて、前回の setSomething の値を取得するために prevState を使用するのが最善です。

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

useEffect を知る前に、副作用とは何かを理解する必要があります。

- Side Effect (副作用)：データの取得、イベントの購読、DOM の変更など、レンダリング結果とは無関係な操作を指します。これらの操作はコンポーネントのレンダリング結果に影響を与える可能性がありますが、レンダリング結果とは直接関係ありません。React は、コンポーネントのレンダリング後に副作用を実行して、コンポーネントのレンダリング結果を更新します。

- useEffect( コールバック関数、依存リスト )：「毎回」の画面レンダリング完了後に、`渡された依存リストが変更された場合`に呼び出されます。そのため、固定の [] を依存リストとして渡して一度だけ実行することもできますし、副作用を処理するために利用することもできます。

- コンポーネントの 作成 => 更新 => 破棄

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

## useCallback => シナリオ：...した後でなければ...できない / コールバック関数（callback function） / Promise / async function

上記の方法では、同じ画面でデータの戻る速度が異なるため、それぞれ 2 回レンダリングされる可能性があります。また、async 非同期を使用して両方が戻るのを待ってから一度だけレンダリングすることもできます。

すべてのデータを取得した後に画面の更新を 1 回トリガーします。再利用しない場合は、useEffect 内に記述できますが、[] 観測値 依存パラメータ dependencies が更新されないため、レンダリングは 1 回しか実行されません。

```JS
 useEffect(() => {
    // useEffect 内で fetchData という名前の async function を定義
    const fetchData = async () => {
      // Promise.all と await を使用して、両方の API が応答を取得するのを待ってから続行
      // 配列の分割代入を使用してデータを取り出す
      const [currentWeather, weatherForecast] = await Promise.all([
        fetchCurrentWeather(),
        fetchWeatherForecast(),
      ]);

      // 取得したデータをオブジェクトの分割代入で入れる
      setWeatherElement({
        ...currentWeather,
        ...weatherForecast,
      });
    };

    // fetchData メソッドを呼び出す
    fetchData();
  }, []);

  const fetchCurrentWeather = () => {
    // return を追加して、fetch API が返す Promise を直接返す
    return fetch(/* ... */)
      .then((response) => response.json())
      .then((data) => {
        // ...
        // 取得したデータ内容を返す（ここで setWeatherElement するのではない）
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
    // return を追加して、fetch API が返す Promise を直接返す
    return fetch(/* ... */)
      .then((response) => response.json())
      .then((data) => {
        // ...
        // 取得したデータ内容を返す（ここで setWeatherElement するのではない）
        return {
          description: weatherElements.Wx.parameterName,
          weatherCode: weatherElements.Wx.parameterValue,
          rainPossibility: weatherElements.PoP.parameterName,
          comfortability: weatherElements.CI.parameterName,
        };
      });
  };
```

再利用して再呼び出しするために、共有関数を useEffect の外に移動します。ただし、useEffect 内で使用される関数は直接再利用できますが、ここでは eslint がエラーを報告します。再利用するには依存する必要があるため、dependencies で依存関係を定義する必要があります。ここで重要な点は`このとき handleClick を dependencies に入れると、handleClick が異なると検出されるため、useEffect が繰り返し実行されることです。これは主に JS の特性 [call by ref & value & sharing] によるもので、「オブジェクト」、「配列」、「関数」 => オブジェクト !== オブジェクト` です。このとき、この問題を解決するには `useCallback` を使用する必要があります。

[JavaScript におけるパラメータ渡しを深く掘り下げる：call by value か reference か？](https://blog.techbridge.cc/2018/06/23/javascript-call-by-value-or-reference/)

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

useCallback (関数, dependencies)：コンポーネントが再実行されるたびに、スコープが異なるために 2 つの異なる関数を取得することはありません。`関数を返しますが、dependencies が変更された場合にのみ、この返される関数が変更されます`。Functional Component が再実行されるたびに、関数の内容は明らかに同じですが、異なると判断され、その結果 useEffect が再度呼び出される状況を回避できます。

`ある関数を再利用する必要がない場合は、useEffect 内に直接定義できます。ただし、そのメソッドを共有する必要がある場合は、そのメソッドを useEffect の外に移動した後、useCallback で処理してから useEffect の dependencies に入れることを忘れないでください`

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
    // fetchingData は React コンポーネント内のデータ状態に依存しないため、dependencies 配列に要素を入れません
}, []);

useEffect(() => {
    fetchData();
    // useCallback を介して返された関数を useEffect の dependencies に入れます
  }, [fetchData]);
```

## useMemo 複雑な計算データ結果を保存

dependencies が変更されていない場合、useMemo はもう一度計算することなく、前回計算された結果を直接使用します。`useMemo はコンポーネントのレンダリング時（rendering）に呼び出されるため、この時点で副作用（side effect）のある操作を行うべきではありません。副作用のある操作が必要な場合は、useMemo ではなく useEffect を使用する必要があります`。

`useCallback(fn, deps) は useMemo(() => fn, deps) と等価です`

```JS
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// コンポーネントの外に移動
const weatherCode2Type = (weatherCode) => {
  const [weatherType] =
    Object.entries(weatherTypes).find(([weatherType, weatherCodes]) =>
      weatherCodes.includes(Number(weatherCode))
    ) || [];

  return weatherType;
};
```

## useRef / controlled & uncontrolled components

Controlled と Uncontrolled は、「データが React によって制御されているかどうか」を指します。`<input />` のようなフォーム要素自体は独自のデータ状態を保持できますが、React による制御は ngModel や Reactive Form がフォーム要素をバインドするようなもので、検証や更新などの要件を行うことができます。

Controlled：useState とイベントリスナーを介してフォーム要素と双方向バインディングを行う

Uncontrolled：フォーム内の特定のフィールドの値を取得したいだけの場合や、DOM を直接操作する必要がある場合は、useRef を使用できます。

`useRef：オブジェクト（refContainer）を返します。このオブジェクトは、画面が再レンダリングされるたびに異なるオブジェクトを参照するのではなく、常に同じオブジェクトを参照できます`。

```JS
const refContainer = useRef(initialValue);
const InputElement = () => (
  // refContainer.current はこの <input> を参照します
  <input ref={refContainer} />
)
```

## useContext

https://medium.com/hannah-lin/react-hook-%E7%AD%86%E8%A8%98-usecontext-4bc289976847

useContext context が更新されるたびに、「useContext を使用してその context を取得している」コンポーネントが強制的に更新されます。Context を分割する必要がありますが、これはボイラープレートを引き起こします。

```js
export const OpenContext = React.createContext(true);
export const SetOpenContext = React.createContext(() => {});
<OpenContext.Provider value={isOpen}>
  <SetOpenContext.Provider value={setIsOpen}></SetOpenContext.Provider>
</OpenContext.Provider>;
```

## useReducer

useReducer はグローバルストアにアクセスできません。useContext と組み合わせる必要があります。

## useLayoutEffect

## useMergedState

[react-component/util/useMergedState](https://github.com/react-component/util/blob/master/src/hooks/useMergedState.ts)

[React で受控と非受控をどのようにエレガントに処理すべきか](https://juejin.cn/post/7178485530223444026)

[[Day 15] React controlled components v.s uncontrolled components](https://ithelp.ithome.com.tw/articles/10237281)

この Hook を介して、フォームコントロールの受控状態と非受控状態を自由に定義できます。

フロントエンドエンジニアリングにおいて、受控要素と非受控要素はフォーム内の入力要素を指します。

受控要素とは、フォーム内の入力要素（input、textarea、select など）のことで、その値は React または他の JavaScript フレームワークによって管理されます。これらの要素の値はコンポーネントの状態に保存され、setState() メソッドを介してのみ変更できます。

非受控要素とは、フォーム内の入力要素のことで、その値は DOM によって管理されます。これらの要素の値は JavaScript プログラミングによって変更したり、ユーザー入力によって変更したりできます。ただし、値はコンポーネントの状態に保存されないため、React または他の JavaScript フレームワークでは、refs を介して読み取りまたは変更する必要があります。

簡単に言えば、受控要素は React または他の JavaScript フレームワークによって値が管理される要素であり、非受控要素は DOM によって値が管理される要素です。受控要素の値はコンポーネントの状態に保存されますが、非受控要素の値は保存されません。

## カスタムフック Custom Hook ng Service に類似

`props を介して「文字列」、「オブジェクト」、「配列」、「数値」などのデータを渡すだけでなく、「関数」を直接渡して、分割代入で取り出して使用することもできます`。Custom Hook では、useState、useEffect などの React が提供する Hooks を同様に使用できますが、React Component では最終的に JSX を返しますが、Hook では最終的にデータまたはデータを変更するメソッドを返します。

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

  // 他の React コンポーネントが使用するデータまたはメソッドを返す
  return [weatherElement, fetchData];
};

export default useWeatherApi;

// other Component
import useWeatherApi from "./useWeatherApi";
const [weatherElement, fetchData] = useWeatherApi();
<WeatherCard weatherElement={weatherElement} moment={moment} fetchData={fetchData} />;
```
