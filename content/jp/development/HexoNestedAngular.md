---
title: Hexo に Angular を統合する
date: 2023-02-05 15:00
category: Development
author: johch3n611u
authorsWords: 実際には、コンポーネントライブラリプロジェクトがこのサイトと結合されるのを待ってみないとわからないのですが...
tags:
  - Angular
---

> Angular を Hexo に埋め込むには、次の手順を完了する必要があります。
>
> 1. Angular アプリケーションを HTML、CSS、JavaScript ファイルを含む静的リソースとしてコンパイルします。
> 2. これらの静的リソースを Hexo の source ディレクトリに配置します。
> 3. Hexo の Markdown ファイルで埋め込み HTML コードを使用して、Angular アプリケーションの静的リソースを読み込みます。
> 4. または iframe を介して Angular プログラムページを読み込みます

## 静的リソースの Hexo への統合

まず、Angular アプリケーションを静的リソース（HTML、CSS、JavaScript）にコンパイルする必要があります。Hexo は静的サイトジェネレーターであるため、動的に生成されるコンテンツやインタラクティブなページをサポートできません。

Angular を Hexo に埋め込む場合は、Angular アプリケーションのすべてのコンテンツが静的であり、サーバー側から動的にデータを読み込む必要がないことを確認する必要があります。

（ただし、他のバックエンド API や Firebase などの SaaS から渡されるデータを受け取ることはできます）

## Angular 埋め込み

コンパイルが完了したら、これらの静的リソースを Hexo の source ディレクトリに配置し、Hexo のテンプレートシステムを利用してこれらのリソースを埋め込みます。

Hexo の Markdown ファイル内で埋め込み HTML コードを使用して、Angular アプリケーションの静的リソースを読み込むことができます。例：

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

ng-app 属性は Angular プログラムのルートノードを指定し、`<my-app>` は指定されたパスにある angular.js と app.js の 2 つの JavaScript ファイルを読み込みます。

サーバー側からいくつかのデフォルトデータレンダリングを読み込む必要がある場合、Angular Universal のようなソリューションを使用するだけでは不十分です。AGU は node.js を実行できる環境でのみ Express Server を実行してサーバー側でコンテンツを生成し、クライアントに送信できます。Github Page で公開できるようにするには、Angular プログラムを Hexo に似た Static Site Generator にし、ローカル側で Prerender Web ページプリレンダリング（Server-side Rendering、SSR）と連携する必要があります。

## Angular iframe

1. iframe の source は css を制御でき、サイトの css の影響を受けにくいです。
2. しかし、source を引用する側にとっては、この Angular プログラムのレスポンシブ対応を把握するのがより困難です。

<div style="height:500px;border: 1px solid;">
	<iframe 
	class="responsiveIframe" 
	src="/assets/angular/ec/index.html" 
	width="100%" marginwidth="0" marginheight="0" frameborder="0"
	title="W3Schools Free Online Web Tutorials"></iframe>
</div>

## おまけ：Static Site Generator

`Hexo は、高速、シンプル、かつ強力な静的サイトジェネレーターです。Node.js を使用して構築されており、Markdown 構文と EJS テンプレートエンジンをサポートして静的 Web サイトを生成します。`

平たく言えば、これらのテンプレート言語に従って HTML、CSS、JavaScript を生成し、Github Page 静的 Web サイトホスティングなどのサービスで使用できるようにするものです。

Github Page のように、Jekyll、Hugo、Hexo もサポートしており、ソースコードを PUSH した後、直接 CICD Generator Static Site を実行できます。

ただし、これらの静的 Web サイトホスティングでは、Node や一般的なバックエンドプログラム .Net Core などを実行することはできません...

### その他の便利な Generator

以前のシステムベンダー会社を考えると、時は金なりです。プロジェクトを迅速に完了または開始できれば、次のプロジェクトに急ぐことができます。そのため通常、テンプレートを使用してプログラムフレームワークを生成するプログラムが多くあります。たとえば、Microsoft 公式では、データベースに従って簡単な基本的な足場を直接生成できる DB First を提供しています。

また、PostMan や Swagger が提供する `Code Snippet Generator` のようなものもあり、開発体験と速度を急速に向上させることができます。

![postman-code-snippet](/assets/hexo/img/hexo/postman-code-snippet.png)

![swagger-editor-generate](/assets/hexo/img/hexo/swagger-editor-generate.png)

## 参考記事

1. [Angular Standalone Component を使用して開発を簡素化する](https://blog.crazyalu.com/2023/04/21/angular-standalone-component/)
2. [[Angular Universal] Prerender を使用して独自の Static Site Generator を作成する](https://fullstackladder.dev/blog/2021/10/16/static-site-generator-using-angular-universal-prerender/)
3. [iframe-automatically](https://stackoverflow.com/questions/9975810/make-iframe-automatically-adjust-height-according-to-the-contents-without-using)
4. [react vs angular build size](https://www.techuz.com/blog/angular-vs-react/)
5. [iterating-over-result-of-getelementsbyclassname-using-array-foreach](https://stackoverflow.com/questions/3871547/iterating-over-result-of-getelementsbyclassname-using-array-foreach)
6. [JS を使用してコンテンツに応じて iframe の高さを自動調整する](https://blog.poychang.net/javascript-iframe/)
