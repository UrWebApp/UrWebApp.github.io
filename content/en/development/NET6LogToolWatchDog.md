---
title: Net6 Log Tool WatchDog
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

A super lightweight visual Log tool!

I have been using Serilog with Seq for logging, but compared to Seq which requires additional installation (whether directly on Windows or via Docker), WatchDog (though it also supports external message queues) can be used out of the box with just NuGet installation and a few lines of settings in Program.cs. It allows viewing logs directly on the web page, which is very convenient for small projects or when developing locally to check logs.

### Installation

- WatchDog.NET

### Program.cs Settings

```C#
// Add WatchDog service
builder.Services.AddWatchDogServices(opt =>
{
    opt.SetExternalDbConnString = builder.Configuration.GetConnectionString("Connection");
    opt.DbDriverOption = WatchDogDbDriverEnum.MSSQL;
    opt.IsAutoClear = true;
    opt.ClearTimeSchedule = WatchDogAutoClearScheduleEnum.Monthly;
});


// Use WatchDog exception logger
app.UseWatchDogExceptionLogger();

// Use WatchDog Middleware
app.UseWatchDog(opt =>
{
    opt.WatchPageUsername = "admin";
    opt.WatchPagePassword = "admin";
    opt.Blacklist = "login";
});
```

### Usage

Inject `IWatchLogger` into the constructor to use it

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

### Result

After running, go to `/watchdog` to see the login page. Enter the account and password set in Log to log in.

![WatchDog Login Page](https://i.imgur.com/8QZqZ0M.png)

![WatchDog Dashboard](https://i.imgur.com/8QZqZ0M.png)

![WatchDog Logs](https://i.imgur.com/8QZqZ0M.png)

### References

- [WatchDog](https://github.com/IzyPro/WatchDog)
