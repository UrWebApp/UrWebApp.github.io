---
title: 無到有 Net Core API 環境建置與便捷設定
date: 2023-03-25
categories: Dev Tech
author: johch3n611u
tags:
- Visual Studio
- C#
authorsWords: 以往每次要用都要查一次，系統性的紀錄在這方便查詢
---

> 此文章記錄重新開專案時遇到的一些問題方便以後查看，會不定時編修，如有錯誤在麻煩各位大神請不吝設指教，感謝！

## Sql Express

![](/assets/img/sql-express.png)

Sql Express 是免費的 Microsoft SQL Server 關聯式數據庫管理系統，適合獨立開發人員測試或小系統使用。

網路上有看到有方法，拿到它獨立的安裝檔方便群體自動化安裝，目前是不知道什麼情境需要這種情境，暫且紀錄；

![](/assets/img/ef-dependency-mod.jpg)

`dotnet tool install --global dotnet-ef`

感覺比較複雜的應該是 EF 需要依賴哪些 Module 而後 Connection 與 EF DB First Update 指令怎麼取得，但這些在現今這個開發大環境下依靠 AI 或 VS IDE 本身的提示，應該都蠻好解決的，比較值得注意的是 

1. dotnet tool ef 不安裝這個與依賴 MOD 無法使用指令更新 EF
2. TrustServerCertificate=True，如果有遇到 SSL 的問題，不管在連線或更新 EF 都要補上。

`dotnet ef dbcontext scaffold "Server=***;Database=***;User Id=***;Password=***;TrustServerCertificate=True" Microsoft.EntityFrameworkCore.SqlServer -o Models -f`

## VS IDE 瞄和定義

![](/assets/img/vs-ide-definition.png)

想要查看某個方法、變數或類型的詳細定義時，可以更深入地理解程式碼中使用的各種元素。

## VS IDE GitHub 的範例和文檔

![](/assets/img/vs-ide-github-sample.png)

看起來蠻好用的，但實際目前的狀況發現，如果類型命名太相似會顯示錯誤的範例，所以還是要人工判斷。

## VS IDE 設定啟動專案...

![](/assets/img/vs-ide-muti-run-serve.jpg)

其實在職訓局時就有接觸到這個功能，但在當時並沒有一次性啟動多個專案的需求，結果被上包人員教學了，非常感激，不然就會停留在原始人時代多開 IDE 啟動專案...