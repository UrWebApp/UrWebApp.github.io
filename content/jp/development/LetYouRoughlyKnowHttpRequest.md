---
title: Http Request を大まかに理解させる
date: 2023-01-09
category: Development
author: johch3n611u
tags:
  - Internet
  - Response
  - Request
  - Angular
authorsWords: 毎回忘れるより、将来のために書き留めておく方が良い
---

> この記事は不定期に編集されます。間違いがあれば、遠慮なくご指摘ください。ありがとうございます！
>
> `TL;DR` 得意なものや最新のものを使ってください。なぜなら、これらはすべて HTTP プロトコルの下でのデータ交換方法であり、違いはそれほど大きくないからです。

プロジェクトで Angular Forms と HttpClient のニーズがあるため、以前は fetch や JQ を使用していても、違いを理解せずに直接実装していたので、この部分を整理したいと思います。さあ、始めましょう。

インターネットプロトコル（Internet Protocol）は、インターネットソサエティの下のワーキンググループによって開発されました。主に 2 つのシステム間で情報を伝達するための仕様を定義するために使用されます。以下に私が興味を持っているものをいくつかリストアップし、主にデータ通信の例と比較します。詳細は、直接 [インターネット・プロトコル・スイート Wiki](https://ja.wikipedia.org/wiki/%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%83%8D%E3%83%83%E3%83%88%E3%83%BB%E3%83%97%E3%83%AD%E3%83%88%E3%82%B3%E3%83%AB%E3%83%BB%E3%82%B9%E3%82%A4%E3%83%BC%E3%83%88) を参照してください。

<details>
<summary>アプリケーション層：DNS、POP、FTP、HTTP、HTTPS、ONC/RPC、SSL、SSH、WebSocket</summary>

1. DNS（Domain Name System/Service/Server）：インターネットの電話帳やアドレス帳です。これは非常に単純だと思っていますが、`最後の S は私にとって非常に紛らわしいです。簡単に言えば、N 台のサーバーがあり、彼らが主に行うサービスはドメイン名を IP にマッピングすることです`。
2. POP（Post Office Protocol）：クライアントを使用してサーバー上の電子メールをリモート管理することをサポートします。SSL を適用した後、POP3S（POP - Version 3）とも呼ばれます。IMAP（Internet Message Access Protocol）との違いは、異なるコンピューターからメールにアクセスできるかどうかですが、`実務上、これほど深く触れたことはなく、ほとんどパッケージを使用して解決しています`。
3. FTP（File Transfer Protocol）：コンピューターネットワーク上のクライアントとサーバー間でファイルを転送するために使用されます。SSL を使用すると SFTP になります。実務上、C# では POP と同様に、通常、直接適用できる FTPExtensions やメールパッケージがあります。`デプロイ用に IIS で FTP を設定した印象しかありません`。
4. HTTP、HTTPS（HyperText Transfer Protocol Secure）：HTTPS は実際には SSL を適用した HTTP です。当初は HTML ページを公開および受信する方法を提供していましたが、`派生して URI（Uniform Resource Identifiers：統一資源識別子）を要求し、HTML ファイル、コード、ビデオ、画像などを含めるようになりました。派生したものには URN（Uniform Resource Name：統一資源名）と URL（Uniform Resource Locator：統一資源位置指定子）があります`。
5. ONC/RPC（Open Network Computing Remote Procedure Call）：広く使用されているリモートプロシージャコールシステムです。2019 年の .net conf で初めてこの用語を見ましたが、当時は初心者だったので、必要なかったので詳しくは確認しませんでした。この RPC と比較して、gRPC は言語に依存しない高性能なリモートプロシージャコールフレームワークとしてより多く見られます。gRPC は Web で一般的に使用される Restful API のようであり、どちらもリクエストとレスポンスを処理し、データ交換を行います（Unary、Server streaming、Client streaming、Bidirectional streaming に分かれます）が、gRPC には他の機能や特徴があります（実際には Websocket と組み合わせた Restful のようなものです）。主なデータ交換は JSON から（Protocol Buffer）プロトコルバッファに変更できます。`需要がないため、これ以上深く掘り下げません。違いについては、この記事を確認してください` [RPC vs Restful](https://blog.csdn.net/sun007700/article/details/99672063)。
6. SSL（Secure Sockets Layer）：クライアントとホストの間に暗号化されたリンクを確立するセキュリティプロトコルです。現在は TLS（Transport Layer Security）に置き換えられています。`主にブラウザとサーバー間のハンドシェイクの方法が異なり、本人確認のために CA（Certificate Authority：認証局）が発行した証明書を使用します。` 開発においては、上記と同様に、原理を知っているだけでよく、パッケージやフレームワークの設定を使用します。
7. SSH（Secure Shell）：暗号化されたリモート接続で、主に`公開鍵と秘密鍵の暗号化と復号化`を通じて行われます。公開鍵は、他の人があなたの署名の正しさを確認し、あなたの秘密鍵だけが復号化できるように暗号化するために使用されます。秘密鍵は、署名の作成と復号化に使用されます。
8. WebSocket：単一の TCP（Transmission Control Protocol）トランスポート層プロトコル接続で全二重通信を実行できます。ブラウザとサーバーは、永続的な接続を確立し、双方向データ転送を実行するために、1 回のハンドシェイクを完了するだけで済みます。`SignalR（Microsoft の WebSocket フレームワークで、開発をはるかに容易にするサーバー側とクライアント側のライブラリを提供）や Firebase RxJS で遊んだことがあります。また、Network で狂ったように Request/Response を表示する WebSocket に似た PHP アーキテクチャを見たことがありますが、一般的な Web サイトシステムの開発ではこれに対する需要は少ないようです`。

</details>

## AJAX & API

### AJAX (Asynchronous JavaScript and XML)

> Asynchronous（非同期）

過去の`同期リクエスト（Synchronous Request）`では、フロントエンドは URL またはフォームを介してバックエンドと通信するために同期リクエストを送信し、次のステップに進むにはバックエンドの同期レスポンスを受信する必要がありました。
`非同期リクエスト（Asynchronous Request）`は、整理券を取る概念に似ています。整理券を取って非同期リクエストを送信した後、他のことをして、番号が呼ばれてデータの取得を実行するのを待つことができます。

JavaScript と XML は、JavaScript を介して上記のアクションを実行する Web 開発技術を指します。通信データ形式は XML（Extensible Markup Language）ですが、現在はデータ形式は XML に限定されていませんが、AJAX という名前は続いています。

### API (Application Programming Interface)

> アプリケーション `インターフェース：2つの異なる物質または状態の間の接触面`。

したがって、マクドナルドの注文機、携帯電話、車のダッシュボードなど、人対物に限られません...

また、注文機対中央制御注文システム、モバイル APP 対 APP サーバー、カーシステム対カーオーディオなど、機械対機械も含まれます...

したがって、以下のリクエストは、RFC Http 転送プロトコルに従ってブラウザ大手によって提供されるライブラリ API であり、ブラウザを制御してバックエンドサーバーにリクエストを送信したり、それに基づいてカプセル化された高レベルのライブラリにしたりできます。

## リクエスト通信の例

Angular では、通常 HttpClient を使用してデータコンテンツに直接アクセスします。以下に見るように、これは XMLHttpRequest API Http プロトコルに準拠しており、RxJS observable API の別のレイヤーでラップされているため、オブザーバーデザインパターンの使いやすいコンポーネントになっています。

> What Is HttpClient? `HttpClient` is a built-in service class available in the @angular/common/http package. It has multiple signature and return types for each request. It uses the `RxJS` observable-based APIs, which means it returns the observable and what we need to subscribe it. This API was developed based on `XMLHttpRequest` interface exposed by browsers.

### XMLHttpRequest

> `利点：`
>
> ページをリロードせずに Web ページを更新する。
> ページが読み込まれた後にサーバーからデータをリクエスト/受信する。
> バックグラウンドでサーバーにデータを送信する。

> `欠点：`
>
> 使い勝手が悪く、多くの値を設定する必要がある。
> 初期の IE ブラウザには独自の実装があり、互換性のあるコードが必要だった。

プログラミングを始めたばかりの頃、JQ 以外で最初にバックエンドと通信する方法を学んだのは、Element form、fetch、JQ AJAX、Element form を使用した XMLHttpRequest でした。詳細な xhr メソッドについては、[MDN XMLHttpRequest](https://developer.mozilla.org/ja/docs/Web/API/XMLHttpRequest) を参照してください。

```Javascript
// let promise = new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest ();
    // open (method, url, async, user, password)
    xhr.open ("GET", "server.txt", false); // 接続を確立、async true で responseType を指定可能
    // setRequestHeader (header, value)
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); // ヘッダーを設定
    xhr.onreadystatechange = () => { // 状態が変化したときに関数を呼び出す
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            // リクエスト完了。ここで処理を行う。
        }   else if (xhr.status === 404) {
            // ファイルが見つからない場合の処理
        }
    }
    // xhr.responseType = 'json'; // レスポンスは JSON
    // send (body)
    xhr.send(null);  // リクエスト送信
    console.log(xhr.responseText);  // データ受信

    xhr.onload = function () {
        // レスポンスが読み込まれたときの処理
    };
// });
```

> XMLHttpRequest Response

```js
XMLHttpRequest : {
 onabort: null
 onerror: null
 onload: null
 onloadend: null
 onloadstart: null
 onprogress: null
 onreadystatechange: () => {…}
 ontimeout: null
 readyState: 4
 response: "{'TEST':'ASDASD'}"
 responseText: "{'TEST':'ASDASD'}"
 responseType: "text"
 responseURL: "http://127.0.0.1:8080/server.txt"
 responseXML: (...)
 status: 200
 statusText: "OK"
 timeout: 0
 upload: XMLHttpRequestUpload {onloadstart: null, onprogress: null, onabort: null, onerror: null, onload: null, …}
 withCredentials: false
}
```

### Fetch

> `利点：`
>
> 簡単なクロスオリジン処理。
> XHR の基盤となる API と比較してフォーマットの処理が簡単で、他の技術（例：Service Workers）でも簡単に使用できる。
> Promise API をサポート

> `欠点：`
>
> エラー報告部分はうまくカプセル化されておらず、追加で処理する必要がある。
> Cookie には追加の設定が必要で、デフォルトではない。
> タイムアウト/拒否タイムアウト制御をサポートしていない。
> XHR のようにリクエストの進行状況を監視できない。

上記と比較すると、最大の違いは Promise を返し、内部的に Response オブジェクトを返すことのようです。XMLHttpRequest アプリケーションと比較して、より便利で、データ処理のための多くのメソッドが追加されています。提供されるメソッドとパラメータの詳細については、[MDN Fetch](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch) を参照してください。

> Promise オブジェクトは、非同期操作の最終的な完了（または失敗）とその結果の値を表します。

```Javascript
// let promise<Response> = fetch(url, {options})
fetch('server.txt') // return Promise<Response>
.then((response) => {
    response.json().then((data) => {
            ...
    });
})
.catch((err) => { ... });
```

> Fetch Response

```js
Response : {
    body: (...)
    bodyUsed: false
    headers: Headers {}
    ok: true
    redirected: false
    status: 200
    statusText: "OK"
    type: "basic"
    url: "http://127.0.0.1:8080/server.txt"
}
```

> Fetch Options

```js
// {options}
{
    body: JSON.stringify(data), // 'Content-Type' ヘッダーと一致する必要がある
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, same-origin, *omit
    headers: {
      'user-agent': 'Mozilla/4.0 MDN Example',
      'content-type': 'application/json'
    },
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // *client, no-referrer
}
```

### JQuery ajax

> `利点：`
>
> ネイティブ XHR のカプセル化、互換性の処理、使用の簡素化。
> JSONP のサポートを追加、一部のクロスオリジンを簡単に処理できる。

> `欠点：`
>
> 複数のリクエストと依存関係がある場合、コールバック地獄になりやすい。
> それ自体は MVC アーキテクチャに基づいており、最新のフロントエンド MVVM に準拠していない。
> ajax は jQuery のメソッドです。ajax を使用するためだけに jQuery 全体を導入するのはかさばる。

正直なところ、JQ は個人的なプロジェクトでより多く使用されています。その後のフレームワーク（Vue または Angular）への接触では、通常 fetch または Axios を使用し、フレームワークの Render と組み合わせますが、使用法は実際には上記の 2 つの方法と似ています。公式サイト [jquery.ajax](https://api.jquery.com/jquery.ajax/) からも、ベースは XMLHttpRequest であり、使いやすくカプセル化されているだけで、チェーンでいくつかの使用バリエーションを行うために JQ 機能を使用できることがわかります。

```Js
$.ajax({
    beforeSend:(xhr)=>{xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")},
    url: 'server.txt',
    method: 'GET', // 1.9.0
    // type: 'GET', // prior to 1.9.0.
    dataType: 'json', // サーバーから期待されるデータ型
    processData: false, // 前処理、データをクエリ文字列に変換するかどうか
    contentType: false, // サーバーに送信されるデータ型
    // data: {
    //     // data send to backend
    //     status: 'send request ',
    // },
    success: (success) => { console.log('success', success); },
    error: (error) => { console.log('error', error) },
}).done((response) => {
    console.log(typeof (response), response);
}).fail(function (jqXHR, textStatus, errorThrown) {
    console.log('fail', textStatus, errorThrown);
});
```

```Js
$.ajax({...}).then(function(){
     return $.ajax({...});
}).then(function(){
     return $.ajax({...});
});
```

### Axios

> `利点：`
>
> node.js で使用可能
> Promise API をサポート
> インターセプト処理 / エラー処理 / タイムアウト処理 / フォーマット処理
> XSRF 保護をサポート

> `欠点：`
>
> 新しいブラウザでのみ使用可能。

正直なところ、このパッケージはあまり使ったことがなく、ほとんど Vue と一緒に使っていました。私は主に Angular を開発しているので、ここでは基本的な使い方のみをリストアップします。JQ とあまり変わらない気がします。主に軽量で、fetch のように promise オブジェクトを返し、ブラウザに限定されず node.js でも使用でき、API を管理する Router に似た axios.create インターフェースを提供します。詳細については、[Axios 公式ドキュメント](https://axios-http.com/docs/intro)を参照してください。

```Javascript
axios.get('server.txt')
.then(function (response) {
        console.log(typeof(response),response);
        console.log(arguments) // 関数に渡された引数に対応する配列風オブジェクト
        // arguments は関数呼び出し時に渡された値
        // parameters は関数定義にリストされた変数
})
.catch(function (error) {
        console.log(error);
})
.finally(function () {
        console.log('finally');
});
```

### Form

Form を介した受け渡しといえば、method = "POST/GET" と切り離すことはできません。Get ははがき、Post は手紙です。Get を使用する場合、Request Header Url の後に Query String（Key/Value）を追加します。Post は Request body 内にファイルの内容を追加し、form タグ内の name を持つ対応するフィールドを取得してパラメータ化します。この方法は、URLSearchParams API を介して Url を変更して Query String を実現するのに似ているようです。POST はパラメータを Body に配置し、上記と同様の方法で進行します。設定なしで form を使用すると、[enctype ContentType はデフォルトで application/x-www-form-urlencoded](https://www.w3sheets.com/tags/att_form_enctype.asp) になります。これは、送信前にスペースを + に、特殊記号を ASCII HEX 値に変換することを意味します（ただし、Live Server を使用するとデフォルトで text/html; charset=UTF-8 になります。プロトコルが変更された可能性がありますか？）。これは、次のユニットで説明する ContentType：multipart/form-data に関連しています。

> URLSearchParams + Url + XHR

```Js
let uRLSearchParams = new URLSearchParams();
const userName = document.querySelector('#username');
const password = document.querySelector('#password');
uRLSearchParams.append('username', userName);
uRLSearchParams.append('passward', password);
let url = new URL(`${document.location.origin}${document.location.pathname}`);
url.search = uRLSearchParams;
console.log('url.href',url.href); // http://127.0.0.1:8080/index.html?username=null&passward=null
// その後 xhr get request
```

> Form Get

```html
<form method="get" action="">
  <input type="text" name="username" id="username" />
  <input type="text" name="password" id="password" />
  <input type="text" name="id" />
  <input type="submit" />
</form>

// Header // GET /?username=010101&password=010101 HTTP/1.1 // Host: xxx.toright.com // User-Agent: Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-TW; rv:1.9.2.13) Gecko/20101203 Firefox/3.6.13 GTB7.1 ( .NET CLR 3.5.30729) // Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8 // Accept-Language: zh-tw,en-us;q=0.7,en;q=0.3 // Accept-Encoding: gzip,deflate // Accept-Charset: UTF-8,* // Keep-Alive: 115 // Connection: keep-alive
```

> Form Post

```html
<form method="post" action="">
  <input type="text" name="username" id="username" />
  <input type="text" name="password" id="password" />
  <input type="text" name="id" />
  <input type="submit" />
</form>

// パケット内 // POST / HTTP/1.1 // Host: xxx.toright.com // User-Agent: Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-TW; rv:1.9.2.13) Gecko/20101203 Firefox/3.6.13 GTB7.1 ( .NET CLR 3.5.30729) // Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8 // Accept-Language: zh-tw,en-us;q=0.7,en;q=0.3 // Accept-Encoding: gzip,deflate // Accept-Charset: UTF-8,* // Keep-Alive: 115 // Connection: keep-alive // Content-Type: application/x-www-form-urlencoded // code>Content-Length: 9 // username=&password=&id=010101
```

### FormData

FormData API は、フォームデータの対応する（key/string）コレクションを作成できます。その特徴は、バイナリファイル（File、Blob）を送信できること、およびアップロードされたファイル、画像、ビデオを複数のデータとマージできること（`一般的な Content-Type では通常、1種類の形式のデータしか送信できません`）、および XMLHttpRequest.send() を使用して一度に送信できることです。エンコーディングタイプが multipart/form-data に設定されている場合、フォームと同じ形式で送信されます。その API を使用して、フォーマット変換、暗号化、検証、エラー処理、状態遷移、アクセシビリティなどのデータを迅速に処理することもできます。[MDN FormData](https://developer.mozilla.org/ja/docs/Web/API/FormData)。

> 以下の 3 つの ContentType が最も一般的に使用されているはずです
>
> - multipart/form-data：フォームでサポートされている形式。さまざまな形式のコンテンツを一緒にパッケージ化でき、ファイルを含めることができますが、key/string は JSON のような基本データ型を持つことはできないようです
> - application/json：API で一般的に使用されるファイル交換形式。プレーンテキスト、バイナリコンテンツは非サポート、SAP は通常 JSON を使用してバックエンド Restful とデータを交換します
> - text/plain：プレーンテキストコンテンツ、実際のアプリケーションではあまり見られません

> 拡張読書 [why-is-using-onclick-in-html-a-bad-practice](https://stackoverflow.com/questions/5871640/why-is-using-onclick-in-html-a-bad-practice) ( TL;DR 関心の分離 > セキュリティ )

```Js
// フォームデータを動的に追加
// var formData = new FormData();
// formData.append('username', Chris); // フィールドを追加
// formData.append('image', file); // ファイルも append で追加可能

<form>
    <input type="text" name="fileName"/>
    <input type="file" name="file"/>
    <button type="submit" onClick="customSubmit(event)"></button>
</form>

function customSubmit (event){ // event はオプション
    event.preventDefault(); // submit ネイティブイベントをキャンセル
    // フォーム要素に基づいてフォームデータを直接取得
    let form = document.querySelector('form');
    let formData = new FormData(form);
    for(let [key, value] of formData){
         console.log(data);
    }
    FormData.has('fieldName') // フォームにフィールドが存在するか確認
    ...
    // その後 xhr get request
}

```

## Angular

いよいよ本題です。この記事では主に使い方の違いを整理し、Angular の基本的な部分は無視します。いきましょう！

### Angular HttpClient

- 拡張読書 RxJS
- [Functional Programming](https://fullstackladder.dev/blog/2020/09/25/mastering-rxjs-10-functional-programming-basic-patterns/)
- [Reactive Programming](https://codewithstyle.info/functional-javascript-part-8-functional-reactive-programming-rxjs/)

HttpClient は [上記](#リクエスト通信の例) で述べたように多くの説明を必要としないはずです。主な注意事項は、Will Huang の [Angular で HttpClient を使用する際のさまざまな TypeScript の落とし穴とトリック](https://blog.miniasp.com/post/2019/01/20/Angular-HttpClient-Pitfall-and-Tricks) を参照してください。主に RxJS アプリケーションに精通している必要があります。以前のプロジェクトでは、高度なアプリケーションがなかったため、リアクティブプログラミングはほとんど実装されていませんでした。最近のプロジェクトでは、[combineLatest](https://rxjs.dev/api/index/function/combineLatest) のような、アプリケーション用に 2 つの Observables を組み合わせる使用法を見ましたが、`個人的には、バックエンドの開発期間が長いため、フロントエンドでデータの組み合わせをそれほど複雑にするべきではなく、バックエンドで処理すべきだと感じています...`。

```Js
constructor(private httpClient: HttpClient) {
    this.subscribe = this.httpClient
    .get<any>(this.url)
    .pipe(()=>{
            // ...logic
    }).subscribe(res => {
            this.res = res;
    });
}

ngOnDestroy()
{
    this.subscribe.unsubscribe();
}
```

### Angular Template-Driven Forms

この部分については、インターネット上の達人による詳細な一連の記事 [Angular 徹底解説 30 日：フォームとテスト](https://ithelp.ithome.com.tw/m/users/20090728/ironman/3881) を見つけました。フロントエンドのテスト例もあり、次の研究の方向性を見つけました！

Template-Driven は Reactive Forms に比べて簡単です。検証は、Html ネイティブ検証または Angular Validator Directive を介して迅速に実装できます。以前のプロジェクトでは、カスタムの自作検証モジュールのために両方を除外していたため、これらはあまり使用しませんでした。しかし、複数のフィールド間の複雑な検証、または動的検証、さらには動的フォームフィールドのようなニーズに遭遇したことがあり、確かに非常に面倒ですが、Reactive Forms を介して処理できるようです。

ここでめったに使用されないのは `テンプレート構文` です。ネイティブ js の getElement にかなり似ていますが、Angular で取得するのは NgModel、NgForm、または HTMLFormElement ラップオブジェクトになります。以前は ViewChild と組み合わせて DOM を操作していましたが、ここでは NgModel が提供する value、error パラメータを直接使用し、NgForm invalid パラメータを取得してフィールドを制御します。残りは基本的な Angular 操作です。以前のプロジェクトの自作検証と比較して、確かに高速で簡単です。

> Html

```html
<form #form="ngForm" (ngSubmit)="login()">
  <p>
    <label for="account">アカウント：</label>
    <input type="email" name="account" id="account" required pattern="\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b" #accountNgModel="ngModel" [ngModel]="account" (ngModelChange)="accountValueChange(accountNgModel.value, accountNgModel.errors)" />
    <span class="error-message">{{ accountErrorMessage }}</span>
  </p>
  <p>
    <label for="password">パスワード：</label>
    <input type="password" name="password" id="password" required #passwordNgModel="ngModel" [minlength]="8" [maxlength]="16" [ngModel]="password" (ngModelChange)="passwordValueChange(passwordNgModel.value, passwordNgModel.errors)" />
    <span class="error-message">{{ passwordErrorMessage }}</span>
  </p>
  <p>
    <button type="submit" [disabled]="form.invalid">ログイン</button>
  </p>
</form>
```

> Typescript

```js
export class AppComponent {

  // アカウントフィールドにバインド
  account = '';

  // パスワードフィールドにバインド
  password = '';

  // アカウントフィールドのエラーメッセージ
  accountErrorMessage = '';

  // パスワードフィールドのエラーメッセージ
  passwordErrorMessage = '';

  /**
   * アカウントフィールドにバインドされ、ユーザーがログインアカウントを変更したときにトリガーされ、対応するエラーメッセージを取得します
   *
   * @param {string} account
   * @param {ValidationErrors} errors
   */
  accountValueChange(account: string, errors: ValidationErrors): void {
    this.account = account;
    this.validationCheck(errors, 'account');
  }


  /**
   * パスワードフィールドにバインドされ、ユーザーがパスワードを変更したときにトリガーされます
   *
   * @param {string} password
   * @param {ValidationErrors} errors
   */
  passwordValueChange(password: string, errors: ValidationErrors): void {
    this.password = password;
    this.validationCheck(errors, 'password');
  }

  // フォームにバインドされ、ユーザーがログインボタンを押したときにトリガーされます
  login(): void {
    // do login...
  }

  /**
   * フィールド内の ValidationErrors を介してそのフィールドのエラーメッセージを設定します
   *
   * @param {ValidationErrors} errors 検証するフィールドのエラー (by Angular)
   * @param {'account' | 'password'} fieldName フィールド名
   */
  private validationCheck(
    errors: ValidationErrors,
    fieldName: 'account' | 'password'
  ): void {
    let errorMessage: string;
    if (!errors) {
      errorMessage = '';
    } else if (errors.required) {
      errorMessage = 'このフィールドは必須です';
    } else if (errors.pattern) {
      errorMessage = '形式が正しくありません。再入力してください';
    } else if (errors.minlength) {
      errorMessage = 'パスワードの長さは8文字以上である必要があります';
    }
    this.setErrorMessage(fieldName, errorMessage);
  }

  /**
   * 指定されたフィールドのエラーメッセージを設定します
   *
   * @param {'account' | 'password'} fieldName エラーメッセージを設定するフィールド名
   * @param {string} errorMessage 設定するエラーメッセージ
   */
  private setErrorMessage(
    fieldName: 'account' | 'password',
    errorMessage: string
  ): void {
    if (fieldName === 'account') {
      this.accountErrorMessage = errorMessage;
    } else {
      this.passwordErrorMessage = errorMessage;
    }
  }

}
```

### Angular Model-Driven Forms ( Reactive Forms )

Reactive Forms については、実際には高度な使用法（`複数のフィールド間の複雑な検証、または動的検証、さらには動的フォームフィールド`）に興味がありますが、この部分は元の記事では後ろの方にあるようなので、まずは使い方を学びましょう。必要に応じて、原文を参照してください。

Model-Driven Form はプログラムによってフォームを生成します。主な Directive メンバーは、外側の formGroup と内側の formControl（formControlName、formGroupName、formArrayName）です。以前に開発した .Net Webform コントロールや Razor フォーム検証に非常によく似ています。Reactive Forms では、データバインディングはこれらの Directive と Template Form Elements を介して行い、formBuilder.group を介して Angular が提供する Directive と Validators をフォームにバインドする必要があります。これは以前のプロジェクトで自作した検証モジュールと原理的には似ていますが、Angular が提供するオブジェクトが多く、比較的複雑なので、自由裁量で使用してください。

> Html

```html
<form [formGroup]="formGroup" (ngSubmit)="login()">
  <p>
    <label for="account">アカウント：</label>
    <input type="email" id="account" [formControl]="accountControl" />
    <span class="error-message">{{ getErrorMessage(accountControl) }}</span>
  </p>
  <p>
    <label for="password">パスワード：</label>
    <input type="password" id="password" [formControl]="passwordControl" />
    <span class="error-message">{{ getErrorMessage(passwordControl) }}</span>
  </p>
  <p>
    <button type="submit" [disabled]="formGroup.invalid">ログイン</button>
  </p>
</form>
```

> Typescript

```js
export class LoginComponent implements OnInit {

  // フォームにバインド
  formGroup: FormGroup;

  /**
   * アカウントフィールドのフォームコントロールを取得するために使用されます
   */
  get accountControl(): FormControl {
    return this.formGroup.get('account') as FormControl;
  }

  /**
   * パスワードフィールドのフォームコントロールを取得するために使用されます
   */
  get passwordControl(): FormControl {
    return this.formGroup.get('password') as FormControl;
  }

  /**
   * フォームを作成するために DI を介して FormBuilder オブジェクトを取得します
   */
  constructor(private formBuilder: FormBuilder) {}

  /**
   * Component が初期化されるときにフォームを初期化します
   */
  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      account: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b$/gi)
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(16)
        ]
      ]
    });
  }

  // フォームにバインドされ、ユーザーがログインボタンを押したときにトリガーされます
  login(): void {
    // do login...
  }

  /**
   * フィールドのフォームコントロールを介してそのフィールドのエラーメッセージを取得します
   *
   * @param {FormControl} formControl エラーメッセージを取得するフィールドのフォームコントロール (by Angular)
   */
  getErrorMessage(formControl: FormControl): string {
    let errorMessage: string;
    if (!formControl.errors || formControl.pristine) {
      errorMessage = '';
    } else if (formControl.errors.required) {
      errorMessage = 'このフィールドは必須です';
    } else if (formControl.errors.pattern) {
      errorMessage = '形式が正しくありません。再入力してください';
    } else if (formControl.errors.minlength) {
      errorMessage = 'パスワードの長さは8文字以上である必要があります';
    } else if (formControl.errors.maxlength) {
      errorMessage = 'パスワードの長さは16文字を超えてはなりません';
    }
    return errorMessage;
  }

}
```

## 参照

- [インターネット・プロトコル・スイート Wiki](https://ja.wikipedia.org/wiki/%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%83%8D%E3%83%83%E3%83%88%E3%83%BB%E3%83%97%E3%83%AD%E3%83%88%E3%82%B3%E3%83%AB%E3%83%BB%E3%82%B9%E3%82%A4%E3%83%BC%E3%83%88)
- [Angular の基礎：Angular で HttpClient を使用する方法](https://www.telerik.com/blogs/angular-basics-how-to-use-httpclient)
- [JS XMLHttpRequest 入門チュートリアル（非常に詳細）](http://c.biancheng.net/view/5995.html)
- [SSL、TLS プロトコルの紹介](https://ithelp.ithome.com.tw/articles/10219106)
- [[Security] SSH について知っておくべきすべてのこと](https://codecharms.me/posts/security-ssh)
- [responseType の使用](https://openhome.cc/Gossip/ECMAScript/ResponseType.html)
- [[stackoverflow]fetch-api-vs-xmlhttprequest](https://stackoverflow.com/questions/35549547/fetch-api-vs-xmlhttprequest)
- [通常の socket、rpc、websocket、http(restful) など](https://blog.csdn.net/sun007700/article/details/99672063)
- [setting-xmlhttprequest-responsetype-forbidden-all-of-a-sudden](https://stackoverflow.com/questions/9855127/setting-xmlhttprequest-responsetype-forbidden-all-of-a-sudden)
- [HTTP Method についての議論：フォームの GET と POST の違いは何ですか？](https://blog.toright.com/posts/1203/%E6%B7%BA%E8%AB%87-http-method%EF%BC%9A%E8%A1%A8%E5%96%AE%E4%B8%AD%E7%9A%84-get-%E8%88%87-post-%E6%9C%89%E4%BB%80%E9%BA%BC%E5%B7%AE%E5%88%A5%EF%BC%9F.html)
- [「Form 形式とは何ですか？私は JSON を送信することしか知りません。」](https://marionma-69293.medium.com/form-%E6%A0%BC%E5%BC%8F%E6%98%AF%E4%BB%80%E9%BA%BC-%E6%88%91%E5%8F%AA%E6%9C%83%E5%82%B3-json-%E6%B7%BA%E8%AB%87-urlsearchparams-and-formdata-9da9a65e66ca)
- [[JS] JavaScript を使用して URL を解析し、URL パラメータを処理する](https://pjchender.blogspot.com/2018/08/js-javascript-url-parameters.html)
- [form タグと FormData の応用](https://blog.kalan.dev/2021-03-13-form-and-form-data)
- [18. POST request のいくつかの形式についての議論](https://ithelp.ithome.com.tw/articles/10293658)
- [[機能紹介-10] Reactive Forms (Model-Driven Forms)](https://ithelp.ithome.com.tw/articles/10195280)
- [Angular 徹底解説 30 日：フォームとテスト](https://ithelp.ithome.com.tw/m/users/20090728/ironman/3881)
- [Angular 2 Forms 紹介：Model-Driven Forms](https://blog.crazyalu.com/2016/10/26/angular-model-driven/)
