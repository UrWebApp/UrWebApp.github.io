---
title: 讓你大概搞懂 Http Request 在幹什麼！
date: 2023-01-09
categories: Internet
author: johch3n611u
tags:
- Internet
- Response
- Request
- Angular
- Front-End
---

> 此文章會不定時編修，如有錯誤在麻煩各位大神請不吝設指教，感謝！
>
> `TL;DR` 直接使用擅長的或是最新的，因為都是在 Http 協議下的交換資料方式，差異不會大到哪

因為專案上有 Angular Forms 與 HttpClient 的需求，以往不管是用 fetch 或是 JQ 都直接實作也沒搞清楚差異，所以想針對這塊去做一些總整理，話不多說直接開幹；

網路通訊協議 (Internet Protocol) 是由網際網路協會底下的工作小組制定而成，主要是用來定義在兩個系統中傳播資訊的規格，以下列出一些我比較有興趣的，主要還是會以資料溝通的實例去比較，詳細的也可以直接參考 [網路傳輸協定 Wiki](https://zh.wikipedia.org/zh-tw/%E7%BD%91%E7%BB%9C%E4%BC%A0%E8%BE%93%E5%8D%8F%E8%AE%AE)。

<details>
<summary>應用層：DNS、POP、FTP、HTTP、HTTPS、ONC/RPC、SSL、SSH、WebSocket</summary>

1. DNS (Domain Name System/Service/Server)：是網際網路的電話簿、地址冊，我覺得這蠻簡單的但就是`最後面的 S 對我來說超容易混亂的，簡單來講就是有 N 台 Server 他主要做的 Service 事情就是 Domain Name 對應 IP 這件事情`。
2. POP (Post Office Protocol)：支援使用客戶端遠端管理在伺服器上的電子郵件，套用了 SSL 後又被稱為 POP3S (POP - Version 3)，而與 IMAP (Internet Message Access Protocol) 差異在於能否用不同台電腦存取郵件，`但這在實務上目前也沒碰到這麼深，多使用套件解決掉`。
3. FTP (File Transfer Protocol)：用於在電腦網路上在客戶端和伺服器之間進行檔案傳輸，套上 SSL 則為 SFTP，實務上以 C# 來講也像是 POP 一樣，通常會有 FTPExtensions 或是郵件的 package 庫，可以直接套用，`比較有印象的只有 IIS 上設置 FTP 進行上版`。
4. HTTP、HTTPS (HyperText Transfer Protocol Secure)：HTTPS 其實就是 HTTP 套用 SSL，最初提供一種發布和接收HTML頁面的方法，`衍生也能請求 URI (Uniform Resource Identifiers) 統一資源標識符 包含像是 HTML檔案、程式碼、影片、圖片等等，而衍生的還有 URN (Uniform Resource Name) 資源名稱、URL (Uniform Resource Locator) 資源位址地址`。
5. ONC/RPC (Open Network Computing Remote Procedure Call)：一種被廣泛應用的遠端程序呼叫系統，第一次見到這個詞是在 2019 的 .net conf 上，但對當時還是小菜雞的我來說用不到就沒詳細去理解了，相較於而此 RPC 較多看到的是 gRPC 是不限於語言的高效能遠端程序呼叫架構，gRPC 就像 Web 常用的 Restful API 一樣，都是在處理請求和回應，並且進行資料交換 (分為 Unary、Server streaming、Client streaming、Bidirectional streaming)，但 gRPC 還多了其他的功能和特色 ( 其實就像是 Restful 結合 Websocket )，主要的交換資料可以由 JSON 改為 (Protocol Buffer) 協議緩衝區，`因為沒有需求這就不深入去研究了，差異比較可以看看這篇` [RPC vs Restful](https://blog.csdn.net/sun007700/article/details/99672063)。
6. SSL (Secure Sockets Layer)：是一種安全協議，讓客戶端與主機之間建立一個密碼連結，現被 TLS (Transport Layer Security) 取代，`主要就是瀏覽器與伺服器 Handshake 的方式會有所不同，並且使用 CA (Certificate Authority) 所頒發的憑證交換來進行身分確認，`在這開發上來講如同前列一樣只要知道原理，使用套件或架構設定就好。
7. SSH (Secure Shell)：有加密過的遠程連線，主要透過`公私鑰加解密`，公鑰用來讓別人確認你的簽名的正確性，並將東西加密為只有你私鑰能夠解密，私鑰責用來製作簽名與解密。
8. WebSocket：可在單個 TCP (Transmission Control Protocol) 傳輸層協議，連接上進行全雙工通訊，瀏覽器和伺服器只需要完成一次交握，兩者之間就可以建立永續性的連接，並進行雙向資料傳輸。`自己玩的時候碰過 SignalR (微軟的 WebSocket 架構，提供伺服器端與客戶端的 Library 讓開發簡易化很多)，還有 Firebase RxJS，還看過 PHP 類似 WebSocket 的架構會在 Network 看到瘋狂 Request/Response，但真的開發一般的網站系統上好像比較少這方面的需求`。

</details>

## AJAX & API

### AJAX (Asynchronous JavaScript and XML)

> Asynchronous = 非同步 = 異步

以往`同步請求`，前端透過 URL 或 Form 發出 Synchronous Request 與後端溝通，必須要接收到後端的 Synchronous Response 才能繼續下一步動作。
`非同步請求`則是類似抽號碼牌的概念，抽完號碼牌發出 Asynchronous Request 則就可以去做其他事情等叫號再來執行領取資料。

而 JavaScript and XML 則是指這是一套透過 JavaScript 執行上述動作的網頁開發技術，溝通的資料格式為 XML (Extensible Markup Language)，但現在資料格式不局限於 XML 但 AJAX 還是延續下來。

### API (Application Programming Interface)

> 應用程式 `介面：兩種不同物質或狀態之間的接觸面`。

所以不限於人對物 e.g. 麥當勞點餐機、手機、汽車面板 etc...

還包括機器對機器 e.g. 點餐機對中控點餐系統、手機 APP 對 APP 伺服器、汽車系統對汽車音響 etc ...

所以以下 Request 多半是瀏覽器大廠根據 RFC Http 傳輸協議，去提供的函式庫 API 讓你可以操控瀏覽器去對後端伺服器發送 Request 或以之為基底所封裝的高階一點的函式庫。

## Request 溝通實例

在 AG 中應該通常都使用 HttpClient 直接存取資料內容，從下面可以看到，這是以 XMLHttpRequest API Http 協議，再包一層 RxJS observable 的 API，製作成觀察者設計模式的易用組件。

> What Is HttpClient? `HttpClient` is a built-in service class available in the @angular/common/http package. It has multiple signature and return types for each request. It uses the `RxJS` observable-based APIs, which means it returns the observable and what we need to subscribe it. This API was developed based on `XMLHttpRequest` interface exposed by browsers.

### XMLHttpRequest

> `優點：`
>
> 不重新載入頁面的情況下更新網頁。
> 在頁面已載入後向伺服器請求/接收資料。
> 在背景程式向伺服器發送資料。

> `缺點：`
>
> 使用起來也比較繁瑣，需要設置很多值。
> 早期的IE瀏覽器有自己的實現，這樣需要寫兼容代碼。

記得一開始接觸程式，除了 JQ 以外第一個學習與後端溝通的方式，就是透過 XMLHttpRequest 與 Element form、fetch、JQ AJAX、Element form，xhr 詳細的方法可以參考 [MDN XMLHttpRequest](https://developer.mozilla.org/zh-TW/docs/Web/API/XMLHttpRequest)。

```Javascript
// let promise = new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest ();
    // open (method, url, async, user, password)
    xhr.open ("GET", "server.txt", false); //建立连接 async true 才可以指定 responseType
    // setRequestHeader (header, value)
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); // 設置標頭
    xhr.onreadystatechange = () => { // Call a function when the state changes.
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            // Request finished. Do processing here.
        }   else if (xhr.status === 404) {
            // Do something when file not found
        }
    }
    // xhr.responseType = 'json'; // 回應是 JSON
    // send (body)
    xhr.send(null);  //发送请求
    console.log(xhr.responseText);  //接收数据

    xhr.onload = function () {
        // Do something when response loaded
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

> `優點：`
>
> 簡單的跨域的處理。
> 底層 API 相較於 XHR 可以輕鬆處理格式，也可以容易地被其他技術使用 e.g. Service Workers。
> 支持 Promise API

> `缺點：`
>
> 報錯的部分封裝的並不好，需要額外去處理。
> cookie 需要額外的設定並沒有 default。
> 不支援超時、拒絕 timeout 控制。
> 無法像 XHR 監測 Request 進度。

與上述來看感覺最大差異是在反傳 Promise 與內部是回傳 Response 物件，相較於 XMLHttpRequest 應用較為方便，多了許多處理資料的方法，提供的方法與參數詳細可以參考 [MDN Fetch](https://developer.mozilla.org/zh-TW/docs/Web/API/Fetch_API/Using_Fetch)

> Promise 物件代表一個即將完成、或失敗的非同步操作，以及它所產生的值。

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

> `優點：`
>
> 對原生 XHR 的封裝，做了兼容處理，簡化了使用。
> 增加了對 JSONP 的支持，可以簡單處理部分跨域。

> `缺點：`
>
> 如果有多個請求，並且有依賴關係的話，容易形成回調地獄。
> 本身是針對 MVC 的架構，不符合現在前端 MVVM 。
> ajax 是 jQuery中的一個方法。如果只是要使用 ajax 卻要引入整個 jQuery 會很大包。

JQ 說實在的也比較在個人專案有使用，後續接觸到框架不管是 Vue 或 AG 通常就是使用 fetch 或 Axios，並且搭配框架的 Render，使用上跟上述兩種方式其實也差不多，從官網 [jquery.ajax](https://api.jquery.com/jquery.ajax/) 也可以知道基底是 XMLHttpRequest 只是說有在封裝得更好用一些，且可以利用 JQ 特性鍊式做一些使用上的變化。

```Js
$.ajax({
    beforeSend:(xhr)=>{xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")},
    url: 'server.txt',
    method: 'GET', // 1.9.0
    // type: 'GET', // prior to 1.9.0.
    dataType: 'json', // 希望 server 回傳的資料類型
    processData: false, // 預先處理，是否將 data 轉成 query string
    contentType: false, // 指定傳送到 server 的資料類型
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

> `優點：`
>
> 可在 node.js 中使用
> 支持 Promise API
> 攔截處理 / 錯誤處理 / 超時處理 / 格式處理
> 支援防禦 XSRF

> `缺點：`
>
> 較新的瀏覽器才能使用。

這個套件說實在也沒用過幾次，比較多搭配 Vue 使用，但我主要是開發 AG 的，所以這裡就只列出基本使用方式，感覺跟 JQ 也沒有太大差異，主要是其輕量化、與 fetch 一樣反傳 promise 物件，不限於瀏覽器在node.js中也能使用，提供 axios.create 類似於 Router 管理 API 的介面，詳細請直接參考 [Axios 官方文件](https://axios-http.com/zh/docs/intro)。

```Javascript
axios.get('server.txt')
.then(function (response) {
        console.log(typeof(response),response);
        console.log(arguments) // 對應傳入函式之引數的類陣列物件
        // 引數是當我們呼叫函式時傳遞給它的值
        // 參數是我們在函式定義中所列出的變數
})
.catch(function (error) {
        console.log(error);
})
.finally(function () {
        console.log('finally');
});
```

### Form

談到透過 Form 傳遞就離不開 method = "POST/GET" ，Get 之於明信片、Post 之於信件，使用 Get 時使用 Query String (Key/Vaule) 加註在 Request Header Url 之後，而 Post 則在 Request body 內加註檔案內容，且抓取 form 標籤內有 name 的對應欄位去做參數化，這方式似乎是類似透過 URLSearchParams API 進行對 Url 的修改達到 Query String 的方式，POST 則是將參數放置到 Body 然後也是進行類似上述方式，使用 form 若無設定 [enctype ContentType 會預設為 application/x-www-form-urlencoded](https://www.w3school.com.cn/tags/att_form_enctype.asp)，指的是送出前會將空格轉為+、特殊符號轉為 ASCII HEX 值 ( 但我用 Live Server 都默認 text/html; charset=UTF-8 可能協議有改? )，這關係到下一單元所講的 ContentType：multipart/form-data。

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
// 再透過 xhr get request
```

> Form Get

```html
<form method="get" action="">
    <input type="text" name="username" id="username" />
    <input type="text" name="password" id="password" />
    <input type="text" name="id" />
    <input type="submit" />
</form>

// Header

// GET /?username=010101&password=010101 HTTP/1.1
// Host: xxx.toright.com
// User-Agent: Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-TW; rv:1.9.2.13) Gecko/20101203 Firefox/3.6.13 GTB7.1 ( .NET CLR 3.5.30729)
// Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
// Accept-Language: zh-tw,en-us;q=0.7,en;q=0.3
// Accept-Encoding: gzip,deflate
// Accept-Charset: UTF-8,*
// Keep-Alive: 115
// Connection: keep-alive
```

> Form Post

```html
<form method="post" action="">
    <input type="text" name="username" id="username" />
    <input type="text" name="password" id="password" />
    <input type="text" name="id" />
    <input type="submit" />
</form>

// 封包內

// POST / HTTP/1.1
// Host: xxx.toright.com
// User-Agent: Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-TW; rv:1.9.2.13) Gecko/20101203 Firefox/3.6.13 GTB7.1 ( .NET CLR 3.5.30729)
// Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
// Accept-Language: zh-tw,en-us;q=0.7,en;q=0.3
// Accept-Encoding: gzip,deflate
// Accept-Charset: UTF-8,*
// Keep-Alive: 115
// Connection: keep-alive
// Content-Type: application/x-www-form-urlencoded
// code>Content-Length: 9
// username=&password=&id=010101
```

### FormData

FormData API 可以將表單資料建立相對應的的（key/string）集合，特點是可以傳送二進制檔案（File、Blob)，並且可以將上傳檔案、圖片、影片與複數個資料合併 (`一般的 Content-Type 往往只能傳送一種形式的資料`)，並用 XMLHttpRequest.send() 一次傳送出去。它在編碼類型設定為 multipart/form-data 時會採用與表單相同的格式送出，也可以利用它的 API 快速的去針對資料做轉格式、加密、驗證、錯誤處理、狀態轉換、Accessibility等其餘處理 [MDN FormData](https://developer.mozilla.org/zh-TW/docs/Web/API/FormData)。

> 以下三種 ContentType 應該是最常使用到的了
>
> * multipart/form-data：表單支援的格式，可以將不同格式的內容包在一起，可以夾帶檔案，但似乎是 key/string 無法像 JSON 有基礎資料型別
> * application/json：API 常用的檔案交換格式，純文字，不支援二進位內容，SAP 通常用 JSON 與後端 Restful 交換資料
> * text/plain：純文字內容，實際應用中不常出現

> 延伸閱讀 [why-is-using-onclick-in-html-a-bad-practice](https://stackoverflow.com/questions/5871640/why-is-using-onclick-in-html-a-bad-practice) ( TL;DR 關注點分離 > 資安 )

```Js
// 動態增加表單的資料
// var formData = new FormData();
// formData.append('username', Chris); // 增加欄位
// formData.append('image', file); // 檔案也可以透過 append 放進來

<form>
    <input type="text" name="fileName"/>
    <input type="file" name="file"/>
    <button type="submit" onClick="customSubmit(event)"></button>
</form>

function customSubmit (event){ // event 可帶可不帶
    event.preventDefault(); // 取消 submit 原生事件
    // 直接根據表單元素取得表單資料
    let form = document.querySelector('form');
    let formData = new FormData(form);
    for(let [key, value] of formData){
         console.log(data);
    }
    FormData.has('fieldName') // 檢驗表單中是否有該欄位
    ...
    // 再透過 xhr get request
}

```

## Angular

終於到重點了，此篇文章主要整理使用上的差異，AG 就不提一些基本的部分了，接著上！

### Angular HttpClient

* 延伸閱讀 RxJS
* [Functional Programming](https://fullstackladder.dev/blog/2020/09/25/mastering-rxjs-10-functional-programming-basic-patterns/)
* [Reactive Programming](https://codewithstyle.info/functional-javascript-part-8-functional-reactive-programming-rxjs/)

HttpClient 應該沒什麼好講的如前文[所述](#溝通實例)，主要的注意事項可以參考保哥的[在 Angular 使用 HttpClient 的各種 TypeScript 地雷與陷阱](https://blog.miniasp.com/post/2019/01/20/Angular-HttpClient-Pitfall-and-Tricks)，主要應該是要熟悉對於 RxJS 的應用，先前專案都沒有進階應用比較少實作反應式的程式，在近期專案看到類似 [combineLatest](https://rxjs-cn.github.io/learn-rxjs-operators/operators/combination/combinelatest.html) 這種使用方式，結合兩個 Observables 去做應用，但 `OS 較長開發後端私心來說感覺前端不應該把資料組合搞得這麼複雜，感覺後端處理掉就好...`。

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

這部分在網路上有找到詳細的大神系列文章 [Angular 深入淺出三十天：表單與測試](https://ithelp.ithome.com.tw/m/users/20090728/ironman/3881) 而且還有前端的測試範例，直接找到下個研究方向！

Template-Driven 相較於 Reactive Forms 較為簡易，透過 Html 原生的驗證或是 AG Validator Directive 可以快速的實作驗證，之前專案上有撇除兩者自製的驗證模組，對於這兩者比較沒有使用到，但像是多個欄位之間會有複雜的驗證，抑或是動態的驗證，甚至連表單的欄位是動態，這種需求也有遇到過，確實是蠻麻煩的，似乎可以透過 Reactive Forms 處理。

這裡比較少用到的地方是 `範本語法` 感覺蠻像原生 js 的 getElement，但在 AG 這取得的會是 NgModel、NgForm 或 HTMLFormElement 包裝好的物件，以往都是搭配 ViewChild 操作 DOM，這裡直接使用 NgModel 所提供的參數 value、error，並抓取 NgForm invalid 參數卡控欄位，後面的就是基本 AG 操作了，相較於先前專案自製驗證確實快速且簡單。

> Html

```html
<form #form="ngForm" (ngSubmit)="login()">
  <p>
    <label for="account">帳號：</label>
    <input
      type="email"
      name="account"
      id="account"
      required
      pattern="\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b"
      #accountNgModel="ngModel"
      [ngModel]="account"
      (ngModelChange)="accountValueChange(accountNgModel.value, accountNgModel.errors)"
    />
    <span class="error-message">{{ accountErrorMessage }}</span>
  </p>
  <p>
    <label for="password">密碼：</label>
    <input
      type="password"
      name="password"
      id="password"
      required
      #passwordNgModel="ngModel"
      [minlength]="8"
      [maxlength]="16"
      [ngModel]="password"
      (ngModelChange)="passwordValueChange(passwordNgModel.value, passwordNgModel.errors)"
    />
    <span class="error-message">{{ passwordErrorMessage }}</span>
  </p>
  <p>
    <button type="submit" [disabled]="form.invalid">登入</button>
  </p>
</form>
```

> Typescript

```js
export class AppComponent {

  // 綁定在帳號欄位上
  account = '';

  // 綁定在密碼欄位上
  password = '';

  // 帳號欄位的錯誤訊息
  accountErrorMessage = '';

  // 密碼欄位的錯誤訊息
  passwordErrorMessage = '';

  /**
   * 綁定在帳號欄位上，當使用者改變登入帳號時，會觸發此函式，並取得對應的錯誤訊息
   *
   * @param {string} account
   * @param {ValidationErrors} errors
   */
  accountValueChange(account: string, errors: ValidationErrors): void {
    this.account = account;
    this.validationCheck(errors, 'account');
  }


  /**
   * 綁定在密碼欄位上，當使用者改變密碼時會觸發此函式
   *
   * @param {string} password
   * @param {ValidationErrors} errors
   */
  passwordValueChange(password: string, errors: ValidationErrors): void {
    this.password = password;
    this.validationCheck(errors, 'password');
  }

  // 綁定在表單上，當使用者按下登入按鈕時會觸發此函式
  login(): void {
    // do login...
  }

  /**
   * 透過欄位裡的 ValidationErrors 來設定該欄位的錯誤訊息
   *
   * @param {ValidationErrors} errors 欲驗證的欄位的錯誤 (by Angular)
   * @param {'account' | 'password'} fieldName 欄位名稱
   */
  private validationCheck(
    errors: ValidationErrors,
    fieldName: 'account' | 'password'
  ): void {
    let errorMessage: string;
    if (!errors) {
      errorMessage = '';
    } else if (errors.required) {
      errorMessage = '此欄位必填';
    } else if (errors.pattern) {
      errorMessage = '格式有誤，請重新輸入';
    } else if (errors.minlength) {
      errorMessage = '密碼長度最短不得低於8碼';
    }
    this.setErrorMessage(fieldName, errorMessage);
  }

  /**
   * 設定指定欄位的錯誤訊息
   *
   * @param {'account' | 'password'} fieldName 欲設定錯誤訊息的欄位名稱
   * @param {string} errorMessage 欲設定的錯誤訊息
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

對於 Reactive Forms，我其實比較好奇進階使用 ( `多個欄位之間會有複雜的驗證，抑或是動態的驗證，甚至連表單的欄位是動態` )，但這部分在原文章好像放在比較後面，那就先學會怎麼使用吧，如果有需要再自行到原文觀看；

Model-Driven Form 是將表單用程式的方式產生，主要 Directive 成員有最外層的 formGroup 與內層的 formControl ( formControlName, formGroupName, formArrayName )，很類似之前開發過 .Net 的 Webform 控制項或是 Razor 的表單驗證，在 Reactive Forms 需要透過這些 Directive 與 Template 的 Form Element 做資料綁定透過 formBuilder.group 將 AG 所提供的 Directive 與 Validators 與表單綁定，這跟之前專案自製過的驗證模組原理相通，但多了更多 AG 所提供的物件，相對的也比較複雜，感覺可以斟酌使用。

> Html

```html
<form [formGroup]="formGroup" (ngSubmit)="login()">
  <p>
    <label for="account">帳號：</label>
    <input
      type="email"
      id="account"
      [formControl]="accountControl"
    />
    <span class="error-message">{{ getErrorMessage(accountControl) }}</span>
  </p>
  <p>
    <label for="password">密碼：</label>
    <input
      type="password"
      id="password"
      [formControl]="passwordControl"
    />
    <span class="error-message">{{ getErrorMessage(passwordControl) }}</span>
  </p>
  <p>
    <button type="submit" [disabled]="formGroup.invalid">登入</button>
  </p>
</form>
```

> Typescript

```js
export class LoginComponent implements OnInit {

  // 綁定在表單上
  formGroup: FormGroup;

  /**
   * 用以取得帳號欄位的表單控制項
   */
  get accountControl(): FormControl {
    return this.formGroup.get('account') as FormControl;
  }

  /**
   * 用以取得密碼欄位的表單控制項
   */
  get passwordControl(): FormControl {
    return this.formGroup.get('password') as FormControl;
  }

  /**
   * 透過 DI 取得 FromBuilder 物件，用以建立表單
   */
  constructor(private formBuilder: FormBuilder) {}

  /**
   * 當 Component 初始化的時候初始化表單
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

  // 綁定在表單上，當使用者按下登入按鈕時會觸發此函式
  login(): void {
    // do login...
  }

  /**
   * 透過該欄位的表單控制項來取得該欄位的錯誤訊息
   *
   * @param {FormControl} formControl 欲取得錯誤訊息的欄位的表單控制項 (by Angular)
   */
  getErrorMessage(formControl: FormControl): string {
    let errorMessage: string;
    if (!formControl.errors || formControl.pristine) {
      errorMessage = '';
    } else if (formControl.errors.required) {
      errorMessage = '此欄位必填';
    } else if (formControl.errors.pattern) {
      errorMessage = '格式有誤，請重新輸入';
    } else if (formControl.errors.minlength) {
      errorMessage = '密碼長度最短不得低於8碼';
    } else if (formControl.errors.maxlength) {
      errorMessage = '密碼長度最長不得超過16碼';
    }
    return errorMessage;
  }

}
```

## 參考

* [網際網路協議套組 Wiki](https://zh.wikipedia.org/zh-tw/TCP/IP%E5%8D%8F%E8%AE%AE%E6%97%8F)
* [Angular Basics: How To Use HttpClient in Angular](https://www.telerik.com/blogs/angular-basics-how-to-use-httpclient)
* [JS XMLHttpRequest入门教程（非常详细）](http://c.biancheng.net/view/5995.html)
* [簡介 SSL、TLS 協定](https://ithelp.ithome.com.tw/articles/10219106)
* [[Security] 你該知道所有關於 SSH 的那些事](https://codecharms.me/posts/security-ssh)
* [使用 responseType](https://openhome.cc/Gossip/ECMAScript/ResponseType.html)
* [[stackoverflow]fetch-api-vs-xmlhttprequest](https://stackoverflow.com/questions/35549547/fetch-api-vs-xmlhttprequest)
* [普通socket, rpc, websocket,http(restful)等](https://blog.csdn.net/sun007700/article/details/99672063)
* [setting-xmlhttprequest-responsetype-forbidden-all-of-a-sudden](https://stackoverflow.com/questions/9855127/setting-xmlhttprequest-responsetype-forbidden-all-of-a-sudden)
* [淺談 HTTP Method：表單中的 GET 與 POST 有什麼差別？](https://blog.toright.com/posts/1203/%E6%B7%BA%E8%AB%87-http-method%EF%BC%9A%E8%A1%A8%E5%96%AE%E4%B8%AD%E7%9A%84-get-%E8%88%87-post-%E6%9C%89%E4%BB%80%E9%BA%BC%E5%B7%AE%E5%88%A5%EF%BC%9F.html)
* [「Form 格式是什麼？我只會傳 JSON。」](https://marionma-69293.medium.com/form-%E6%A0%BC%E5%BC%8F%E6%98%AF%E4%BB%80%E9%BA%BC-%E6%88%91%E5%8F%AA%E6%9C%83%E5%82%B3-json-%E6%B7%BA%E8%AB%87-urlsearchparams-and-formdata-9da9a65e66ca)
* [[JS] 使用 JavaScript 解析網址與處理網址中的參數（URL Parameters）](https://pjchender.blogspot.com/2018/08/js-javascript-url-parameters.html)
* [form 標籤與 FormData 的應用](https://blog.kalan.dev/2021-03-13-form-and-form-data)
* [拾捌。淺談幾種 POST request 的格式](https://ithelp.ithome.com.tw/articles/10293658)
* [[功能介紹-10] Reactive Forms (Model-Driven Forms)](https://ithelp.ithome.com.tw/articles/10195280)
* [Angular 深入淺出三十天：表單與測試](https://ithelp.ithome.com.tw/m/users/20090728/ironman/3881)
* [Angular 2 Forms 介紹：Model-Driven Forms](https://blog.crazyalu.com/2016/10/26/angular-model-driven/)