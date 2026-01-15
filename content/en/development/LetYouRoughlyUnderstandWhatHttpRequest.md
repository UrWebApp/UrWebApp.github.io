---
title: Let you roughly understand Http Request
date: 2023-01-09
category: Development
author: johch3n611u
tags:
  - Internet
  - Response
  - Request
  - Angular
---

> This article will be edited from time to time. If there are any errors, please feel free to correct me, thanks!
>
> `TL;DR` Direct use of what you are good at or the latest, because they are all ways of exchanging data under the Http protocol, the difference will not be that big.

Because there is a demand for Angular Forms and HttpClient in the project, I used to implement directly using fetch or JQ without figuring out the differences, so I want to organize this area roughly. Let's get straight to it;

Internet Protocol is formulated by a working group under the Internet Society, mainly used to define the specifications for transmitting information between two systems. The following lists some that I am more interested in, mainly comparing data communication instances. For details, you can also refer directly to [Internet Protocol Suite Wiki](https://en.wikipedia.org/wiki/Internet_protocol_suite).

<details>
<summary>Application Layer: DNS, POP, FTP, HTTP, HTTPS, ONC/RPC, SSL, SSH, WebSocket</summary>

1. DNS (Domain Name System/Service/Server): It is the phone book and address book of the Internet. I think this is quite simple, but `the S at the end is super confusing for me. Simply put, there are N Servers whose main Service is to map Domain Name to IP`.
2. POP (Post Office Protocol): Supports using client to remotely manage emails on the server. After applying SSL, it is also called POP3S (POP - Version 3). The difference with IMAP (Internet Message Access Protocol) lies in whether emails can be accessed using different computers, `but practically I haven't touched this deeply, mostly solving it using packages`.
3. FTP (File Transfer Protocol): Used for file transfer between client and server on a computer network. Applying SSL makes it SFTP. Practically speaking in C#, like POP, there are usually FTPExtensions or mail packages that can be applied directly. `I only have an impression of setting up FTP on IIS for deployment`.
4. HTTP, HTTPS (HyperText Transfer Protocol Secure): HTTPS is actually HTTP applying SSL. Initially provided a method for publishing and receiving HTML pages. `Derived to also request URI (Uniform Resource Identifiers) including HTML files, code, videos, images, etc. Derivatives include URN (Uniform Resource Name) and URL (Uniform Resource Locator)`.
5. ONC/RPC (Open Network Computing Remote Procedure Call): A widely used remote procedure call system. First saw this term at .net conf in 2019, but as a newbie back then, I didn't understand it in detail as I didn't use it. Compared to this, RPC more often seen is gRPC, which is a high-performance remote procedure call framework not limited to language. gRPC, like Restful API commonly used in Web, handles requests and responses and exchanges data (divided into Unary, Server streaming, Client streaming, Bidirectional streaming), but gRPC has more features (actually like Restful combined with Websocket). The main data exchange can be changed from JSON to (Protocol Buffer), `because there is no demand, I won't delve into this. For differences, you can check this article` [RPC vs Restful](https://blog.csdn.net/sun007700/article/details/99672063).
6. SSL (Secure Sockets Layer): A security protocol that establishes an encrypted link between client and host. Now replaced by TLS (Transport Layer Security). `Mainly the way browser and server Handshake will be different, and use certificates issued by CA (Certificate Authority) for identity verification.` In development, like the previous ones, knowing the principle is enough, just use packages or architecture settings.
7. SSH (Secure Shell): Encrypted remote connection, mainly through `public/private key encryption/decryption`. Public key allows others to verify the correctness of your signature and encrypt things so only your private key can decrypt. Private key is used for signing and decrypting.
8. WebSocket: Can perform full-duplex communication on a single TCP (Transmission Control Protocol) connection. Browser and server only need to complete one handshake to establish a persistent connection and perform bidirectional data transmission. `Played with SignalR (Microsoft's WebSocket framework, providing server-side and client-side Libraries making development much easier) and Firebase RxJS. Also saw PHP architecture similar to WebSocket where Network shows crazy Request/Response, but really developing general web systems seems to have less demand for this`.

</details>

## AJAX & API

### AJAX (Asynchronous JavaScript and XML)

> Asynchronous = async

Previously `synchronous request`, frontend sends Synchronous Request via URL or Form to communicate with backend, must wait for backend's Synchronous Response to verify the next step action.
`Asynchronous request` is like the concept of taking a number ticket. After taking the ticket and sending Asynchronous Request, you can do other things and wait for the number to be called to execute data retrieval.

JavaScript and XML refer to a set of web development technologies that execute the above actions through JavaScript. The communication data format is XML (Extensible Markup Language), but now the data format is not limited to XML, but AJAX is still carried over.

### API (Application Programming Interface)

> Application `Interface: The contact surface between two different substances or states`.

So not limited to human-to-object e.g. McDonald's ordering kiosk, mobile phone, car dashboard etc...

Also includes machine-to-machine e.g. ordering kiosk to central control ordering system, mobile APP to APP server, car system to car audio etc...

So most of the Requests below are libraries APIs provided by browser giants according to RFC Http transmission protocol, allowing you to manipulate the browser to send Requests to backend servers, or higher-level libraries encapsulated based on it.

## Request Communication Examples

In AG (Angular), HttpClient is usually used to access data directly. As seen below, this is an easy-to-use component made into an observer design pattern, based on XMLHttpRequest API Http protocol, wrapped with another layer of RxJS observable API.

> What Is HttpClient? `HttpClient` is a built-in service class available in the @angular/common/http package. It has multiple signature and return types for each request. It uses the `RxJS` observable-based APIs, which means it returns the observable and what we need to subscribe it. This API was developed based on `XMLHttpRequest` interface exposed by browsers.

### XMLHttpRequest

> `Pros:`
>
> Update web page without reloading.
> Request/receive data from server after page has loaded.
> Send data to server in background.

> `Cons:`
>
> More cumbersome to use, need to set many values.
> Early IE browsers had their own implementation, so compatibility code was needed.

Remember when I first started programming, besides JQ, the first way I learned to communicate with backend was through XMLHttpRequest with Element form, fetch, JQ AJAX, Element form. For detailed xhr methods, refer to [MDN XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest).

```Javascript
// let promise = new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest ();
    // open (method, url, async, user, password)
    xhr.open ("GET", "server.txt", false); // Establish connection. async true allows specifying responseType
    // setRequestHeader (header, value)
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); // Set header
    xhr.onreadystatechange = () => { // Call a function when the state changes.
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            // Request finished. Do processing here.
        }   else if (xhr.status === 404) {
            // Do something when file not found
        }
    }
    // xhr.responseType = 'json'; // Response is JSON
    // send (body)
    xhr.send(null);  // Send request
    console.log(xhr.responseText);  // Receive data

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

> `Pros:`
>
> Simple cross-origin handling.
> Underlying API can easily handle formats compared to XHR, and can be easily used by other technologies e.g. Service Workers.
> Supports Promise API

> `Cons:`
>
> Error handling encapsulation is not good, need extra handling.
> Cookie needs extra setting, no default.
> Does not support timeout, reject timeout control.
> Cannot monitor Request progress like XHR.

Judging from the above, the biggest difference seems to be returning Promise and internally returning Response object. Compared to XMLHttpRequest application, it is more convenient, with many more data processing methods. For detailed methods and parameters, refer to [MDN Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)

> Promise object represents an asynchronous operation that is about to complete or fail, and its resulting value.

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
> Encapsulation of native XHR, handled compatibility, simplified usage.
> Supports JSONP, can easily handle partial cross-origin.

> `Cons:`
>
> If there are multiple requests with dependencies, easy to form callback hell.
> It is designed for MVC architecture, not suitable for current frontend MVVM.
> ajax is a method in jQuery. Introducing the whole jQuery just to use ajax is very heavy.

To be honest, JQ is mostly used in personal projects. Subsequently contacting frameworks whether Vue or AG (Angular), usually use fetch or Axios, and combined with framework's Render, the usage is actually similar to the above two. From official website [jquery.ajax](https://api.jquery.com/jquery.ajax/), we can know the base is XMLHttpRequest, just encapsulated to be easier to use, and can use JQ features to do some usage changes in chain.

```Js
$.ajax({
    beforeSend:(xhr)=>{xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")},
    url: 'server.txt',
    method: 'GET', // 1.9.0
    // type: 'GET', // prior to 1.9.0.
    dataType: 'json', // Expected data type from server
    processData: false, // Pre-processing, whether to convert data to query string
    contentType: false, // Data type sent to server
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
> Can be used in node.js
> Supports Promise API
> Intercept handling / Error handling / Timeout handling / Format handling
> Supports defending XSRF

> `Cons:`
>
> Can only be used in newer browsers.

Honestly haven't used this package many times, mostly used with Vue, but I mainly develop AG, so here only listing basic usage. Feels not much difference from JQ, mainly its lightweight, returns promise object like fetch, can be used in node.js not limited to browser, provides axios.create interface similar to Router managing API. For details please refer directly to [Axios Official Documentation](https://axios-http.com/docs/intro).

```Javascript
axios.get('server.txt')
.then(function (response) {
        console.log(typeof(response),response);
        console.log(arguments) // Array-like object corresponding to passed arguments
        // Arguments are values passed to function when calling it
        // Parameters are variables listed in function definition
})
.catch(function (error) {
        console.log(error);
})
.finally(function () {
        console.log('finally');
});
```

### Form

Talking about Form submission cannot separate from method = "POST/GET". Get is like postcard, Post is like letter. When using Get, Query String (Key/Value) is appended after Request Header Url, while Post appends file content in Request body, and grabs corresponding fields with name attribute in form tag to parameterize. This way seems similar to using URLSearchParams API to modify Url to achieve Query String way. POST places parameters into Body and also proceeds similar to above. Using form without setting [enctype ContentType defaults to application/x-www-form-urlencoded](https://www.w3schools.com/tags/att_form_enctype.asp), meaning spaces turn to +, special symbols turn to ASCII HEX value before sending (but I use Live Server defaulting to text/html; charset=UTF-8, maybe protocol changed?), this relates to ContentType: multipart/form-data discussed in next unit.

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

FormData API can create corresponding (key/string) collection of form data. Feature is it can send binary files (File, Blob), and can merge uploaded files, images, videos with multiple data (`General Content-Type usually can only send one type of data`), and send out at once using XMLHttpRequest.send(). When encoding type is set to multipart/form-data, it will be sent in the same format as form. Can also use its API to quickly do format conversion, encryption, validation, error handling, state transition, Accessibility etc. for data [MDN FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData).

> Following 3 ContentTypes should be most commonly used
>
> - multipart/form-data: Format supported by form, can wrap content of different formats together, can carry files, but seems key/string cannot have basic data types like JSON
> - application/json: Common file exchange format for API, plain text, does not support binary content, SAP usually uses JSON to exchange data with backend Restful
> - text/plain: Plain text content, rarely appears in practical application

> Extended reading [why-is-using-onclick-in-html-a-bad-practice](https://stackoverflow.com/questions/5871640/why-is-using-onclick-in-html-a-bad-practice) ( TL;DR Separation of concerns > Security )

```Js
// Dynamically add data to form
// var formData = new FormData();
// formData.append('username', Chris); // Add field
// formData.append('image', file); // File can also be put in via append

<form>
    <input type="text" name="fileName"/>
    <input type="file" name="file"/>
    <button type="submit" onClick="customSubmit(event)"></button>
</form>

function customSubmit (event){ // event is optional
    event.preventDefault(); // Cancel native submit event
    // Get form data directly from form element
    let form = document.querySelector('form');
    let formData = new FormData(form);
    for(let [key, value] of formData){
         console.log(data);
    }
    FormData.has('fieldName') // Verify if field exists in form
    ...
    // Then xhr get request
}

```

## Angular

Finally to the main point, this article mainly organizes usage differences. Will not mention basic parts of AG, let's go!

### Angular HttpClient

- Extended reading RxJS
- [Functional Programming](https://fullstackladder.dev/blog/2020/09/25/mastering-rxjs-10-functional-programming-basic-patterns/)
- [Reactive Programming](https://codewithstyle.info/functional-javascript-part-8-functional-reactive-programming-rxjs/)

HttpClient doesn't need much explanation as mentioned [above](#communication-examples). Main precautions can refer to Will's [Various TypeScript Pitfalls and Tricks when using HttpClient in Angular](https://blog.miniasp.com/post/2019/01/20/Angular-HttpClient-Pitfall-and-Tricks). Should mainly be familiar with application of RxJS. Previous projects didn't use advanced application much and rarely implemented reactive programming. In recent projects saw similar usage like [combineLatest](https://rxjs-cn.github.io/learn-rxjs-operators/operators/combination/combinelatest.html), combining two Observables for application, but `OS personally feels after developing backend for long time that frontend shouldn't complicate data combination so much, feels like backend should just handle it...`.

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

Found detailed master series articles on detailed usage [Angular In-Depth 30 Days: Forms and Testing](https://ithelp.ithome.com.tw/m/users/20090728/ironman/3881) and there are frontend testing examples, directly found next research direction!

Template-Driven is simpler compared to Reactive Forms. Through Html native validation or AG Validator Directive can quickly implement validation. Previous projects excluded both and made custom validation modules, so didn't use these two much. But encountered requirements like complex validation between multiple fields, or dynamic validation, even form fields are dynamic. Indeed quite troublesome, seems can be handled via Reactive Forms.

Here rarely used part is `Template Syntax` feels quite like native js getElement, but in AG what is obtained will be objects wrapped by NgModel, NgForm or HTMLFormElement. Used to operate DOM with ViewChild, here directly use value, error parameters provided by NgModel, and grab NgForm invalid parameter to control fields. The rest is basic AG operation, indeed faster and simpler compared to previous project's self-made validation.

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

  // Bind to account field
  account = '';

  // Bind to password field
  password = '';

  // Error message for account field
  accountErrorMessage = '';

  // Error message for password field
  passwordErrorMessage = '';

  /**
   * Bind to account field, triggers this function when user changes login account, and gets corresponding error message
   *
   * @param {string} account
   * @param {ValidationErrors} errors
   */
  accountValueChange(account: string, errors: ValidationErrors): void {
    this.account = account;
    this.validationCheck(errors, 'account');
  }


  /**
   * Bind to password field, triggers this function when user changes password
   *
   * @param {string} password
   * @param {ValidationErrors} errors
   */
  passwordValueChange(password: string, errors: ValidationErrors): void {
    this.password = password;
    this.validationCheck(errors, 'password');
  }

  // Bind to form, triggers this function when user presses login button
  login(): void {
    // do login...
  }

  /**
   * Set error message for the field via ValidationErrors in the field
   *
   * @param {ValidationErrors} errors Error of the field to be validated (by Angular)
   * @param {'account' | 'password'} fieldName Field name
   */
  private validationCheck(
    errors: ValidationErrors,
    fieldName: 'account' | 'password'
  ): void {
    let errorMessage: string;
    if (!errors) {
      errorMessage = '';
    } else if (errors.required) {
      errorMessage = 'This field is required';
    } else if (errors.pattern) {
      errorMessage = 'Format incorrect, please re-enter';
    } else if (errors.minlength) {
      errorMessage = 'Password length must not be less than 8 characters';
    }
    this.setErrorMessage(fieldName, errorMessage);
  }

  /**
   * Set error message for specified field
   *
   * @param {'account' | 'password'} fieldName Field name to set error message for
   * @param {string} errorMessage Error message to set
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

For Reactive Forms, I am actually more curious about advanced usage (`Complex validation between multiple fields, or dynamic validation, even form fields are dynamic`). But this part seems to be placed later in the original article, so learn how to use it first, if needed can view original article yourself;

Model-Driven Form generates form programmatically. Main Directive members are outer formGroup and inner formControl ( formControlName, formGroupName, formArrayName ). Very similar to developing .Net Webform controls or Razor form validation previously. In Reactive Forms need to bind data with Template Form Element via these Directives via formBuilder.group to bind Directives and Validators provided by AG with form. This shares same principle with self-made validation module in previous project, but with more objects provided by AG, relatively more complex, feel can consider using.

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

  // Bind to form
  formGroup: FormGroup;

  /**
   * Used to get form control of account field
   */
  get accountControl(): FormControl {
    return this.formGroup.get('account') as FormControl;
  }

  /**
   * Used to get form control of password field
   */
  get passwordControl(): FormControl {
    return this.formGroup.get('password') as FormControl;
  }

  /**
   * Get FormBuilder object via DI to build form
   */
  constructor(private formBuilder: FormBuilder) {}

  /**
   * Initialize form when Component initializes
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

  // Bind to form, triggers this function when user presses login button
  login(): void {
    // do login...
  }

  /**
   * Get error message of the field via form control of the field
   *
   * @param {FormControl} formControl Form control of the field to get error message for (by Angular)
   */
  getErrorMessage(formControl: FormControl): string {
    let errorMessage: string;
    if (!formControl.errors || formControl.pristine) {
      errorMessage = '';
    } else if (formControl.errors.required) {
      errorMessage = 'This field is required';
    } else if (formControl.errors.pattern) {
      errorMessage = 'Format incorrect, please re-enter';
    } else if (formControl.errors.minlength) {
      errorMessage = 'Password length must not be less than 8 characters';
    } else if (formControl.errors.maxlength) {
      errorMessage = 'Password length must not exceed 16 characters';
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
