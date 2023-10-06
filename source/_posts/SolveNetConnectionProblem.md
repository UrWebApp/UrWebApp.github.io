---
title: 解決連不到指定IP與Port問題
date: 2023-04-09 15:00 
categories: Dev Tech
author: kai98k
tags:
- Internet
---
當我們以為IIS一切都設定好了，在 Server 可以成功開啟站台，查看網頁的時候，用外部 IP 要連線查看時，才發現大夢初醒，一切都是空談，這時候就要做一些測試來找到問題，可以透過這些 [測試連線工具](https://urwebapp.github.io/Web/Windows%20%E6%B8%AC%E8%A9%A6%E9%80%A3%E7%B7%9A%E5%B7%A5%E5%85%B7/) 來幫忙。

當發現連線真的有問題的時候，就要透過下列檢查來解決問題。

## 防火牆規則
以 windows 來說，就要在 windows firewall 中添加 Inbound、Outbound 的新規則，因為並不是所有的 port 預設就是可以被連接的，所以要在這邊做設定。

1. 打開 firewall 點到左側 Inbound/Outbound Rules

![步驟1](https://i.imgur.com/wu9lcih.png)

2. 點選右側新增規則

![步驟2](https://i.imgur.com/5uC54sa.png)

3. 點選 Port 

![步驟3](https://i.imgur.com/jKF8YRr.png)

4. 輸入指定 Port，千萬不要打開所有的 Port

![步驟4](https://i.imgur.com/c4Ls19Q.png)

5. 允許該 Port 的連接

![步驟5](https://i.imgur.com/XSmbvJd.png)

6. 選擇規則應用的網路場景，也就是常常電腦在設定網路連線時會跳出來的三個選項。

![步驟6](https://i.imgur.com/ZkjUWvO.png)

7. 取名並完成新增

![步驟7](https://i.imgur.com/Hafw0Et.png)


## 檢查 SSL 及 URL 重新導向/重寫

以 windows 來說，可以在 IIS 上查看是否有設定到一定需要 SSL 才能連線，或是有沒有 URL 重寫的規則，也就是明明指定要連這個 IP address 卻被導向到另外一個。

![檢查 SSL 及 URL 重新導向/重寫](https://i.imgur.com/gyC1NiT.png)

## 資源監視器 (Resource Monitor)

當以上都沒問題時，那很可能是該 port 被其他資源佔用了，此時就要打開資源監視器來查看。

![資源監視器](https://i.imgur.com/L7trrzd.png)

可以看到目前資源所使用到的 port，檢查看看是否有重複的，很可能就是造成無法連線的原因。

![資源所使用到的 port](https://i.imgur.com/3y3PPiO.png)


## Reference

我和主管