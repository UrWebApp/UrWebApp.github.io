---
title: 解決問題 - node 不是內部或外部命令
date: 2023-04-09
categories: Dev Tech
author: kai98k
tags:
- node.js
- npm
---
npm、webpack 等等都需要 node 來支援，如果 node 出問題了，那通常其他相關的指令也無法運作，如果有灌 node，但還出現這樣的問題，可能是環境變數出現了錯誤。

## 環境變數

如果是 Windows 環境，可以在開始搜尋列中查詢

![步驟1](https://i.imgur.com/25vCJJm.png)

打開後，點擊環境變數

![步驟2](https://i.imgur.com/6cdQIJ9.png)

如果你的 node 版本也是利用 nvm 做管控，那就會看到使用者變數中有 nvm 的相關資訊，但不管有沒有安裝 nvm，都要在下方系統變數中的 Path 查看 node 的環境變數。

![步驟3](https://i.imgur.com/VgzTXOI.png)

此時如果沒有發現含有 `node.exe` 的資料夾路徑，就要新增含有此檔案的路徑，因為我有安裝 nvm，所以就會在 node 版號的資料夾裡，如果使用 nvm 切換 node，但環境變數沒變的話，也可以在此設定。

![步驟4](https://i.imgur.com/5oPMw6e.png)


## 絕招

當發現有 node 的環境變數時，但還是報錯，可以檢查看看是否遺失 node.exe，就算沒有遺失，也可以直接重灌，但重灌能成功的前提是要先將環境變數都刪掉，讓重新安裝的 node/nvm 來幫忙建立環境變數。

## Reference

- [windows安裝nvm及手動配置系統node的path
](https://www.796t.com/content/1544611888.html)