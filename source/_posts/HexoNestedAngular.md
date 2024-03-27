---
title: 在 Hexo 中整合 Angular
date: 2023-02-05 15:00
categories: Dev Tech
author: johch3n611u
authorsWords: 實際上也是要等元件庫專案與此網站結合看看才知道...
---

> 要將 Angular 嵌入到 Hexo 中，需要完成以下步驟：
> 
> 1. 編譯 Angular 應用程序為靜態資源，包括 HTML、CSS 和 JavaScript 文件。
> 2. 將這些靜態資源放置在 Hexo 的 source 目錄中。
> 3. 在 Hexo 的 Markdown 文件中使用嵌入式 HTML 代碼來載入 Angular 應用程序的靜態資源。
> 4. 或透過 iframe 載入 Angular 程序頁面

## 將靜態資源整合到 Hexo

首先你需要將 Angular 應用程序編譯成靜態資源，HTML、CSS、JavaScript，由於 Hexo 是一個靜態網站生成器，它無法支持動態生成的內容和交互式頁面。

在使用 Angular 嵌入 Hexo 中時，需要確保 Angular 應用程序的所有內容都是靜態的，不需要從伺服器端動態載入資料。

( 但也可以接收其他後端 API 或 SaaS 如 Firebase 所傳遞之資料 )

## Angular 嵌入

編譯完成後，將這些靜態資源放置在 Hexo 的 source 目錄中，並利用 Hexo 的模板系統來嵌入這些資源。

可以在 Hexo 的 Markdown 文件中使用嵌入式 HTML 代碼來載入 Angular 應用程序的靜態資源，例如：

```js
<html>
	<head>
		<script src="/path/to/angular.js"></script>
		<script src="/path/to/app.js"></script>
	</head>

	// POST Content

	<div ng-app="myApp">
	<my-app></my-app>
	</div>

	// POST Content
</html>
```

ng-app 屬性指定了 Angular 程序的根節點，`<my-app>` 將 angular.js 和 app.js 這兩個 JavaScript 文件放在指定的路徑中載入。

如果需要從伺服器端載入一些預設的資料渲染，使用像 Angular Universal 這樣的方案是不夠的 AGU 只能在能夠在能跑 node.js 的環境，執行 Express Server 在伺服器端產生內容並發送給客戶端，要做到能夠發布在 Github Page 必須，把 Angular 程序做成類似 Hexo 的 Static Site Generator，在本地端配合 Prerender 網頁預渲染（Server-side Rendering，SSR）

## Angular iframe

1. iframe 的 source 可以掌控 css 較不受限站台的 css 影響
2. 但對於引用 source 這側較難以掌握自適應這個 Angular 程序

<div style="height:500px;border: 1px solid;">
	<iframe 
	class="responsiveIframe" 
	src="/assets/angular/ec/index.html" 
	width="100%" marginwidth="0" marginheight="0" frameborder="0"
	title="W3Schools Free Online Web Tutorials"></iframe>
</div>

## 同場加映 Static Site Generator

`Hexo 是一個快速、簡單且強大的靜態網站生成器。它使用 Node.js 構建，支持 Markdown 語法和 EJS 模板引擎生成靜態網站。`

講白話的來說就是依照這些模板語言 Generator 出 HTML、CSS、JavaScript，就能在 Github Page 靜態網站托管之類的服務上使用，

而像是 Github Page 也能支援像是 Jekyll、Hugo、Hexo 直接將原始碼 PUSH 後 CICD Generator Static Site，

但這些靜態網站托管就不能 Run Node 或是一般的後端程式 .Net Core etc...

### 其他好用的 Generator

以前系統商公司來說，時間就是金錢，專案如果可以快速完成或啟動就可以趕快繼續下一個專案，所以通常會有很多利用模板產生程序框架的程序，例如說微軟官方就有提供 DB First 可以直接依照資料庫產生一個簡易的基礎手腳架。

還有像是一些 PostMan、Swagger 提供的 `Code Snippet Generator` 都可以快速增加開發體驗與速度。

![postman-code-snippet](/assets/img/hexo/hexo/postman-code-snippet.png)

![swagger-editor-generate](/assets/img/hexo/hexo/swagger-editor-generate.png)

## 參考文章

1. [使用 Angular Standalone Component 簡化開發](https://blog.crazyalu.com/2023/04/21/angular-standalone-component/)
2. [[Angular Universal] 使用 Prerender 建立自己的 Static Site Generator](https://fullstackladder.dev/blog/2021/10/16/static-site-generator-using-angular-universal-prerender/)
3. [iframe-automatically](https://stackoverflow.com/questions/9975810/make-iframe-automatically-adjust-height-according-to-the-contents-without-using)
4. [react vs angular build size](https://www.techuz.com/blog/angular-vs-react/)
5. [iterating-over-result-of-getelementsbyclassname-using-array-foreach](https://stackoverflow.com/questions/3871547/iterating-over-result-of-getelementsbyclassname-using-array-foreach)
6. [使用 JS 根據內容來自動調整 iframe 高度](https://blog.poychang.net/javascript-iframe/) 