---
title: 在 Hexo 中整合 Angular
date: 2023-02-05 15:00
categories: Dev Tech
author: johch3n611u
---

> 要將 Angular 嵌入到 Hexo 中，你需要完成以下步驟：
> 
> 1. 編譯 Angular 應用程序為靜態資源，包括 HTML、CSS 和 JavaScript 文件。
> 2. 將這些靜態資源放置在 Hexo 的 source 目錄中。
> 3. 在 Hexo 的 Markdown 文件中使用嵌入式 HTML 代碼來載入 Angular 應用程序的靜態資源。
> 4. 確保 Angular 應用程序中的所有內容都是靜態的，並且不需要從伺服器端動態載入資料。

Hexo 是一個靜態網站生成器，能夠將 Markdown 文檔轉化為 HTML 網頁。而 Angular 則是一個流行的前端框架，用於構建 Web 應用程序。本文將教你如何將 Angular 應用程序整合到 Hexo 靜態網站中。

## 編譯 Angular 應用程序

首先，你需要將 Angular 應用程序編譯成靜態資源，包括 HTML、CSS 和 JavaScript 文件。為此，你可以使用 Angular CLI 提供的 ng build 命令。這個命令會將應用程序編譯成靜態資源，並將這些文件存放在指定的目錄中。

## 將靜態資源整合到 Hexo

編譯完成後，將這些靜態資源放置在 Hexo 的 source 目錄中。接著，你可以利用 Hexo 的模板系統來嵌入這些資源。具體而言，你可以在 Hexo 的 Markdown 文件中使用嵌入式 HTML 代碼來載入 Angular 應用程序的靜態資源，例如：

```js
<div ng-app="myApp">
  <my-app></my-app>
</div>

<script src="/path/to/angular.js"></script>
<script src="/path/to/app.js"></script>
```

在這個例子中，ng-app 屬性指定了 Angular 應用程序的根節點，`<my-app>` 標籤則是 Angular 應用程序中的一個組件。你需要將 angular.js 和 app.js 這兩個 JavaScript 文件放在指定的路徑中，以便它們可以被載入。

值得注意的是，由於 Hexo 是一個靜態網站生成器，它無法支持動態生成的內容和交互式頁面。因此，在使用 Angular 嵌入 Hexo 中時，你需要確保 Angular 應用程序的所有內容都是靜態的，並且不需要從伺服器端動態載入資料。如果你需要從伺服器端載入資料，你可以使用像 Angular Universal 這樣的解決方案，在伺服器端渲染 Angular 應用程序，然後將渲染好的 HTML 文件發送到客戶端 ( 使用 Angular Universal + Prerender )。

## iframe 嵌入

<iframe src="/assets/modules/test/components/test/index.html" title="W3Schools Free Online Web Tutorials"></iframe>

## Angular 嵌入

<div style="height:500px;border: 1px solid;">
	<iframe 
	class="responsiveIframe" 
	src="/assets/angular/ec/index.html" 
	width="100%" marginwidth="0" marginheight="0" frameborder="0"
	title="W3Schools Free Online Web Tutorials"></iframe>
</div>

## 參考文章

1. [使用 Angular Standalone Component 簡化開發](https://blog.crazyalu.com/2023/04/21/angular-standalone-component/)
2. [[Angular Universal] 使用 Prerender 建立自己的 Static Site Generator](https://fullstackladder.dev/blog/2021/10/16/static-site-generator-using-angular-universal-prerender/)
3. [iframe-automatically](https://stackoverflow.com/questions/9975810/make-iframe-automatically-adjust-height-according-to-the-contents-without-using)
4. [react vs angular build size](https://www.techuz.com/blog/angular-vs-react/)
5. [iterating-over-result-of-getelementsbyclassname-using-array-foreach](https://stackoverflow.com/questions/3871547/iterating-over-result-of-getelementsbyclassname-using-array-foreach)
6. [使用 JS 根據內容來自動調整 iframe 高度](https://blog.poychang.net/javascript-iframe/) 