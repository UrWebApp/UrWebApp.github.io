---
title: Net core グローバル例外処理
date: 2023-02-28 13:22:55
categories: Development
author: kai98k
tags:
  - .Net
  - Exception
  - Filter
---

開発において、Log パッケージを使用して問題やエラーがある場所を記録するだけでなく、.Net core の Filter を使用して、いくつかの例外が発生したときに行うべき処理を処理することもできます。

## Filter

Microsoft が提供するビューから、Filter はパイプやフィルターの概念に少し似ていることがわかります。.Net core のプログラムのライフサイクルでは、最初にミドルウェア（Middleware）に入り、次に今回説明する Filter に入ります。

![.net pipe](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/filters/_static/filter-pipeline-1.png?view=aspnetcore-7.0)

## Exception Filter

Filter には多くの種類がありますが、今回使用するのは Exception Filter です。その名の通り、例外が発生したときに呼び出されるフィルターです。

![filter](https://images2015.cnblogs.com/blog/162090/201707/162090-20170716130815660-1249491527.png)

### ExceptionFilter（カスタム名）クラスを追加

`IAsyncExceptionFilter` / `IExceptionFilter` を継承し、`OnExceptionAsync` メソッドを使用して、例外が発生したときに何をするかをカスタマイズします。例ではメール送信を選択しています。

```csharp=
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Test.Filter
{
    public class ExceptionFilter : IAsyncExceptionFilter
    {
        private IMailService _mailService;
        public ExceptionFilter(IMailService mailService)
        {
            _mailService = mailService;
        }
        public Task OnExceptionAsync(ExceptionContext _exceptionContext)
        {
            // 未処理の例外
            if (_exceptionContext.ExceptionHandled == false)
            {
                var errorMsg = "";
                var exception = _exceptionContext.Exception;
                var stackTrace = exception.StackTrace;
                while (exception != null)
                {
                    errorMsg += $@"<p>{exception.Message}</p>";
                    exception = exception.InnerException;
                }

                _exceptionContext.Result = new ContentResult
                {

                };
                _mailService.CreateMessage("test Error", null, $"{errorMsg},<p>{stackTrace}</p>");
                _mailService.SendMessage("test@test.com.tw");
                _exceptionContext.ExceptionHandled = true;
            }

            return Task.CompletedTask;
        }
    }
}
```

### Program.cs で登録

```csharp
  builder.Services.AddMvc(config =>
    {
        config.Filters.Add(new ExceptionFilter());
    });
```

Filter 内で DI 注入された Service を使用している場合は、次の方法を選択して登録できます。

```csharp
builder.Services.AddScoped<IMailService, MailService>();

...

builder.Services.AddMvc(config =>
    {
        config.Filters.Add(typeof(ExceptionFilter));
    });
```

## 参照

- [ASP.NET Core の Filter](https://www.tpisoftware.com/tpu/articleDetails/2257)
- [.NET Core：グローバル例外処理](https://www.cnblogs.com/dotnet261010/p/13193124.html)
