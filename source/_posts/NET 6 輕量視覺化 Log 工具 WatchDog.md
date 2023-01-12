---
title: .NET 6 輕量視覺化 Log 工具 WatchDog
date: 2023-01-08 19:11:18
categories: Back-End
author: Kai98k
tags:
- Log
- .Net
---
在專案中，上機測試常常會碰到原本開發上沒遇過的問題，這時候就要環境中留存的 Log 來做 Debug 了。如專案中的 Log 衍生需求不多，建議可使用這套 WatchDog 工具。
## 介紹
WatchDog 利用 SignalR 與預設 LiteDb 來實現 Web UI 即時監控 Http/Error Log 等事件 ，可依需求替換不同的資料庫，像是MSSQL、MySQl、Postgres。
### 特點
* 即時捕獲 Http 請求/回應
* 即時異常例外紀錄
* 可在程式內客製化 Log 訊息紀錄
* 友善的 Log 察看頁面
* 支援 Log 日誌搜尋
* 可定時自動清除 Log 
## 安裝
使用 Nuget 介面安裝，或是使用以下指令
```console=
dotnet add package WatchDog.NET --version 1.3.3
```
## 在 Program.cs 設定
```c#=
// Program.cs

using WatchDog;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddWatchDogServices(option =>
    {
        option.IsAutoClear = true;
        option.ClearTimeSchedule = WatchDogAutoClearScheduleEnum.Monthly;
        // 以下可不填
        option.SqlDriverOption = WatchDogSqlDriverEnum.MSSQL;
        option.SetExternalDbConnString = "Data Source=localhost;Initial Catalog=WatchDog;Integrated Security=True";

    });

var app = builder.Build();

app.UseWatchDogExceptionLogger();
    app.UseWatchDog(option =>
    {
        option.WatchPageUsername = "Username";
        option.WatchPagePassword = "P@ssword";
          // 以下可不填
        option.Blacklist = "Test/testPost, weatherforecast"; //Prevent logging for specified endpoints
        option.Serializer = WatchDogSerializerEnum.Newtonsoft; //If your project use a global json converter
        option.CorsPolicy = "MyCorsPolicy"

    });

app.UseAuthorization();
app.Run();
```
* `IsAutoClear`:設定 Log 自動清除。
* `ClearTimeSchedule`: 設定自動清除計畫，上者要是 `true`。
* `SqlDriverOption`: 可不填，不填時自動預設 liteDB 為資料庫，在範例中使用 MSSQL。
* `SetExternalDbConnstring`: 為資料庫連線字串
* `WatchPageUsername`: 為可視化頁面登入帳號。
* `watchPagePassword`: 為可視化頁面登入密碼。

## Log 訊息/事件
```c#=
// Program.cs
WatchLogger.Log("...TestGet Started...");
WatchLogger.LogWarning(JsonConvert.Serialize(model));
WatchLogger.LogError(res.Content);
```
事件層級為普通`Log`、`LogWarning`、`LogError`，可自訂義 log 訊息。

## 測試
專案啟動後，可在根目錄輸入 /watchdog，可至可視化頁面，登入帳密在剛剛的設定中，登入後可以看到剛剛下的 Log。
![watchdog](https://i.imgur.com/QuZHHMa.png)
![watchdog](https://github.com/IzyPro/WatchDog/raw/main/watchlog.png)

## 總結
在專案後期如果要增加需求時，以下劣勢就出現了，所以還是要自行評估是否引入。
* 無法寫成 txt 檔
* 無法在事件發生時寄信給相關人士
* 只支援 .Net core 3.2+

撇除這三點，其實還算是不錯的，且原始 source code 也算明瞭，可以 clone/fork 下來魔改。
例如: [結合 Mailkit 在 Log 時，寄信給相關人士](https://github.com/IzyPro/WatchDog/pull/91/files)

## 參考資料
[WatchDog](https://github.com/IzyPro/WatchDog/pull/91/files)

