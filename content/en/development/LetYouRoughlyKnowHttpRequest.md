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
authorsWords: Instead of forgetting every time, it's better to write it down for future reference
---

> This article will be edited from time to time. If there are any errors, please feel free to correct me. Thank you!
>
> `TL;DR` Directly use what you are good at or the latest ones, because they are all ways of exchanging data under the Http protocol, and the differences are not that big.

Because there are needs for Angular Forms and HttpClient in the project, in the past, whether using fetch or JQ, I just implemented it directly without figuring out the differences, so I want to organize this part. Let's get started;

The Internet Protocol is developed by a working group under the Internet Society. It is mainly used to define specifications for disseminating information between two systems. The following lists some that I am more interested in. I will mainly compare them with examples of data communication. For details, you can refer directly to [Internet Protocol Suite Wiki](https://en.wikipedia.org/wiki/Internet_protocol_suite).

<details>
<summary>Application Layer: DNS, POP, FTP, HTTP, HTTPS, ONC/RPC, SSL, SSH, WebSocket</summary>

1. DNS (Domain Name System/Service/Server): It is the phone book and address book of the Internet. I think this is quite simple, but `the S at the end is super confusing for me. Simply put, there are N Servers, and the Service they mainly do is mapping Domain Name to IP`.
2. POP (Post Office Protocol): Supports using a client to remotely manage emails on the server. After applying SSL, it is also called POP3S (POP - Version 3). The difference from IMAP (Internet Message Access Protocol) lies in whether emails can be accessed from different computers, `but practically I haven't touched this so deeply, mostly solved using packages`.
3. FTP (File Transfer Protocol): Used for file transfer between clients and servers on computer networks. With SSL, it becomes SFTP. Practically, in C#, like POP, there are usually FTPExtensions or mail packages that can be applied directly. `I only have an impression of setting up FTP on IIS for deployment`.
4. HTTP, HTTPS (HyperText Transfer Protocol Secure): HTTPS is actually HTTP with SSL applied. Initially provided a method to publish and receive HTML pages, `derived to also request URI (Uniform Resource Identifiers) including HTML files, code, videos, images, etc. Derived as URN (Uniform Resource Name) and URL (Uniform Resource Locator)`.
5. ONC/RPC (Open Network Computing Remote Procedure Call): A widely used remote procedure call system. I first saw this term at .net conf in 2019, but as a newbie back then, I didn't verify it in detail as I didn't need it. Compared to this RPC, gRPC is seen more often, which is a high-performance remote procedure call framework not limited to languages. gRPC is like Restful API commonly used on the Web, both handling requests and responses, and exchanging data (divided into Unary, Server streaming, Client streaming, Bidirectional streaming), but gRPC has other functions and features (actually like Restful combined with Websocket). The main data exchange can be changed from JSON to (Protocol Buffer), `because there is no demand, I won't delve into this. For differences, you can check this article` [RPC vs Restful](https://blog.csdn.net/sun007700/article/details/99672063).
6. SSL (Secure Sockets Layer): A security protocol that establishes an encrypted link between the client and the host. Now replaced by TLS (Transport Layer Security). `Mainly the way of Handshake between browser and server is different, and uses certificates issued by CA (Certificate Authority) for identity verification.` in development, just like the above, you only need to know the principle and use packages or framework settings.
7. SSH (Secure Shell): Encrypted remote connection, mainly through `public and private key encryption and decryption`. The public key is used for others to verify the correctness of your signature and encrypt things so that only your private key can decrypt them. The private key is used to create signatures and decrypt.
8. WebSocket: Can perform full-duplex communication on a single TCP (Transmission Control Protocol) transport layer protocol connection. The browser and server only need to complete one handshake to establish a persistent connection and perform two-way data transmission. `I played with SignalR (Microsoft's WebSocket framework, providing Server-side and Client-side Libraries to make development much easier), and Firebase RxJS. I have also seen PHP architectures similar to WebSocket showing crazy Request/Response in Network, but it seems there is less demand for this in developing general website systems`.

</details>

## AJAX & API

### AJAX (Asynchronous JavaScript and XML)

> Asynchronous

In the past `Synchronous Request`, the frontend sends a Synchronous Request to communicate with the backend via URL or Form, and must receive the backend's Synchronous Response to continue to the next step.
`Asynchronous Request` is similar to the concept of taking a number. After taking a number and sending an Asynchronous Request, you can do other things and wait for the number to be called to execute data retrieval.

JavaScript and XML refer to a web development technology that executes the above actions through JavaScript. The communication data format is XML (Extensible Markup Language), but now the data format is not limited to XML, but the name AJAX has continued.

### API (Application Programming Interface)

> Application `Interface: The contact surface between two different substances or states`.

So it is not limited to people to things e.g. McDonald's ordering kiosk, mobile phone, car dashboard etc...

Also includes machine to machine e.g. ordering kiosk to central control ordering system, mobile APP to APP server, car system to car audio etc...

So the following Requests are mostly library APIs provided by browser giants according to the RFC Http transport protocol, allowing you to control the browser to send Requests to the backend server, or higher-level libraries encapsulated based on it.

## Request Communication Examples

In Angular, HttpClient is usually used to access data content directly. As seen below, this adheres to the XMLHttpRequest API Http protocol, wrapped in another layer of RxJS observable API, making it an easy-to-use component in the observer design pattern.

> What Is HttpClient? `HttpClient` is a built-in service class available in the @angular/common/http package. It has multiple signature and return types for each request. It uses the `RxJS` observable-based APIs, which means it returns the observable and what we need to subscribe it. This API was developed based on `XMLHttpRequest` interface exposed by browsers.

### XMLHttpRequest

> `Pros:`
>
> Update web pages without reloading the page.
> Request/receive data from the server after the page has loaded.
> Send data to the server in the background.

> `Cons:`
>
> Cumbersome to use, need to set many values.
> Early IE browsers had their own implementations, requiring compatibility code.

I remember when I first started programming, besides JQ, the first way I learned to communicate with the backend was through XMLHttpRequest with Element form, fetch, JQ AJAX, Element form. For detailed xhr methods, please refer to [MDN XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest).

```Javascript
// let promise = new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest ();
    // open (method, url, async, user, password)
    xhr.open ("GET", "server.txt", false); // Establish connection, async true allows specifying responseType
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
> Formatting is easier to handle compared to XHR underlying API, and can be easily used by other technologies e.g. Service Workers.
> Supports Promise API

> `Cons:`
>
> Error reporting part is not encapsulated well, need to handle additionally.
> Cookie requires additional settings and is not default.
> Does not support timeout/reject timeout control.
> Cannot monitor Request progress like XHR.

Comparing with the above, the biggest difference seems to be returning a Promise and internally returning a Response object. Compared to XMLHttpRequest application, it is more convenient, adding many methods for processing data. For detailed methods and parameters provided, please refer to [MDN Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)

> The Promise object represents the eventual completion (or failure) of an asynchronous operation and its resulting value.

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
> Added support for JSONP, can simply handle some cross-origin.

> `Cons:`
>
> If there are multiple requests and dependencies, it is easy to form callback hell.
> It is based on MVC architecture itself, not conforming to modern frontend MVVM.
> ajax is a method in jQuery. Introducing the entire jQuery just to use ajax is bulky.

Honestly, JQ is more used in personal projects. Subsequent exposure to frameworks whether Vue or Angular usually uses fetch or Axios, and combined with framework Render, usage is actually similar to the above two methods. From the official website [jquery.ajax](https://api.jquery.com/jquery.ajax/), we can also know that the base is XMLHttpRequest, just encapsulated to be easier to use, and can use JQ features to do some usage variations in a chain.

```Js
$.ajax({
    beforeSend:(xhr)=>{xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")},
    url: 'server.txt',
    method: 'GET', // 1.9.0
    // type: 'GET', // prior to 1.9.0.
    dataType: 'json', // Data type expected from server
    processData: false, // Preprocessing, whether to convert data to query string
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
> Supports XSRF protection

> `Cons:`
>
> Can only be used in newer browsers.

To be honest, I haven't used this package many times, mostly used with Vue. Since I mainly develop Angular, I only list basic usage here. It feels not much different from JQ. Mainly it is lightweight, returns promise object like fetch, not limited to browser and can also be used in node.js, provides axios.create interface similar to Router managing API. Detailed please refer to [Axios Official Documentation](https://axios-http.com/docs/intro).

```Javascript
axios.get('server.txt')
.then(function (response) {
        console.log(typeof(response),response);
        console.log(arguments) // Array-like object corresponding to the arguments passed to the function
        // Arguments are values passed to the function when we call it
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

Speaking of passing through Form, it cannot be separated from method = "POST/GET". Get is to postcard, Post is to letter. When using Get, use Query String (Key/Value) added after Request Header Url. Post adds file content in Request body, and grabs the corresponding fields with name in the form tag to parametrize. This method seems to be similar to modifying Url through URLSearchParams API to achieve Query String. POST places parameters into Body and also proceeds in a similar way as above. Using form without setting [enctype ContentType defaults to application/x-www-form-urlencoded](https://www.w3schools.com/tags/att_form_enctype.asp), which means converting spaces to + and special symbols to ASCII HEX values before sending (But I use Live Server defaulting to text/html; charset=UTF-8, maybe protocol changed?). This relates to ContentType: multipart/form-data discussed in the next unit.

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
// Then get request via xhr
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

// In Packet // POST / HTTP/1.1 // Host: xxx.toright.com // User-Agent: Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-TW; rv:1.9.2.13) Gecko/20101203 Firefox/3.6.13 GTB7.1 ( .NET CLR 3.5.30729) // Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8 // Accept-Language: zh-tw,en-us;q=0.7,en;q=0.3 // Accept-Encoding: gzip,deflate // Accept-Charset: UTF-8,* // Keep-Alive: 115 // Connection: keep-alive // Content-Type: application/x-www-form-urlencoded // code>Content-Length: 9 // username=&password=&id=010101
```

### FormData

FormData API can create a corresponding (key/string) collection for form data. Its feature is that it can transmit binary files (File, Blob), and can merge uploaded files, images, videos with multiple data (`General Content-Type usually can only transmit one form of data`), and send out at once using XMLHttpRequest.send(). When encoding type is set to multipart/form-data, it will be sent in the same format as the form. Its API can also be used to quickly process data such as format conversion, encryption, verification, error handling, state transition, Accessibility etc. [MDN FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData).

> The following three ContentTypes should be the most commonly used
>
> - multipart/form-data: Format supported by forms, can package contents of different formats together, can carry files, but it seems key/string cannot have basic data types like JSON
> - application/json: Commonly used file exchange format for API, plain text, does not support binary content, SAP usually uses JSON to exchange data with backend Restful
> - text/plain: Plain text content, not often seen in practical applications

> Extended Reading [why-is-using-onclick-in-html-a-bad-practice](https://stackoverflow.com/questions/5871640/why-is-using-onclick-in-html-a-bad-practice) ( TL;DR Separation of concerns > Security )

```Js
// Dynamically add form data
// var formData = new FormData();
// formData.append('username', Chris); // Add field
// formData.append('image', file); // File can also be put in via append

<form>
    <input type="text" name="fileName"/>
    <input type="file" name="file"/>
    <button type="submit" onClick="customSubmit(event)"></button>
</form>

function customSubmit (event){ // event is optional
    event.preventDefault(); // Cancel submit native event
    // Get form data directly based on form element
    let form = document.querySelector('form');
    let formData = new FormData(form);
    for(let [key, value] of formData){
         console.log(data);
    }
    FormData.has('fieldName') // Verify if the field exists in the form
    ...
    // Then get request via xhr
}

```

## Angular

Finally to the main point. This article primarily organizes usage differences, ignoring basic parts of Angular. Let's go!

### Angular HttpClient

- Extended Reading RxJS
- [Functional Programming](https://fullstackladder.dev/blog/2020/09/25/mastering-rxjs-10-functional-programming-basic-patterns/)
- [Reactive Programming](https://codewithstyle.info/functional-javascript-part-8-functional-reactive-programming-rxjs/)

HttpClient shouldn't need much explanation as mentioned [above](#request-communication-examples). Main precautions can refer to Will Huang's [Various TypeScript Pitfalls and Tricks when using HttpClient in Angular](https://blog.miniasp.com/post/2019/01/20/Angular-HttpClient-Pitfall-and-Tricks). Mainly one should be familiar with RxJS applications. In previous projects without advanced application, reactive programming was rarely implemented. In recent projects, I saw usage like [combineLatest](https://rxjs.dev/api/index/function/combineLatest), combining two Observables for application, but `Personally, having developed backend for a longer time, I feel frontend shouldn't make data combination so complex, backend should handle it...`.

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

For this part, I found a detailed series of articles by a master on the internet [Angular In-Depth 30 Days: Forms and Testing](https://ithelp.ithome.com.tw/m/users/20090728/ironman/3881) and there are also frontend testing examples, found the next direction for research!

Template-Driven is simpler compared to Reactive Forms. Validation can be quickly implemented through Html native validation or Angular Validator Directive. Previous projects excluded both for a custom self-made validation module, so didn't use these much. But like complex validation between multiple fields, or dynamic validation, or even dynamic form fields, I have encountered such needs, indeed quite troublesome, seems can be handled via Reactive Forms.

What's rarely used here is `Template Syntax`, feels quite like native js getElement, but in Angular what you get would be NgModel, NgForm or HTMLFormElement wrapped objects. Previously used with ViewChild to manipulate DOM, here directly use value, error parameters provided by NgModel, and grab NgForm invalid parameter to control fields. The rest is basic Angular operations. Compared to previous project's self-made validation, it is indeed fast and simple.

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
   * Bind to account field, triggered when user changes login account, and gets corresponding error message
   *
   * @param {string} account
   * @param {ValidationErrors} errors
   */
  accountValueChange(account: string, errors: ValidationErrors): void {
    this.account = account;
    this.validationCheck(errors, 'account');
  }


  /**
   * Bind to password field, triggered when user changes password
   *
   * @param {string} password
   * @param {ValidationErrors} errors
   */
  passwordValueChange(password: string, errors: ValidationErrors): void {
    this.password = password;
    this.validationCheck(errors, 'password');
  }

  // Bind to form, triggered when user presses login button
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
      errorMessage = 'Format is incorrect, please re-enter';
    } else if (errors.minlength) {
      errorMessage = 'Password length must not be less than 8 characters';
    }
    this.setErrorMessage(fieldName, errorMessage);
  }

  /**
   * Set error message for specified field
   *
   * @param {'account' | 'password'} fieldName Name of the field to set error message
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

For Reactive Forms, I am actually more curious about advanced usage (`Complex validation between multiple fields, or dynamic validation, or even dynamic form fields`), but this part seems to be placed later in the original article, so let's learn how to use it first. If needed, view the original text.

Model-Driven Form generates forms programmatically. Main Directive members are outer formGroup and inner formControl (formControlName, formGroupName, formArrayName). Quite similar to developing .Net Webform controls or Razor form validation previously. In Reactive Forms, data binding needs to be done via these Directives and Template Form Elements, binding Angular provided Directives and Validators with the form via formBuilder.group. This is similar in principle to the validation module self-made in previous projects, but with more objects provided by Angular, relatively more complex, feel free to use at your discretion.

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
   * Used to get form control for account field
   */
  get accountControl(): FormControl {
    return this.formGroup.get('account') as FormControl;
  }

  /**
   * Used to get form control for password field
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

  // Bind to form, triggered when user presses login button
  login(): void {
    // do login...
  }

  /**
   * Get error message for the field via the field's form control
   *
   * @param {FormControl} formControl Form control of the field to get error message (by Angular)
   */
  getErrorMessage(formControl: FormControl): string {
    let errorMessage: string;
    if (!formControl.errors || formControl.pristine) {
      errorMessage = '';
    } else if (formControl.errors.required) {
      errorMessage = 'This field is required';
    } else if (formControl.errors.pattern) {
      errorMessage = 'Format is incorrect, please re-enter';
    } else if (formControl.errors.minlength) {
      errorMessage = 'Password length must not be less than 8 characters';
    } else if (formControl.errors.maxlength) {
      errorMessage = 'Password length must not exceed 16 characters';
    }
    return errorMessage;
  }

}
```

## Reference

- [Internet Protocol Suite Wiki](https://en.wikipedia.org/wiki/Internet_protocol_suite)
- [Angular Basics: How To Use HttpClient in Angular](https://www.telerik.com/blogs/angular-basics-how-to-use-httpclient)
- [JS XMLHttpRequest Tutorial (Very Detailed)](http://c.biancheng.net/view/5995.html)
- [Introduction to SSL, TLS Protocols](https://ithelp.ithome.com.tw/articles/10219106)
- [[Security] Things you should know about SSH](https://codecharms.me/posts/security-ssh)
- [Using responseType](https://openhome.cc/Gossip/ECMAScript/ResponseType.html)
- [[stackoverflow]fetch-api-vs-xmlhttprequest](https://stackoverflow.com/questions/35549547/fetch-api-vs-xmlhttprequest)
- [Ordinary socket, rpc, websocket, http(restful) etc.](https://blog.csdn.net/sun007700/article/details/99672063)
- [setting-xmlhttprequest-responsetype-forbidden-all-of-a-sudden](https://stackoverflow.com/questions/9855127/setting-xmlhttprequest-responsetype-forbidden-all-of-a-sudden)
- [Discussion on HTTP Method: What is the difference between GET and POST in forms?](https://blog.toright.com/posts/1203/%E6%B7%BA%E8%AB%87-http-method%EF%BC%9A%E8%A1%A8%E5%96%AE%E4%B8%AD%E7%9A%84-get-%E8%88%87-post-%E6%9C%89%E4%BB%80%E9%BA%BC%E5%B7%AE%E5%88%A5%EF%BC%9F.html)
- ["What is Form format? I only know sending JSON."](https://marionma-69293.medium.com/form-%E6%A0%BC%E5%BC%8F%E6%98%AF%E4%BB%80%E9%BA%BC-%E6%88%91%E5%8F%AA%E6%9C%83%E5%82%B3-json-%E6%B7%BA%E8%AB%87-urlsearchparams-and-formdata-9da9a65e66ca)
- [[JS] Parse URL and handle URL Parameters using JavaScript](https://pjchender.blogspot.com/2018/08/js-javascript-url-parameters.html)
- [Application of form tag and FormData](https://blog.kalan.dev/2021-03-13-form-and-form-data)
- [18. Discussion on several formats of POST request](https://ithelp.ithome.com.tw/articles/10293658)
- [[Feature Introduction-10] Reactive Forms (Model-Driven Forms)](https://ithelp.ithome.com.tw/articles/10195280)
- [Angular In-Depth 30 Days: Forms and Testing](https://ithelp.ithome.com.tw/m/users/20090728/ironman/3881)
- [Angular 2 Forms Introduction: Model-Driven Forms](https://blog.crazyalu.com/2016/10/26/angular-model-driven/)
