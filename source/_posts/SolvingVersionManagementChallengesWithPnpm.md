---
title: 減少依賴衝突、提高開發效率：使用 pnpm 解決版本管理挑戰
date: 2024-03-04
categories: Dev
author: johch3n611u
tags:
- node
- npm
- pnpm
- nvm
- nrm
authorsWords: 砍乾淨或重灌，直接依靠 pnpm 就對了
---

## 知識點

### Node：

1. 基於 Chrome V8 JavaScript 引擎的運行時環境
2. 它允許您在伺服器端運行 JavaScript 代碼
3. 提供了許多內置的模組和功能，使開發人員能夠進行服務器端開發

### Node_Module：

1. 用於存放專案所需套件的目錄
2. 當您使用 npm 或 pnpm 安裝套件時，這些套件將被下載並存放在 node_module 目錄中

### npm（Node Package Manager）：

1. Node.js 的官方套件管理器
2. 它用於安裝、管理和共享 JavaScript 套件
3. npm 提供了一個龐大的套件庫，供開發人員使用

### nvm（Node Version Manager）：

1. 用於管理 Node.js 版本的工具
2. 它允許您在同一台機器上安裝和切換不同版本的 Node.js
3. 能夠輕鬆地在不同專案之間切換 Node.js 版本

### nrm（Npm Registry Manager）：

1. 管理 npm 注冊表（registry）的工具
2. 它允許您輕鬆切換 npm 注冊表，例如從 npm 官方注冊表切換到其他私有或自託管的注冊表
3. 提供了檢測注冊表速度和顯示可用注冊表的功能

## 重要指令

[pnpm 官網](https://pnpm.io/installation)

1. 是另一個 Node.js 的套件管理器，與 npm 相似但具有一些不同的優點
2. 通過共享依賴來減少磁盤使用和安裝時間、僅需安裝一次
3. 它解決了依賴衝突的問題，並提供了快速且高效的依賴管理

```
1. Windows 安裝 pnpm
iwr https://get.pnpm.io/install.ps1 -useb | iex

2. 查找 .pnpm 的特殊目錄位置
pnpm root -g

指令幫助
pnpm help

安裝 node
pnpm env use --global < OPTIONS >

查詢 pnpm 目錄 ( 沒有客製化設定存放區，那麼 pnpm 將會自動於相同的磁碟機上建立存放區 )
pnpm store path

pnpm init

3. 刪除舊有 node_module 改以 pnpm i 產生包含 .pnpm 硬連結的 node_module，運作規則詳細可參考 [卡斯伯] 用 pnpm 取代 npm，讓 node_modules 不再是容量怪獸！
npm install = pnpm install

npm i <pkg> = pnpm add <pkg>

npm run <cmd> =	pnpm <cmd>
```

## Reference

- [解決問題 - node 不是內部或外部命令](https://urwebapp.github.io/Dev-Tech/SolveNodeCantFindProblem/)
- [How to manage multiple nodejs versions with pnpm?](https://medium.com/frontendweb/how-to-manage-multiple-nodejs-versions-with-pnpm-8bcce90abedb)
- [node.js之nvm/nrm/npm区别](https://juejin.cn/post/7123447437939638302)
- [how-to-change-where-pnpm-installs-the-global-packages](https://stackoverflow.com/questions/58278194/how-to-change-where-pnpm-installs-the-global-packages)
- [how-to-get-pnpm-store-directory](https://stackoverflow.com/questions/55403775/how-to-get-pnpm-store-directory)
- [pnpm 目錄位置更改](https://pnpm.io/cli/config)
- [pnpm remove](https://pnpm.io/cli/remove)
- [解除安裝 pnpm](https://pnpm.io/zh-TW/7.x/uninstall)
- [沒有設定存放區，那麼 pnpm 將會自動於相同的磁碟機上建立存放區](https://pnpm.io/zh-TW/configuring)
- [[卡斯伯]用 pnpm 取代 npm，讓 node_modules 不再是容量怪獸！](https://ithelp.ithome.com.tw/articles/10319375)