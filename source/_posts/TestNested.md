---
title: Hexo 嵌套 React 或 Angular
date: 2023-02-05 15:00
categories: Dev Tech
author: johch3n611u
---

Hexo 是一個靜態網站生成器，它通過 Markdown 文檔生成 HTML 網頁。Angular 則是一個用於構建 Web 應用程序的前端框架。

如果你想在 Hexo 中使用 Angular，你需要將 Angular 應用程序編譯為靜態資源，然後將這些資源與 Hexo 生成的 HTML 文件一起部署到 Web 伺服器上。

編譯 Angular 應用程序為靜態資源的方法有很多種，其中一種方法是使用 Angular CLI 提供的 ng build 命令。這個命令會將 Angular 應用程序編譯為靜態資源，包括 HTML、CSS 和 JavaScript 文件，並將這些文件放置在指定的目錄中。

一旦你編譯好了 Angular 應用程序，你可以將這些靜態資源放置在 Hexo 的 source 目錄中，然後使用 Hexo 的模板系統來嵌入這些資源。具體而言，你可以在 Hexo 的 Markdown 文件中使用嵌入式 HTML 代碼來載入 Angular 應用程序的靜態資源，例如：

```html
<div ng-app="myApp">
  <my-app></my-app>
</div>

<script src="/path/to/angular.js"></script>
<script src="/path/to/app.js"></script>
```

在這個例子中，`ng-app` 屬性指定了 Angular 應用程序的根節點，`<my-app>` 標籤則是 Angular 應用程序中的一個組件。你需要將 angular.js 和 app.js 這兩個 JavaScript 文件放在指定的路徑中，以便它們可以被載入。

需要注意的是，由於 Hexo 是一個靜態網站生成器，它無法支持動態生成的內容和交互式頁面。因此，在使用 Angular 嵌入 Hexo 中時，你需要確保 Angular 應用程序的所有內容都是靜態的，並且不需要從伺服器端動態載入資料。如果你需要從伺服器端載入資料，你可以使用像 Angular Universal 這樣的解決方案，在伺服器端渲染 Angular 應用程序，然後將渲染好的 HTML 文件發送到客戶端。

總之，要將 Angular 嵌入到 Hexo 中，你需要完成以下步驟：

1. 編譯 Angular 應用程序為靜態資源，包括 HTML、CSS 和 JavaScript 文件。
2. 將這些靜態資源放置在 Hexo 的 source 目錄中。
3. 在 Hexo 的 Markdown 文件中使用嵌入式 HTML 代碼來載入 Angular 應用程序的靜態資源。
4. 確保 Angular 應用程序中的所有內容都是靜態的，並且不需要從伺服器端動態載入資料。

[使用 Angular Standalone Component 簡化開發](https://blog.crazyalu.com/2023/04/21/angular-standalone-component/)

[[Angular Universal] 使用 Prerender 建立自己的 Static Site Generator](https://fullstackladder.dev/blog/2021/10/16/static-site-generator-using-angular-universal-prerender/)

[iframe-automatically](https://stackoverflow.com/questions/9975810/make-iframe-automatically-adjust-height-according-to-the-contents-without-using)

[react vs angular build size](https://www.techuz.com/blog/angular-vs-react/)

---

## HTML 嵌入

<div class="card">
	<div class="card__text">
		<p class="card__heading">Web Design and Applications</h3>
		<p>The standards for building and Rendering Web pages, including HTML, CSS, SVG, Ajax, and other technologies for Web Applications (“WebApps”). Includes information on how to make pages accessible (WCAG), to internationalize them, and make them work on mobile devices.</p>
		<a href="#"><span class="visuallyhidden">Web Design and Applications</span> Learn more</a>
	</div>
	<svg class="icon icon--larger" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true" viewBox="0 0 512 512" width="1em" height="1em"><defs/><path d="M204.3 5C104.9 24.4 24.8 104.3 5.2 203.4c-37 187 131.7 326.4 258.8 306.7 41.2-6.4 61.4-54.6 42.5-91.7-23.1-45.4 9.9-98.4 60.9-98.4h79.7c35.8 0 64.8-29.6 64.9-65.3C511.5 97.1 368.1-26.9 204.3 5zM96 320c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm32-128c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128-64c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128 64c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"/></svg>
</div>

## iframe 嵌入

<iframe src="/assets/modules/test/components/test/index.html" title="W3Schools Free Online Web Tutorials"></iframe>

## Angular 嵌入



<iframe src="/assets/angular/ec/index.html" title="W3Schools Free Online Web Tutorials"></iframe>

## Angular & Prerender 嵌入

## React