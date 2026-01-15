---
title: Net6 ログツール WatchDog
date: 2023-08-01
category: Backend
author: johch3n611u
tags:
  - C#
  - Net6
  - Note
  - Log
---

## WatchDog

超軽量の可視化ログツールです！

これまでログ記録には Serilog と Seq を使用してきましたが、追加のインストールが必要な Seq（Windows に直接インストールするか Docker 経由かに関わらず）と比較して、WatchDog（外部メッセージキューもサポートしていますが）は NuGet のインストールと Program.cs での数行の設定だけで、すぐに使用できます。Web ページでログを直接確認できるため、小規模なプロジェクトやローカル開発時のログ確認に非常に便利です。

### インストール

- WatchDog.NET

### Program.cs 設定

```C#
// WatchDog サービスを追加
builder.Services.AddWatchDogServices(opt =>
{
    opt.SetExternalDbConnString = builder.Configuration.GetConnectionString("Connection");
    opt.DbDriverOption = WatchDogDbDriverEnum.MSSQL;
    opt.IsAutoClear = true;
    opt.ClearTimeSchedule = WatchDogAutoClearScheduleEnum.Monthly;
});


// WatchDog 例外ロガーを使用
app.UseWatchDogExceptionLogger();

// WatchDog ミドルウェアを使用
app.UseWatchDog(opt =>
{
    opt.WatchPageUsername = "admin";
    opt.WatchPagePassword = "admin";
    opt.Blacklist = "login";
});
```

### 使用方法

コンストラクタに `IWatchLogger` を注入して使用します

```C#
private readonly IWatchLogger _watchLogger;

public WeatherForecastController(IWatchLogger watchLogger)
{
    _watchLogger = watchLogger;
}

[HttpGet(Name = "GetWeatherForecast")]
public IEnumerable<WeatherForecast> Get()
{
    _watchLogger.Log("GetWeatherForecast");
    return Enumerable.Range(1, 5).Select(index => new WeatherForecast
    {
        Date = DateTime.Now.AddDays(index),
        TemperatureC = Random.Shared.Next(-20, 55),
        Summary = Summaries[Random.Shared.Next(Summaries.Length)]
    })
    .ToArray();
}
```

### 結果

実行後、`/watchdog` にアクセスするとログインページが表示されます。Log で設定したアカウントとパスワードを入力してログインします。

![WatchDog Login Page](https://i.imgur.com/8QZqZ0M.png)

![WatchDog Dashboard](https://i.imgur.com/8QZqZ0M.png)

![WatchDog Logs](https://i.imgur.com/8QZqZ0M.png)

### 参照

- [WatchDog](https://github.com/IzyPro/WatchDog)
