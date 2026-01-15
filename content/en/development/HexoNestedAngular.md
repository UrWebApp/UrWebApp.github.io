---
title: Integrating Angular into Hexo
date: 2023-02-05 15:00
category: Development
author: johch3n611u
authorsWords: Actually, we have to wait for the component library project to be combined with this site to know...
tags:
  - Angular
---

> To embed Angular into Hexo, you need to complete the following steps:
>
> 1. Compile the Angular application into static resources, including HTML, CSS, and JavaScript files.
> 2. Place these static resources in the source directory of Hexo.
> 3. Use embedded HTML code in Hexo's Markdown files to load the static resources of the Angular application.
> 4. Or load the Angular program page through an iframe

## Integrating Static Resources into Hexo

First you need to compile the Angular application into static resources, HTML, CSS, JavaScript. Since Hexo is a static site generator, it cannot support dynamically generated content and interactive pages.

When embedding Angular in Hexo, you need to ensure that all contents of the Angular application are static and do not need to dynamically load data from the server side.

(But it can also receive data passed by other backend APIs or SaaS like Firebase)

## Angular Embedding

After compilation is complete, place these static resources in the source directory of Hexo, and use Hexo's template system to embed these resources.

You can use embedded HTML code in Hexo's Markdown files to load the static resources of the Angular application, for example:

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

The ng-app attribute specifies the root node of the Angular program, and `<my-app>` loads the two JavaScript files angular.js and app.js in the specified path.

If you need to load some default data rendering from the server side, using a solution like Angular Universal is not enough. AGU can only execute the Express Server in an environment that can run node.js to generate content on the server side and send it to the client. To be able to publish on Github Page, you must make the Angular program into a Static Site Generator similar to Hexo, and cooperate with Prerender web page pre-rendering (Server-side Rendering, SSR) on the local end.

## Angular iframe

1. The source of the iframe can control css and is less affected by the css of the site.
2. But it is more difficult for the referencing source side to master the responsiveness of this Angular program.

<div style="height:500px;border: 1px solid;">
	<iframe 
	class="responsiveIframe" 
	src="/assets/angular/ec/index.html" 
	width="100%" marginwidth="0" marginheight="0" frameborder="0"
	title="W3Schools Free Online Web Tutorials"></iframe>
</div>

## Bonus: Static Site Generator

`Hexo is a fast, simple and powerful static site generator. It is built using Node.js and supports Markdown syntax and EJS template engine to generate static websites.`

In plain language, it generates HTML, CSS, and JavaScript according to these template languages, which can be used on services like Github Page static website hosting.

And like Github Page, it can also support Jekyll, Hugo, Hexo to directly PUSH source code and then CICD Generator Static Site.

But these static website hostings cannot Run Node or general backend programs .Net Core etc...

### Other Useful Generators

Thinking about previous system vendors companies, time is money. If a project can be completed or started quickly, you can hurry to the next project. So usually there are many programs that use templates to generate program frameworks. For example, Microsoft officially provides DB First, which can directly generate a simple basic scaffold according to the database.

There are also some things like `Code Snippet Generator` provided by PostMan and Swagger, which can quickly increase development experience and speed.

![postman-code-snippet](/assets/hexo/img/hexo/postman-code-snippet.png)

![swagger-editor-generate](/assets/hexo/img/hexo/swagger-editor-generate.png)

## Reference Articles

1. [Simplify Development with Angular Standalone Component](https://blog.crazyalu.com/2023/04/21/angular-standalone-component/)
2. [[Angular Universal] Use Prerender to Build Your Own Static Site Generator](https://fullstackladder.dev/blog/2021/10/16/static-site-generator-using-angular-universal-prerender/)
3. [iframe-automatically](https://stackoverflow.com/questions/9975810/make-iframe-automatically-adjust-height-according-to-the-contents-without-using)
4. [react vs angular build size](https://www.techuz.com/blog/angular-vs-react/)
5. [iterating-over-result-of-getelementsbyclassname-using-array-foreach](https://stackoverflow.com/questions/3871547/iterating-over-result-of-getelementsbyclassname-using-array-foreach)
6. [Use JS to Automatically Adjust iframe Height According to Content](https://blog.poychang.net/javascript-iframe/)
