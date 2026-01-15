---
title: 依存関係の競合を減らし、開発効率を向上させる：pnpm でバージョン管理の課題を解決する
date: 2024-03-04
categories: Development
author: johch3n611u
tags:
  - node
  - npm
  - pnpm
  - nvm
  - nrm
authorsWords: きれいに削除するか再インストールして、pnpm に頼れば間違いありません
---

## 知識ポイント

### Node：

1. Chrome V8 JavaScript エンジンに基づくランタイム環境
2. サーバーサイドで JavaScript コードを実行できるようにします
3. 開発者がサーバーサイド開発を行えるようにする多くの組み込みモジュールと機能を提供します

### Node_Module：

1. プロジェクトに必要なパッケージを格納するためのディレクトリ
2. npm または pnpm を使用してパッケージをインストールすると、これらのパッケージがダウンロードされ、node_module ディレクトリに格納されます

### npm（Node Package Manager）：

1. Node.js の公式パッケージマネージャー
2. JavaScript パッケージのインストール、管理、共有に使用されます
3. npm は開発者が使用できる巨大なパッケージライブラリを提供します

### nvm（Node Version Manager）：

1. Node.js のバージョンを管理するためのツール
2. 同じマシンに異なるバージョンの Node.js をインストールして切り替えることができます
3. 異なるプロジェクト間で Node.js のバージョンを簡単に切り替えることができます

### nrm（Npm Registry Manager）：

1. npm レジストリ（registry）を管理するためのツール
2. npm 公式レジストリから他のプライベートレジストリやセルフホスト型レジストリへの切り替えなど、npm レジストリを簡単に切り替えることができます
3. レジストリの速度を検出し、利用可能なレジストリを表示する機能を提供します

## 重要なコマンド

[pnpm 公式サイト](https://pnpm.io/installation)

1. Node.js のもう 1 つのパッケージマネージャーであり、npm に似ていますが、いくつかの異なる利点があります
2. 依存関係を共有することでディスク使用量とインストール時間を削減し、インストールは 1 回で済みます
3. 依存関係の競合問題を解決し、高速で効率的な依存関係管理を提供します

```
1. Windows に pnpm をインストール
iwr https://get.pnpm.io/install.ps1 -useb | iex

2. .pnpm の特別なディレクトリ位置を見つける
pnpm root -g

コマンドヘルプ
pnpm help

node インストール
pnpm env use --global < OPTIONS >

pnpm ディレクトリのクエリ ( カスタム設定された保存場所がない場合、pnpm は同じドライブ上に自動的に保存場所を作成します )
pnpm store path

pnpm init

3. 古い node_module を削除し、pnpm i を使用して .pnpm ハードリンクを含む node_module を生成します。動作ルールの詳細は [Casper] 用 pnpm 取代 npm，讓 node_modules 不再是容量怪獸！を参照してください
npm install = pnpm install

npm i <pkg> = pnpm add <pkg>

npm run <cmd> =	pnpm <cmd>
```

## Reference

- [問題解決 - node は内部コマンドまたは外部コマンドではありません](https://urwebapp.github.io/Dev-Tech/SolveNodeCantFindProblem/)
- [How to manage multiple nodejs versions with pnpm?](https://medium.com/frontendweb/how-to-manage-multiple-nodejs-versions-with-pnpm-8bcce90abedb)
- [node.js における nvm/nrm/npm の違い](https://juejin.cn/post/7123447437939638302)
- [how-to-change-where-pnpm-installs-the-global-packages](https://stackoverflow.com/questions/58278194/how-to-change-where-pnpm-installs-the-global-packages)
- [how-to-get-pnpm-store-directory](https://stackoverflow.com/questions/55403775/how-to-get-pnpm-store-directory)
- [pnpm ディレクトリ位置の変更](https://pnpm.io/cli/config)
- [pnpm remove](https://pnpm.io/cli/remove)
- [pnpm のアンインストール](https://pnpm.io/zh-TW/7.x/uninstall)
- [保存場所が設定されていない場合、pnpm は同じドライブ上に自動的に保存場所を作成します](https://pnpm.io/zh-TW/configuring)
- [[Casper] npm を pnpm に置き換えて、node_modules を容量モンスターではなくしましょう！](https://ithelp.ithome.com.tw/articles/10319375)
