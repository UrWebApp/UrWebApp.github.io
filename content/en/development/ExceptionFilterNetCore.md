---
title: Net core Global Exception Handling
date: 2023-02-28 13:22:55
categories: Development
author: kai98k
tags:
  - .Net
  - Exception
  - Filter
---

In development, besides using Log packages to help us note down problematic areas or Errors, we can also use Filters in .Net core to handle things that should be done when some exceptions occur.

## Filter

From the view provided by Microsoft, you can see that Filter is somewhat similar to the concept of pipes or filters. In the life cycle of a program in .Net core, it will first enter the Middleware, and then enter the Filter we are going to talk about this time.

![.net pipe](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/filters/_static/filter-pipeline-1.png?view=aspnetcore-7.0)

## Exception Filter

There are many kinds of Filters. This time we are going to use Exception Filter. As the name suggests, it is a filter that will be entered when an exception occurs.

![filter](https://images2015.cnblogs.com/blog/162090/201707/162090-20170716130815660-1249491527.png)

### Add ExceptionFilter (Custom Name) class

Inherit `IAsyncExceptionFilter` / `IExceptionFilter`, and use the `OnExceptionAsync` method to customize what to do when an exception occurs. In the example, we choose to send an email.

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
            // Unhandled exception
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

### Register in Program.cs

```csharp
  builder.Services.AddMvc(config =>
    {
        config.Filters.Add(new ExceptionFilter());
    });
```

If you use a DI injected Service in the Filter, you can choose to register it using the following method.

```csharp
builder.Services.AddScoped<IMailService, MailService>();

...

builder.Services.AddMvc(config =>
    {
        config.Filters.Add(typeof(ExceptionFilter));
    });
```

## Reference

- [Filters in ASP.NET Core](https://www.tpisoftware.com/tpu/articleDetails/2257)
- [.NET Core: Handling Global Exceptions](https://www.cnblogs.com/dotnet261010/p/13193124.html)
