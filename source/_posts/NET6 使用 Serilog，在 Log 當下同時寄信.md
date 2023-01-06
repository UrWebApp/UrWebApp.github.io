---
title: .NET6 使用 Serilog，在 log 當下同時寄信
date: 2023-01-04 22:11:18
categories: 後端開發
author: 凱煞大地
tags:
- Log
- .NET
---
## 前言
在專案中，上機測試常常會碰到原本開發上沒遇過的問題，這時候就要環境中留存的 Log 來做 Debug 了。除此之外，當特定的事件發生時，除了要 Log 下來，還要寄信給相關人員時，就可以嘗試使用 Serilog。

如果沒有複雜的 Log 需求時，我推薦使用輕量/視覺化的 WatchDog 來做 log 輔助。

## 安裝步驟
可以在 Nuget 介面安裝或是下指令
```PowerShell
dotnet add package Serilog.AspNetCore // 套件包
dotnet add package Serilog.Sinks.Email //輸出至Email
```
因為主要是需要在事件發生時紀錄並寄信，所以只安裝相關 Email 套件，如有其他需求時，可以在 Nuget 介面查詢相關字眼
```PowerShell
dotnet add package Serilog.Sinks.Debug
dotnet add package Serilog.Sinks.File
dotnet add package Serilog.Sinks.Seq
dotnet add package Serilog.Sinks.MSSqlServer
dotnet add package Serilog.Settings.Configuration
dotnet add package Serilog.Extensions.Hosting
dotnet add package Serilog.Formatting.Compact
dotnet add package Serilog.Enrichers.Environment
dotnet add package Serilog.Enrichers.Thread
```
## 在 Program.cs 初始化 Serilog 設定
```csharp
using Serilog;
using Serilog.Events;
using Serilog.Sinks.Email;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console() // Log 寫入 Console
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day) // Log 寫入 TXT 檔，以當日日期為檔名區分
    .WriteTo.Email(new EmailConnectionInfo()
    {
        MailServer = "smtp.gmail.com",
        Port = 465,
        EnableSsl = true,
        NetworkCredentials = new NetworkCredential("account@gmail.com", "password"), // SMTP 認證帳號跟密碼
        EmailSubject = "No-reply Notification", //郵件主旨
        FromEmail = "xxxx@gmail.com", //寄件者
        ToEmail = "xxxx@gmail.com" // 收件者
    })
    .CreateLogger();
    
    try{
    // 其他程式碼
    return 0;
    }
    catch(Exception ex){
     Log.Fatal(ex, "Host terminated unexpectedly");
     return 1;
    }
    finally
    {
    Log.CloseAndFlush();
    }
```
在 `finally` 中的 `Log.CloseAndFlush();`，可以讓程式在意外結束中確實寫入 log。

在範例程式碼可看到，可以自行決定要將 Log 寫在本地的 Txt 檔，或是透過郵件來發送，也可以存在 SQL 中(無實作)等等。

透過官方[Github wiki](https://github.com/serilog/serilog/wiki/Writing-Log-Events)可以知道 Serilog 有提供靜態類別 Log 可用在專案的任何地方，在使用之前要先設定好 Log.Logger。

### 靜態類別 Log 使用方式
```csharp
Log.Verbose("紀錄"); // 詳細資訊
Log.Debug("紀錄");
Log.Information("紀錄"); // 使用者層級
Log.Warning("紀錄");
Log.Error("紀錄");
Log.Fatal("紀錄"); 
```

### Log Event Level
另外，Serilog [事件層級](https://github.com/serilog/serilog/blob/dev/src/Serilog/Events/LogEventLevel.cs)有6個，分別是 `Verbose = 0`，` Debug = 1`， `Information = 2`， `Warning = 3`，`Error = 4`，`Fatal = 5`。

在上面的範例程式碼中的，`MinimumLevel` 是顯示的最低事件層級，預設是`Information`，可設定為`MinimumLevel.Debug()`、`MinimumLevel.Verbose()`等等，log事件會從該層級開始依序顯示。

## 測試
可以用剛剛的靜態類別 Log 來幫助測試，或者也可以故意在程式碼中來埋下錯誤實驗。
```csharp
try
  {
    Log.Fatal("Host terminated unexpectedly");
    int.Parse("錯誤");
    return "success";
  }
catch (Exception ex)
  {
    throw ex;
  }

```
過不久就可以收到郵件了，也可以在專案中看見 Log 資料夾。
![log](https://i.imgur.com/su8O8Jy.png)

## 進階用法
因為需要動態填入收信者，所以需在 Nuget 或下指令多安裝
``` PowerShell
dotnet add package Serilog.Sinks.Map // 在 Config 中使用變數
```
安裝完後，剛剛在 Program.cs 的設定需要調整一下
``` csharp
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .WriteTo.Map("Address", "default@gmail.com", (address, wt) => wt.Email(new EmailConnectionInfo()
    {
        MailServer = "smtp.gmail.com",
        Port = 465,
        EnableSsl = true,
        NetworkCredentials = new NetworkCredential("xxxx@gmail.com", "xxxx"),
        EmailSubject = "Notification",
        FromEmail = "xxxx@gmail.com",
        ToEmail = address,
    }))
    .CreateLogger();
```
主要差異在於下面這段
```csharp
.WriteTo.Map("Address", "default@gmail.com", (address, wt) => wt.Email(new EmailConnectionInfo(){...})
```
以下皆可自行取名
* `Address`: 可以在靜態方法 Log 中使用。
* `default@gmail.com`: 此參數為預設值，會帶進右方括弧中第一個參數。
* `address`: 可在箭頭函式使用的變數，由靜態方法 Log 的地個參數傳回。
* `wt`: 為 `WriteTo`。

接著使用靜態方法 Log 時，就可以寄給不同對象。
``` csharp
try
            {

                Log.Fatal("Error"); // 預設收件者
                Log.Fatal("Host terminated unexpectedly {Address}", "test1.com.tw");
                Log.Fatal("Host terminated unexpectedly {Address}", "test2.com.tw");

                int.Parse("錯誤");
                return "success";
            }
            catch (Exception ex)
            {
                throw ex;
            }
```

## 參考資料

* [Serilog](https://github.com/serilog/serilog/wiki)
* [.NET 6.0 如何使用 Serilog 對應用程式事件進行結構化紀錄](https://blog.miniasp.com/post/2021/11/29/How-to-use-Serilog-with-NET-6)
* [ASP.NET Core 30 天旅程](https://ithelp.ithome.com.tw/articles/10295821)

