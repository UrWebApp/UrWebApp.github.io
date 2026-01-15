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
---

> この記事は随時編集されます。誤りがあれば、お気軽に訂正してください。ありがとうございます！
>
> `TL;DR` 得意なものや最新のものなどを直接使用してください。これらはすべて Http プロトコルの下でデータを交換する方法であり、違いはそれほど大きくありません。

プロジェクトで Angular Forms と HttpClient の需要があるため、以前は違いを理解せずに fetch や JQ を使用して直接実装していましたが、この領域を大まかに整理したいと思います。早速本題に入りましょう；

インターネットプロトコル（Internet Protocol）は、インターネットソサエティ（Internet Society）の下にあるワーキンググループによって策定されており、主に 2 つのシステム間で情報を送信するための仕様を定義するために使用されます。以下に私が興味を持っているいくつかをリストし、主にデータ通信のインスタンスを比較します。詳細については、[Internet Protocol Suite Wiki](https://en.wikipedia.org/wiki/Internet_protocol_suite) を直接参照することもできます。

<details>
<summary>アプリケーション層：DNS、POP、FTP、HTTP、HTTPS、ONC/RPC、SSL、SSH、WebSocket</summary>

1. DNS (Domain Name System/Service/Server)：インターネットの電話帳やアドレス帳です。これは非常に簡単だと思いますが、`末尾の S は私にとって非常に紛らわしいです。簡単に言えば、主なサービスがドメイン名を IP にマッピングすることであるサーバーが N 台あるということです`。
2. POP (Post Office Protocol)：クライアントを使用してサーバー上の電子メールをリモート管理することをサポートします。SSL を適用した後は、POP3S (POP - Version 3) とも呼ばれます。IMAP (Internet Message Access Protocol) との違いは、異なるコンピューターを使用して電子メールにアクセスできるかどうかにありますが、`実際には、これに深く触れたことはなく、ほとんどの場合パッケージを使用して解決しています`。
3. FTP (File Transfer Protocol)：コンピューターネットワーク上のクライアントとサーバー間のファイル転送に使用されます。SSL を適用すると SFTP になります。C# での実践的な話では、POP と同様に、通常は FTPExtensions やメールパッケージがあり、直接適用できます。`IIS で FTP を設定してデプロイした印象しかありません`。
4. HTTP, HTTPS (HyperText Transfer Protocol Secure)：HTTPS は実際には HTTP に SSL を適用したものです。当初は HTML ページを公開および受信する方法を提供していました。`HTML ファイル、コード、ビデオ、画像などを含む URI (Uniform Resource Identifiers) を要求するように派生しました。派生物には URN (Uniform Resource Name) と URL (Uniform Resource Locator) が含まれます`。
5. ONC/RPC (Open Network Computing Remote Procedure Call)：広く使用されているリモートプロシージャコールシステム。2019 年の .net conf で初めてこの用語を見ましたが、当時は初心者だったので、使用しなかったため詳しくは理解していませんでした。これと比較して、RPC でよく見られるのは gRPC であり、これは言語に制限されない高性能なリモートプロシージャコールフレームワークです。gRPC は、Web で一般的に使用される Restful API のように、リクエストとレスポンスを処理し、データを交換します（Unary、Server streaming、Client streaming、Bidirectional streaming に分類されます）が、gRPC にはより多くの機能があります（実際には Restful と Websocket を組み合わせたようなものです）。主なデータ交換は JSON から (Protocol Buffer) に変更できます。`需要がないため、これ以上深く掘り下げません。違いについては、この記事を確認してください` [RPC vs Restful](https://blog.csdn.net/sun007700/article/details/99672063)。
6. SSL (Secure Sockets Layer)：クライアントとホストの間に暗号化されたリンクを確立するセキュリティプロトコル。現在は TLS (Transport Layer Security) に置き換えられています。`主にブラウザとサーバーのハンドシェイク（Handshake）の方法が異なり、本人確認のために CA (Certificate Authority) によって発行された証明書を使用します。` 開発では、前のものと同様に、原理を知っていれば十分であり、パッケージやアーキテクチャ設定を使用するだけです。
7. SSH (Secure Shell)：暗号化されたリモート接続、主に `公開鍵/秘密鍵の暗号化/復号化` を介して行われます。公開鍵を使用すると、他人があなたの署名の正しさを検証し、あなたの秘密鍵だけが復号化できるように暗号化できます。秘密鍵は署名と復号化に使用されます。
8. WebSocket：単一の TCP (Transmission Control Protocol) 接続で全二重通信を実行できます。ブラウザとサーバーは、永続的な接続を確立し、双方向データ送信を実行するために、1 回のハンドシェイクを完了するだけで済みます。`SignalR (Microsoft の WebSocket フレームワーク、サーバー側およびクライアント側のライブラリを提供し、開発をはるかに容易にする) と Firebase RxJS で遊んだことがあります。また、PHP アーキテクチャで WebSocket に似たものを見ましたが、ネットワークではクレイジーな Request/Response が表示されていました。しかし、一般的な Web システムを開発する場合、これに対する需要は少ないようです`。

</details>

## AJAX & API

### AJAX (Asynchronous JavaScript and XML)

> Asynchronous = async（非同期）

以前の `同期リクエスト` では、フロントエンドは URL または Form を介して同期リクエストを送信してバックエンドと通信し、次のステップのアクションを検証するためにバックエンドの同期レスポンスを待つ必要がありました。
`非同期リクエスト` は、整理券を取るような概念です。チケットを取って非同期リクエストを送信した後、他のことを実行し、番号が呼ばれてデータ取得を実行するのを待つことができます。

JavaScript と XML は、JavaScript を介して上記のアクションを実行する Web 開発技術のセットを指します。通信データ形式は XML (Extensible Markup Language) ですが、現在はデータ形式は XML に限定されていませんが、AJAX という名前はそのまま残っています。

### API (Application Programming Interface)

> Application `Interface：2 つの異なる物質または状態の間の接触面`。

したがって、マクドナルドの注文キオスク、携帯電話、車のダッシュボードなど、人と物との対話に限定されません...

また、注文キオスクから中央制御注文システムへ、モバイル APP から APP サーバーへ、カーシステムからカーオーディオへなど、機械間の対話も含まれます...

したがって、以下のリクエストのほとんどは、RFC Http 送信プロトコルに従ってブラウザの巨人によって提供されるライブラリ API であり、ブラウザを操作してバックエンドサーバーにリクエストを送信したり、それに基づいてカプセル化された高レベルのライブラリを使用したりできます。

## Request 通信インスタンス

AG (Angular) では、通常 HttpClient を使用してデータに直接アクセスします。以下に示すように、これは使いやすいコンポーネントであり、オブザーバーデザインパターンになっており、XMLHttpRequest API Http プロトコルに基づいて、RxJS observable API の別のレイヤーでラップされています。

> What Is HttpClient? `HttpClient` is a built-in service class available in the @angular/common/http package. It has multiple signature and return types for each request. It uses the `RxJS` observable-based APIs, which means it returns the observable and what we need to subscribe it. This API was developed based on `XMLHttpRequest` interface exposed by browsers.

### XMLHttpRequest

> `Pros:`
>
> リロードせずに Web ページを更新。
> ページがロードされた後にサーバーからデータをリクエスト/受信。
> バックグラウンドでサーバーにデータを送信。

> `Cons:`
>
> 使用するのが面倒で、多くの値を設定する必要がある。
> 初期の IE ブラウザには独自の実装があったため、互換コードが必要だった。

プログラミングを始めたばかりの頃、JQ 以外で、バックエンドと通信するために最初に学んだ方法は、Element form を使用した XMLHttpRequest、fetch、JQ AJAX、Element form でした。詳細な xhr メソッドについては、[MDN XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) を参照してください。

```Javascript
// let promise = new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest ();
    // open (method, url, async, user, password)
    xhr.open ("GET", "server.txt", false); // 接続を確立。async true にすると responseType を指定可能
    // setRequestHeader (header, value)
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); // ヘッダーを設定
    xhr.onreadystatechange = () => { // 状態が変化したときに関数を呼び出す。
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            // リクエスト完了。ここで処理を行う。
        }   else if (xhr.status === 404) {
            // ファイルが見つからない場合の処理
        }
    }
    // xhr.responseType = 'json'; // レスポンスは JSON
    // send (body)
    xhr.send(null);  // リクエストを送信
    console.log(xhr.responseText);  // データを受信

    xhr.onload = function () {
        // レスポンスがロードされたときの処理
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

> `Pros:`
>
> クロスオリジン処理が簡単。
> 基礎となる API は XHR と比較してフォーマットを簡単に処理でき、Service Workers などの他のテクノロジーで簡単に使用できる。
> Promise API をサポート

> `Cons:`
>
> エラー処理のカプセル化が良くないため、追加の処理が必要。
> Cookie には追加の設定が必要で、デフォルトではない。
> タイムアウトをサポートしておらず、タイムアウト制御を拒否する。
> XHR のように Request の進行状況を監視できない。

上記から判断すると、最大の違いは Promise を返し、内部で Response オブジェクトを返すことのようです。XMLHttpRequest アプリケーションと比較して、より便利で、データ処理方法がはるかに多くなっています。詳細なメソッドとパラメータについては、[MDN Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) を参照してください。

> Promise オブジェクトは、完了または失敗しようとしている非同期操作と、その結果の値を表します。

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
    body: JSON.stringify(data), // must match 'Content-Type' header
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

> `Pros:`
>
> ネイティブ XHR のカプセル化、互換性の処理、使い方の簡素化。
> JSONP をサポートし、部分的なクロスオリジンを簡単に処理できる。

> `Cons:`
>
> 依存関係のある複数のリクエストがある場合、コールバック地獄になりやすい。
> MVC アーキテクチャ用に設計されており、現在のフロントエンド MVVM には適していない。
> ajax は jQuery のメソッドです。ajax を使用するためだけに jQuery 全体を導入するのは非常に重い。

正直なところ、JQ はほとんど個人プロジェクトで使用されています。その後、Vue か AG (Angular) かに関わらずフレームワークに触れ、通常は fetch または Axios を使用し、フレームワークの Render と組み合わせると、使い方は実際には上記の 2 つと同様です。公式サイト [jquery.ajax](https://api.jquery.com/jquery.ajax/) から、ベースは XMLHttpRequest であり、使いやすくするためにカプセル化されており、JQ 機能を使用してチェーンでいくつかの使用法の変更を行うことができることがわかります。

```Js
$.ajax({
    beforeSend:(xhr)=>{xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")},
    url: 'server.txt',
    method: 'GET', // 1.9.0
    // type: 'GET', // prior to 1.9.0.
    dataType: 'json', // サーバーからの期待されるデータ型
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

> `Pros:`
>
> node.js で使用可能
> Promise API をサポート
> インターセプト処理 / エラー処理 / タイムアウト処理 / フォーマット処理
> XSRF 防御をサポート

> `Cons:`
>
> 新しいブラウザでのみ使用可能。

正直なところ、このパッケージはあまり使用しておらず、ほとんど Vue で使用していましたが、主に AG を開発しているため、ここでは基本的な使用法のみをリストします。JQ とあまり変わらない感じですが、主に軽量で、fetch のように promise オブジェクトを返し、ブラウザに限定されず node.js で使用でき、API を管理する Router に似た axios.create インターフェイスを提供します。詳細については、[Axios 公式ドキュメント](https://axios-http.com/docs/intro) を直接参照してください。

```Javascript
axios.get('server.txt')
.then(function (response) {
        console.log(typeof(response),response);
        console.log(arguments) // 渡された引数に対応する配列のようなオブジェクト
        // Arguments は呼び出し時に関数に渡される値
        // Parameters は関数定義にリストされている変数
})
.catch(function (error) {
        console.log(error);
})
.finally(function () {
        console.log('finally');
});
```

### Form

Form 送信について話すとき、method = "POST/GET" から切り離すことはできません。Get ははがきのようなもので、Post は手紙のようなものです。Get を使用すると、クエリ文字列（Key/Value）が Request Header Url の後に追加されますが、Post は Request body にファイル内容を追加し、form タグの name 属性を持つ対応するフィールドを取得してパラメータ化します。この方法は、URLSearchParams API を使用して Url を変更し、クエリ文字列の方法を実現するのと似ています。POST はパラメータを Body に配置し、上記と同様に進行します。form を設定せずに使用する場合、[enctype ContentType のデフォルトは application/x-www-form-urlencoded](https://www.w3schools.com/tags/att_form_enctype.asp) であり、送信前にスペースが + に、特殊記号が ASCII HEX 値に変わることを意味します（ただし、Live Server を使用しており、デフォルトは text/html; charset=UTF-8 なので、プロトコルが変更された可能性がありますか？）。これは、次のユニットで説明する ContentType: multipart/form-data に関連しています。

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
// Then xhr get request
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

// Inside Packet // POST / HTTP/1.1 // Host: xxx.toright.com // User-Agent: Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-TW; rv:1.9.2.13) Gecko/20101203 Firefox/3.6.13 GTB7.1 ( .NET CLR 3.5.30729) // Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8 // Accept-Language: zh-tw,en-us;q=0.7,en;q=0.3 // Accept-Encoding: gzip,deflate // Accept-Charset: UTF-8,* // Keep-Alive: 115 // Connection: keep-alive // Content-Type: application/x-www-form-urlencoded // code>Content-Length: 9 // username=&password=&id=010101
```

### FormData

FormData API は、フォームデータの対応する（key/string）コレクションを作成できます。特徴は、バイナリファイル（File, Blob）を送信でき、アップロードされたファイル、画像、ビデオを複数のデータとマージして（`一般的な Content-Type は通常、1 種類のデータしか送信できません`）、XMLHttpRequest.send() を使用して一度に送信できることです。エンコーディングタイプが multipart/form-data に設定されている場合、form と同じ形式で送信されます。また、その API を使用して、データのフォーマット変換、暗号化、検証、エラー処理、状態遷移、アクセシビリティなどを迅速に行うこともできます [MDN FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)。

> 次の 3 つの ContentTypes が最も一般的に使用されるはずです
>
> - multipart/form-data：form でサポートされている形式で、異なる形式のコンテンツを一緒にラップでき、ファイルを運ぶことができますが、key/string には JSON のような基本的なデータ型を含めることができないようです
> - application/json：API の一般的なファイル交換形式、プレーンテキスト、バイナリコンテンツをサポートしていません。SAP は通常、バックエンド Restful とデータを交換するために JSON を使用します
> - text/plain：プレーンテキストコンテンツ、実際のアプリケーションではめったに表示されません

> 拡張リーディング [なぜ html で onclick を使用するのは悪い習慣なのか](https://stackoverflow.com/questions/5871640/why-is-using-onclick-in-html-a-bad-practice) ( TL;DR 関心事の分離 > セキュリティ )

```Js
// フォームにデータを動的に追加
// var formData = new FormData();
// formData.append('username', Chris); // フィールドを追加
// formData.append('image', file); // ファイルも append で入れることができます

<form>
    <input type="text" name="fileName"/>
    <input type="file" name="file"/>
    <button type="submit" onClick="customSubmit(event)"></button>
</form>

function customSubmit (event){ // event はオプション
    event.preventDefault(); // ネイティブの送信イベントをキャンセル
    // form 要素から直接 form データを取得
    let form = document.querySelector('form');
    let formData = new FormData(form);
    for(let [key, value] of formData){
         console.log(data);
    }
    FormData.has('fieldName') // フィールドがフォームに存在するかどうかを確認
    ...
    // Then xhr get request
}

```

## Angular

最後に要点ですが、この記事では主に使用法の違いを整理しています。AG の基本的な部分については言及しません。いきましょう！

### Angular HttpClient

- 拡張リーディング RxJS
- [関数型プログラミング](https://fullstackladder.dev/blog/2020/09/25/mastering-rxjs-10-functional-programming-basic-patterns/)
- [リアクティブプログラミング](https://codewithstyle.info/functional-javascript-part-8-functional-reactive-programming-rxjs/)

HttpClient は [上記](#communication-examples) で述べたように、多くの説明を必要としません。主な注意事項は、Will の [Angular で HttpClient を使用する際のさまざまな TypeScript の落とし穴とコツ](https://blog.miniasp.com/post/2019/01/20/Angular-HttpClient-Pitfall-and-Tricks) を参照できます。主に RxJS のアプリケーションに精通している必要があります。以前のプロジェクトでは高度なアプリケーションをあまり使用せず、リアクティブプログラミングを実装することもめったにありませんでした。最近のプロジェクトでは、[combineLatest](https://rxjs-cn.github.io/learn-rxjs-operators/operators/combination/combinelatest.html) のような使用法を見て、アプリケーションのために 2 つの Observables を組み合わせていますが、`OS 個人的には、バックエンドを長く開発した後、フロントエンドでデータの組み合わせをそれほど複雑にすべきではないと感じており、バックエンドが処理すべきだと感じています...`。

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

詳細な使用法に関する詳細なマスターシリーズ記事 [Angular In-Depth 30 Days: Forms and Testing](https://ithelp.ithome.com.tw/m/users/20090728/ironman/3881) を見つけました。フロントエンドテストの例もあり、次の研究方向を直接見つけました！

Template-Driven は Reactive Forms と比較してシンプルです。Html ネイティブ検証または AG Validator Directive を介して、検証を迅速に実装できます。以前のプロジェクトでは両方を排除し、カスタム検証モジュールを作成したため、これら 2 つをあまり使用しませんでした。しかし、複数のフィールド間の複雑な検証、または動的検証、さらにはフォームフィールドが動的であるなどの要件に遭遇しました。確かにかなり面倒ですが、Reactive Forms を介して処理できるように見えます。

ここでめったに使用されない部分は `Template Syntax` で、ネイティブ js getElement に非常に似ていますが、AG では取得されるのは NgModel、NgForm、または HTMLFormElement によってラップされたオブジェクトになります。ViewChild で DOM を操作していましたが、ここでは NgModel が提供する値、エラーパラメータを直接使用し、NgForm invalid パラメータを取得してフィールドを制御します。残りは基本的な AG 操作であり、確かに以前のプロジェクトの自作検証と比較して高速でシンプルです。

> Html

```html
<form #form="ngForm" (ngSubmit)="login()">
  <p>
    <label for="account">Account: </label>
    <input type="email" name="account" id="account" required pattern="\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b" #accountNgModel="ngModel" [ngModel]="account" (ngModelChange)="accountValueChange(accountNgModel.value, accountNgModel.errors)" />
    <span class="error-message">{{ accountErrorMessage }}</span>
  </p>
  <p>
    <label for="password">Password: </label>
    <input type="password" name="password" id="password" required #passwordNgModel="ngModel" [minlength]="8" [maxlength]="16" [ngModel]="password" (ngModelChange)="passwordValueChange(passwordNgModel.value, passwordNgModel.errors)" />
    <span class="error-message">{{ passwordErrorMessage }}</span>
  </p>
  <p>
    <button type="submit" [disabled]="form.invalid">Login</button>
  </p>
</form>
```

> Typescript

```js
export class AppComponent {

  // account フィールドにバインド
  account = '';

  // password フィールドにバインド
  password = '';

  // account フィールドのエラーメッセージ
  accountErrorMessage = '';

  // password フィールドのエラーメッセージ
  passwordErrorMessage = '';

  /**
   * account フィールドにバインドし、ユーザーがログインアカウントを変更するとこの関数をトリガーし、対応するエラーメッセージを取得します
   *
   * @param {string} account
   * @param {ValidationErrors} errors
   */
  accountValueChange(account: string, errors: ValidationErrors): void {
    this.account = account;
    this.validationCheck(errors, 'account');
  }


  /**
   * password フィールドにバインドし、ユーザーがパスワードを変更するとこの関数をトリガーします
   *
   * @param {string} password
   * @param {ValidationErrors} errors
   */
  passwordValueChange(password: string, errors: ValidationErrors): void {
    this.password = password;
    this.validationCheck(errors, 'password');
  }

  // フォームにバインドし、ユーザーがログインボタンを押すとこの関数をトリガーします
  login(): void {
    // do login...
  }

  /**
   * フィールド内の ValidationErrors を介してフィールドのエラーメッセージを設定します
   *
   * @param {ValidationErrors} errors 検証されるフィールドのエラー（Angular による）
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
      errorMessage = 'パスワードの長さは 8 文字以上である必要があります';
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

Reactive Forms については、実際には高度な使用法についてもっと興味があります（`複数のフィールド間の複雑な検証、または動的検証、さらにはフォームフィールドが動的である`）。しかし、この部分は元の記事の後半にあるようなので、まずは使い方を学び、必要に応じて元の記事をご自身でご覧ください；

Model-Driven Form はプログラム的にフォームを生成します。主な Directive メンバーは、外側の formGroup と内側の formControl ( formControlName, formGroupName, formArrayName ) です。以前の .Net Webform コントロールまたは Razor フォーム検証の開発に非常に似ています。Reactive Forms では、formBuilder.group を介してこれらの Directives を介してデータを Template Form Element とバインドし、AG によって提供される Directives と Validator をフォームにバインドする必要があります。これは、以前のプロジェクトの自作検証モジュールと同じ原則を共有していますが、AG によって提供されるオブジェクトが多く、比較的複雑であるため、使用を検討できると感じています。

> Html

```html
<form [formGroup]="formGroup" (ngSubmit)="login()">
  <p>
    <label for="account">Account: </label>
    <input type="email" id="account" [formControl]="accountControl" />
    <span class="error-message">{{ getErrorMessage(accountControl) }}</span>
  </p>
  <p>
    <label for="password">Password: </label>
    <input type="password" id="password" [formControl]="passwordControl" />
    <span class="error-message">{{ getErrorMessage(passwordControl) }}</span>
  </p>
  <p>
    <button type="submit" [disabled]="formGroup.invalid">Login</button>
  </p>
</form>
```

> Typescript

```js
export class LoginComponent implements OnInit {

  // フォームにバインド
  formGroup: FormGroup;

  /**
   * account フィールドのフォームコントロールを取得するために使用
   */
  get accountControl(): FormControl {
    return this.formGroup.get('account') as FormControl;
  }

  /**
   * password フィールドのフォームコントロールを取得するために使用
   */
  get passwordControl(): FormControl {
    return this.formGroup.get('password') as FormControl;
  }

  /**
   * DI を介して FormBuilder オブジェクトを取得し、フォームを構築
   */
  constructor(private formBuilder: FormBuilder) {}

  /**
   * コンポーネントの初期化時にフォームを初期化
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

  // フォームにバインドし、ユーザーがログインボタンを押すとこの関数をトリガーします
  login(): void {
    // do login...
  }

  /**
   * フィールドのフォームコントロールを介してフィールドのエラーメッセージを取得します
   *
   * @param {FormControl} formControl エラーメッセージを取得するフィールドのフォームコントロール（Angular による）
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
      errorMessage = 'パスワードの長さは 8 文字以上である必要があります';
    } else if (formControl.errors.maxlength) {
      errorMessage = 'パスワードの長さは 16 文字を超えることはできません';
    }
    return errorMessage;
  }

}
```

## References

- [Internet Protocol Suite Wiki](https://en.wikipedia.org/wiki/Internet_protocol_suite)
- [Angular Basics: How To Use HttpClient in Angular](https://www.telerik.com/blogs/angular-basics-how-to-use-httpclient)
- [JS XMLHttpRequest Tutorial (Very Detailed)](http://c.biancheng.net/view/5995.html)
- [Introduction to SSL, TLS Protocols](https://ithelp.ithome.com.tw/articles/10219106)
- [[Security] All you need to know about SSH](https://codecharms.me/posts/security-ssh)
- [Using responseType](https://openhome.cc/Gossip/ECMAScript/ResponseType.html)
- [[stackoverflow]fetch-api-vs-xmlhttprequest](https://stackoverflow.com/questions/35549547/fetch-api-vs-xmlhttprequest)
- [Normal socket, rpc, websocket, http(restful) etc](https://blog.csdn.net/sun007700/article/details/99672063)
- [setting-xmlhttprequest-responsetype-forbidden-all-of-a-sudden](https://stackoverflow.com/questions/9855127/setting-xmlhttprequest-responsetype-forbidden-all-of-a-sudden)
- [Brief talk on HTTP Method: What is difference between GET and POST in form?](https://blog.toright.com/posts/1203/%E6%B7%BA%E8%AB%87-http-method%EF%BC%9A%E8%A1%A8%E5%96%AE%E4%B8%AD%E7%9A%84-get-%E8%88%87-post-%E6%9C%89%E4%BB%80%E9%BA%BC%E5%B7%AE%E5%88%A5%EF%BC%9F.html)
- ["What is Form format? I only know how to send JSON."](https://marionma-69293.medium.com/form-%E6%A0%BC%E5%BC%8F%E6%98%AF%E4%BB%80%E9%BA%BC-%E6%88%91%E5%8F%AA%E6%9C%83%E5%82%B3-json-%E6%B7%BA%E8%AB%87-urlsearchparams-and-formdata-9da9a65e66ca)
- [[JS] Use JavaScript to parse URL and handle URL Parameters](https://pjchender.blogspot.com/2018/08/js-javascript-url-parameters.html)
- [Application of form tag and FormData](https://blog.kalan.dev/2021-03-13-form-and-form-data)
- [18. Brief talk on several POST request formats](https://ithelp.ithome.com.tw/articles/10293658)
- [[Feature Intro-10] Reactive Forms (Model-Driven Forms)](https://ithelp.ithome.com.tw/articles/10195280)
- [Angular In-Depth 30 Days: Forms and Testing](https://ithelp.ithome.com.tw/m/users/20090728/ironman/3881)
- [Angular 2 Forms Introduction: Model-Driven Forms](https://blog.crazyalu.com/2016/10/26/angular-model-driven/)
