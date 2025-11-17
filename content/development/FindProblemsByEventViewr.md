---
title: 查找 IIS 站台相關問題與重啟 Application Pool 機制
date: 2023-05-01
categories: Development
author: kai98k
tags:
- IIS
---
許多人可能知道怎麼在 IIS 架設網站，卻不知道相關的伺服器 Log 要在哪尋找，答案就是事件檢視器(event viewer)。

![事件檢視器](https://i.imgur.com/ghSzGGS.png)

## Event Viewer

打開後，可以看到 Web Server 相關事件，以及站台關閉原因等等，有時候當站台剛部屬好時，Runtime 卻出了問題(套件可能需要 .net4.5 CLR application pool，但程式是 .net 6 等等)，這時候 Serilog 等套件也無法觀察到此現象時，就可以到 .NET EventLog 查看站台強制關閉等事件。 

## Application Pool機制

而以下圖片顯示的站台關閉事件是 IIS (Internet Information Services) 警告訊息，表示應用程式池 (Application Pool) 內的工作程序 (worker process) 已經因為閒置時間過長而被關閉。

![站台關閉事件](https://i.imgur.com/pbo8NBV.png)

IIS 預設情況下會將應用程式池的閒置超時時間設置為 20 分鐘。如果工作程序在這段時間內沒有處理任何請求，就會被 IIS 自動關閉，以節省系統資源。

在這種情況下，IIS 會在需要時啟動一個新的工作程序，以便繼續處理新的請求。

如果你不希望應用程式池在閒置一段時間後被關閉，可以在 IIS 中調整應用程式池的閒置超時時間設定，或將其設置為 0，這樣工作程序就不會被自動關閉。

需要注意的是，如果你的應用程式在處理請求時需要較長的時間，例如處理大量資料或執行複雜的演算法，就需要調整應用程式池的配置，以避免在處理請求時被自動關閉。




在 IIS 中調整應用程式池的閒置超時時間設定，或將其設置為 0，可以按照以下步驟進行：

1. 開啟 IIS 管理員控制台，選擇應用程式池，右鍵點選需要調整的應用程式池，並選擇 "進階設定"。
![步驟1](https://i.imgur.com/SzmWmlK.png)

2. 找到 "進程模型" 區段，滾動到下面的 "閒置時間 (分鐘)" 設定項目。
![步驟2](https://i.imgur.com/lZKXdao.png)
3. 將閒置時間設定為所需的值，或者設定為 0，表示永遠不會自動關閉工作程序。

4. 按下 "確定" 按鈕，保存設定。

設定應用程式池的閒置超時時間後，應用程式池內的工作程序就不會因閒置超時而自動關閉。需要注意的是，設定的閒置時間長度應該根據你的應用程式所需的處理時間來決定，避免閒置時間過短或過長導致工作程序無法正常運作。

## Task Scheduler 工作排程器

除了將IIS設定調整以外，也可以在 Windows 內建的工作排程器，利用 Shut down 的 Event ID 成為重啟網頁的 Trigger，因為開啟網頁，也可以讓程式重啟。


1. 打開工作排程器

2. 點擊 Create Basic Task

![步驟2](https://i.imgur.com/4xt36ui.png)

3. 填寫工作描述

![步驟3](https://i.imgur.com/cYK8qjt.png)

4. 選擇 Event Trigger

![步驟4](https://i.imgur.com/rJcONAr.png)

5. 選擇 Event

![步驟5](https://i.imgur.com/14hEStj.png)

6. 選擇觸發時，需執行的步驟，這邊選擇執行程序

![步驟6](https://i.imgur.com/cnyGvo7.png)

7. 選擇要執行的程序，這邊選擇我自己寫的 Bat 檔 

![步驟7](https://i.imgur.com/vzCpuJj.png)

8. 完成!

## Reference
- [【茶包射手日記】IIS的29小時魔咒](https://blog.darkthread.net/blog/iis-app-pool-auto-recycle/)
