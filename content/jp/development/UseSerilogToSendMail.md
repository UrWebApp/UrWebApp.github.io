---
title: .NET6 で Serilog を使用し、ログ記録時に同時にメールを送信する
date: 2023-01-04
categories: Development
author: kai98k
tags:
  - Log
  - .Net
---

プロジェクトでは、実機テストの際、元の開発では遭遇しなかった問題によく遭遇します。このとき、デバッグを行うために環境に残されたログが必要になります。さらに、特定のイベントが発生したときに、ログを記録するだけでなく、関係者にメールを送信したい場合は、Serilog の使用を試みることができます。

複雑なログ要件がない場合は、ログ補助として軽量/視覚化された WatchDog を使用することをお勧めします。

## インストール手順

Nuget インターフェイスでインストールするか、コマンドを使用できます

```PowerShell
dotnet add package Serilog.AspNetCore // パッケージ
dotnet add package Serilog.Sinks.Email // Email への出力
```

主にイベント発生時に記録してメールを送信する必要があるため、関連する Email パッケージのみをインストールします。他のニーズがある場合は、Nuget インターフェイスで関連語を検索できます

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

## Program.cs で Serilog 設定を初期化する

```csharp
using Serilog;
using Serilog.Events;
using Serilog.Sinks.Email;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console() // ログをコンソールに書き込む
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day) // ログを TXT ファイルに書き込み、ファイル名で日付を区別する
    .WriteTo.Email(new EmailConnectionInfo()
    {
        MailServer = "smtp.gmail.com",
        Port = 465,
        EnableSsl = true,
        NetworkCredentials = new NetworkCredential("account@gmail.com", "password"), // SMTP 認証アカウントとパスワード
        EmailSubject = "No-reply Notification", // メールの件名
        FromEmail = "xxxx@gmail.com", // 送信者
        ToEmail = "xxxx@gmail.com" // 受信者
    })
    .CreateLogger();

    try{
    // その他のコード
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

`finally` 内の `Log.CloseAndFlush();` により、予期せず終了した場合でもプログラムが確実にログを書き込むことができます。

サンプルコードにあるように、ログをローカルの Txt ファイルに書き込むか、メールで送信するか、SQL に保存するか（未実装）などを自分で決定できます。

公式 [Github wiki](https://github.com/serilog/serilog/wiki/Writing-Log-Events) を通じて、Serilog がプロジェクトのどこでも使用できる静的クラス Log を提供していることがわかりますが、使用する前に Log.Logger を設定する必要があります。

### 静的クラス Log の使用方法

```csharp
Log.Verbose("Record"); // 詳細情報
Log.Debug("Record");
Log.Information("Record"); // ユーザーレベル
Log.Warning("Record");
Log.Error("Record");
Log.Fatal("Record");
```

### Log Event Level

また、Serilog [イベントレベル](https://github.com/serilog/serilog/blob/dev/src/Serilog/Events/LogEventLevel.cs) には 6 つあり、それぞれ `Verbose = 0`、` Debug = 1`、 `Information = 2`、 `Warning = 3`、`Error = 4`、`Fatal = 5` です。

上記のサンプルコードでは、`MinimumLevel` は表示される最低イベントレベルであり、デフォルトは `Information` です。`MinimumLevel.Debug()`、`MinimumLevel.Verbose()` などに設定でき、ログイベントはそのレベルから順に表示されます。

## テスト

先ほどの静的クラス Log を使用してテストを支援したり、コードに故意にエラーを埋め込んで実験したりすることもできます。

```csharp
try
  {
    Log.Fatal("Host terminated unexpectedly");
    int.Parse("Error");
    return "success";
  }
catch (Exception ex)
  {
    throw ex;
  }

```

間もなくメールを受信できるようになり、プロジェクト内に Log フォルダも確認できます。

![log](https://i.imgur.com/su8O8Jy.png)

## 高度な使用法

受信者を動的に入力する必要があるため、Nuget またはコマンドで追加インストールする必要があります

```PowerShell
dotnet add package Serilog.Sinks.Map // Config で変数を使用
```

インストール後、先ほどの Program.cs の設定を調整する必要があります

```csharp
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

主な違いは以下の部分にあります

```csharp
.WriteTo.Map("Address", "default@gmail.com", (address, wt) => wt.Email(new EmailConnectionInfo(){...})
```

以下は自分で名前を付けることができます

- `Address`: 静的メソッド Log で使用できます。
- `default@gmail.com`: このパラメータはデフォルト値であり、右側の括弧内の最初のパラメータに取り込まれます。
- `address`: アロー関数で使用できる変数で、静的メソッド Log のパラメータによって返されます。
- `wt`: `WriteTo` です。

静的メソッド Log を使用すると、さまざまな相手に送信できます。

```csharp
try
            {

                Log.Fatal("Error"); // デフォルトの受信者
                Log.Fatal("Host terminated unexpectedly {Address}", "test1.com.tw");
                Log.Fatal("Host terminated unexpectedly {Address}", "test2.com.tw");

                int.Parse("Error");
                return "success";
            }
            catch (Exception ex)
            {
                throw ex;
            }
```

## 参考資料

- [Serilog](https://github.com/serilog/serilog/wiki)
- [.NET 6.0 で Serilog を使用してアプリケーションイベントを構造化記録する方法](https://blog.miniasp.com/post/2021/11/29/How-to-use-Serilog-with-NET-6)
- [ASP.NET Core 30 日の旅](https://ithelp.ithome.com.tw/articles/10295821)
