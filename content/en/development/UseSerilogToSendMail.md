---
title: Use Serilog in .NET 6 to send email at the same time as logging
date: 2023-01-04
categories: Development
author: kai98k
tags:
  - Log
  - .Net
---

In projects, we often encounter problems during on-machine testing that were not encountered in original development. At this time, we need Log retained in the environment to do Debug. In addition, when specific events occur, besides logging down, if we also need to send email to relevant personnel, we can try using Serilog.

If there is no complex Log requirement, I recommend using lightweight/visualized WatchDog for log assistance.

## Installation Steps

Can install in Nuget interface or use command

```PowerShell
dotnet add package Serilog.AspNetCore // Package
dotnet add package Serilog.Sinks.Email // Output to Email
```

Because mainly need to record and send email when event occurs, so only install relevant Email package. If there are other needs, can query related words in Nuget interface

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

## Initialize Serilog Settings in Program.cs

```csharp
using Serilog;
using Serilog.Events;
using Serilog.Sinks.Email;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console() // Log write to Console
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day) // Log write to TXT file, distinguished by filename with date of the day
    .WriteTo.Email(new EmailConnectionInfo()
    {
        MailServer = "smtp.gmail.com",
        Port = 465,
        EnableSsl = true,
        NetworkCredentials = new NetworkCredential("account@gmail.com", "password"), // SMTP authentication account and password
        EmailSubject = "No-reply Notification", // Mail subject
        FromEmail = "xxxx@gmail.com", // Sender
        ToEmail = "xxxx@gmail.com" // Recipient
    })
    .CreateLogger();

    try{
    // Other code
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

`Log.CloseAndFlush();` in `finally` can make sure program writes log indeed when ending unexpectedly.

Can see in example code, can decide by yourself whether to write Log in local Txt file, or send via email, or store in SQL (not implemented) etc.

Through official [Github wiki](https://github.com/serilog/serilog/wiki/Writing-Log-Events) we can know Serilog provides static class Log usable anywhere in project, but need to setup Log.Logger before use.

### How to use Static Class Log

```csharp
Log.Verbose("Record"); // Detailed info
Log.Debug("Record");
Log.Information("Record"); // User level
Log.Warning("Record");
Log.Error("Record");
Log.Fatal("Record");
```

### Log Event Level

In addition, Serilog [Event Level](https://github.com/serilog/serilog/blob/dev/src/Serilog/Events/LogEventLevel.cs) has 6 levels, respectively `Verbose = 0`, ` Debug = 1`, `Information = 2`, `Warning = 3`, `Error = 4`, `Fatal = 5`.

In example code above, `MinimumLevel` is the minimum event level to display, default is `Information`, can be set to `MinimumLevel.Debug()`, `MinimumLevel.Verbose()` etc., log events will be displayed sequentially starting from that level.

## Test

Can use static class Log just now to help test, or can also deliberately plant error in code to experiment.

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

Soon you can receive email, can also see Log folder in project.

![log](https://i.imgur.com/su8O8Jy.png)

## Advanced Usage

Because need to dynamically fill in recipient, so need to install more in Nuget or use command

```PowerShell
dotnet add package Serilog.Sinks.Map // Use variable in Config
```

After installation, settings in Program.cs just now need adjustment

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

Main difference is in this part below

```csharp
.WriteTo.Map("Address", "default@gmail.com", (address, wt) => wt.Email(new EmailConnectionInfo(){...})
```

Below can be named by yourself

- `Address`: Can be used in static method Log.
- `default@gmail.com`: This parameter is default value, will be brought into first parameter in parenthesis on the right.
- `address`: Variable usable in arrow function, returned by the parameter of static method Log.
- `wt`: Is `WriteTo`.

Then when using static method Log, can send to different recipients.

```csharp
try
            {

                Log.Fatal("Error"); // Default recipient
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

## References

- [Serilog](https://github.com/serilog/serilog/wiki)
- [How to use Serilog with .NET 6 to record structured application events](https://blog.miniasp.com/post/2021/11/29/How-to-use-Serilog-with-NET-6)
- [ASP.NET Core 30 Days Journey](https://ithelp.ithome.com.tw/articles/10295821)
