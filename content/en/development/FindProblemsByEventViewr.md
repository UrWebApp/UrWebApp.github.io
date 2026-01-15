---
title: Locate IIS site related problems and restart Application Pool mechanism
date: 2023-05-01
categories: Development
author: kai98k
tags:
  - IIS
---

Many people may know how to set up a website in IIS, but do not know where to find the relevant server logs. The answer is Event Viewer.

![Event Viewer](https://i.imgur.com/ghSzGGS.png)

## Event Viewer

After opening it, you can see events related to the Web Server, and reasons for site shutdown, etc. Sometimes when the site is just deployed, but the Runtime has a problem (the package may require .net4.5 CLR application pool, but the program is .net 6, etc.), and packages like Serilog cannot observe this phenomenon, you can go to .NET EventLog to view events such as forced site shutdown.

## Application Pool Mechanism

The site shutdown event shown in the image below is an IIS (Internet Information Services) warning message, indicating that the worker process in the Application Pool has been closed due to idle timeout.

![Site shutdown event](https://i.imgur.com/pbo8NBV.png)

By default, IIS sets the idle timeout of the application pool to 20 minutes. If the worker process does not process any requests within this period, it will be automatically closed by IIS to save system resources.

In this case, IIS will start a new worker process when needed to continue processing new requests.

If you don't want the application pool to be closed after being idle for a period of time, you can adjust the idle timeout setting of the application pool in IIS, or set it to 0, so that the worker process will not be automatically closed.

It should be noted that if your application takes a long time to process requests, such as processing large amounts of data or executing complex algorithms, you need to adjust the configuration of the application pool to avoid being automatically closed when processing requests.

To adjust the idle timeout setting of the application pool in IIS, or set it to 0, you can follow these steps:

1. Open the IIS Manager console, select Application Pools, right-click the application pool you want to adjust, and select "Advanced Settings".
   ![Step 1](https://i.imgur.com/SzmWmlK.png)

2. Find the "Process Model" section and scroll to the "Idle Time-out (minutes)" setting item below.
   ![Step 2](https://i.imgur.com/lZKXdao.png)
3. Set the idle time to the desired value, or set it to 0, which means the worker process will never effectively be automatically closed.

4. Click the "OK" button to save the settings.

After setting the idle timeout of the application pool, the worker process in the application pool will not be automatically closed due to idle timeout. It should be noted that the length of the idle time setting should be determined according to the processing time required by your application to avoid the worker process not working properly due to the idle time being too short or too long.

## Task Scheduler

In addition to adjusting IIS settings, you can also use the built-in Task Scheduler in Windows to use the Shut down Event ID as a Trigger to restart the web page, because opening the web page can also restart the program.

1. Open Task Scheduler

2. Click Create Basic Task

![Step 2](https://i.imgur.com/4xt36ui.png)

3. Fill in the task description

![Step 3](https://i.imgur.com/cYK8qjt.png)

4. Select Event Trigger

![Step 4](https://i.imgur.com/rJcONAr.png)

5. Select Event

![Step 5](https://i.imgur.com/14hEStj.png)

6. Select the steps to be performed when triggering, here select Start a program

![Step 6](https://i.imgur.com/cnyGvo7.png)

7. Select the program to be executed, here choose the Bat file I wrote myself

![Step 7](https://i.imgur.com/vzCpuJj.png)

8. Done!

## Reference

- [【Tea Bag Shooter Diary】The 29-hour curse of IIS](https://blog.darkthread.net/blog/iis-app-pool-auto-recycle/)
