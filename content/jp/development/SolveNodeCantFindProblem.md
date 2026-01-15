---
title: 問題解決 - node は内部コマンドまたは外部コマンドではありません
date: 2023-04-09
categories: Development
author: kai98k
tags:
  - node.js
  - npm
---

npm、webpack などはすべて node のサポートが必要です。node に問題がある場合、通常、他の関連コマンドも機能しません。node がインストールされているのにこの問題が発生する場合は、環境変数にエラーがある可能性があります。

## 環境変数

Windows 環境の場合は、スタート検索バーで検索できます。

![ステップ1](https://i.imgur.com/25vCJJm.png)

開いたら、[環境変数] をクリックします。

![ステップ2](https://i.imgur.com/6cdQIJ9.png)

node バージョンも nvm を使用して管理している場合は、ユーザー変数に nvm 関連の情報が表示されます。ただし、nvm がインストールされているかどうかに関係なく、下のシステム変数の Path で node の環境変数を確認する必要があります。

![ステップ3](https://i.imgur.com/VgzTXOI.png)

このとき、`node.exe` を含むフォルダパスが見つからない場合は、このファイルを含むパスを追加する必要があります。私は nvm をインストールしているので、node バージョン番号のフォルダ内にあります。nvm を使用して node を切り替えたが環境変数が変わらない場合も、ここで設定できます。

![ステップ4](https://i.imgur.com/5oPMw6e.png)

## 最後の手段 (Last Resort)

node の環境変数があることがわかったのにエラーが報告される場合は、`node.exe` が不足していないか確認できます。不足していない場合でも、直接再インストールできます。ただし、再インストールを成功させるための前提条件は、まず環境変数をすべて削除し、再インストールされた node/nvm に環境変数を確立させることです。

## Reference

- [windows nvm のインストールとシステム node path の手動構成](https://www.796t.com/content/1544611888.html)
