---
title: Net core 全域異常處理
date: 2023-02-28 13:22:55
categories: Development
author: kai98k
tags:
- .Net
- Exception
- Filter
---
在開發中除了利用 Log 套件幫助我們記下有問題或是 Error 的地方，還可以利用 .Net core 中的 Filter 來處理一些異常發生時，該做的事。

## Filter

藉由微軟提供的視圖，可以看到 Filter 有點類似管道或是過濾器的概念，在 .Net core 中程式的生命週期會先進到中介層(Middleware)，再進到這次要談的 Filter。

![.net pipe](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/filters/_static/filter-pipeline-1.png?view=aspnetcore-7.0)

## Exception Filter


Filter 有很多種，這次要使用到的是 Exception Filter，顧名思義，就是在異常發生時會進到的過濾器。

![filter](https://images2015.cnblogs.com/blog/162090/201707/162090-20170716130815660-1249491527.png)


### 新增 ExceptionFilter(自訂名稱) class

繼承 `IAsyncExceptionFilter` / `IExceptionFilter`，利用 `OnExceptionAsync` 方法來自訂異常發生時該做什麼事，在範例中選擇寄信。

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
            // 尚未處理的異常
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

### 在 Program.cs 註冊

```csharp
  builder.Services.AddMvc(config =>
    {
        config.Filters.Add(new ExceptionFilter());
    });
```

如在 Filter 中有使用到 DI 注入的 Service，可以選擇用以下方法註冊。
```csharp
builder.Services.AddScoped<IMailService, MailService>();

...

builder.Services.AddMvc(config =>
    {
        config.Filters.Add(typeof(ExceptionFilter));
    });
```

## Reference
- [ASP.NET Core 中的 Filter](https://www.tpisoftware.com/tpu/articleDetails/2257)
- [.NET Core：处理全局异常](https://www.cnblogs.com/dotnet261010/p/13193124.html)
