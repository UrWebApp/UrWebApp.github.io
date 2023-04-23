---
title: Windows 測試連線工具
date: 2023-03-03 18:30:00
categories: Web
author: kai98k
tags:
- Internet
---

靠這幾個工具，非本科工程師也可以了解基礎 TCP/IP，更好的知道網路是哪裡出問題，再將問題回報給網管....或是自己處理(?)

## ping

Ping 可以說是最基礎的指令，但如果要深層判斷網路及各種外來主機的狀態，也可以變得很複雜，先講最簡單的用法，詳細可參見[IBM 說明文件](https://www.ibm.com/docs/zh-tw/aix/7.3?topic=p-ping-command#ping__row-d3e81277)。

1. 打開命令提示字元(CMD)

![](https://i.imgur.com/KmlnDSO.png)


2. `ping [IP address/Host name]`，可以看到如果是 ping Host name，會傳封包至該 IP，並計算來回時間，其實就是在算遊戲中常常聽到的 ping 值。

![](https://i.imgur.com/eEvXMyF.png)


## telnet 

參見[群暉 說明文件](https://kb.synology.com/zh-tw/DSM/tutorial/Whether_TCP_port_is_open_or_closed)，當連線問題有可能是以下情境時，
- 連接埠(port)轉送規則未正確設定。
- 外部 IP 位址設為私人 IP 位址。
- 網路連線被防火牆規則封鎖。
- 服務未正常運作。

就可以使用 `telnet` 來測試。

1. 在 windows 上需先至`開啟或關閉Windows功能`，開啟 telnet 服務
![](https://i.imgur.com/gQ1dQLz.png)
2. 將 telnet 用戶端勾選
![](https://i.imgur.com/By12ZLH.png)
3. 使用 cmd 輸入 `telnet [ IP 位址或主機名稱] [port]`

如果失敗會回傳下圖
![](https://i.imgur.com/SUPvDc2.png)

如果成功會直接跳轉空白

## tracert 

[微軟官方文件中說道](https://support.microsoft.com/zh-tw/topic/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-tracert-%E7%96%91%E9%9B%A3%E6%8E%92%E8%A7%A3-windows-%E4%B8%AD%E7%9A%84-tcp-ip-%E5%95%8F%E9%A1%8C-e643d72b-2f4f-cdd6-09a0-fd2989c7ca8e)
>TRACERT 診斷公用程式會傳送「網際網路控制訊息通訊協定」(ICMP) 回應封包給目的地，以確定到目的地所經的路徑。 在這些封包中，TRACERT 會使用各種不同的 IP 存留時間 (Time-To-Live，TTL) 值。 因為路徑上的每台路由器在轉送封包之前必須至少將封包的 TTL 遞減 1，所以 TTL 其實就是一個躍點計數器。 當封包的 TTL 達到零 (0) 時，路由器會將 ICMP「超過時間」訊息傳回給來源電腦。

也太難懂... 但其實就是將封包傳送到指定 address，來解析路途中會經過的點及資訊，對於有多條路徑可以通到同一點的大型網路，或是涉及許多中介元件 (路由器或橋接器) 的大型網路，TRACERT 是很有用的疑難排解工具。

用法也是在 cmd 下指令`tracert [IP address/hostname]`

![tracert](https://i.imgur.com/8dVwArb.png)

## Test-NetConnection

Test-NetConnection 跟 telnet 有點像，但會獲得更多資訊，且成功時，資訊不會被刷新，但這次是在 **windows powerShell** 下指令。

![](https://i.imgur.com/EcLrSyD.png)


## Reference

- [Windows 測試 TCP 連線，比 Telnet 更好的方法](https://blog.darkthread.net/blog/ps-test-netconnection/)
- [如何使用 TRACERT 疑難排解 Windows 中的 TCP/IP 問題](https://support.microsoft.com/zh-tw/topic/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-tracert-%E7%96%91%E9%9B%A3%E6%8E%92%E8%A7%A3-windows-%E4%B8%AD%E7%9A%84-tcp-ip-%E5%95%8F%E9%A1%8C-e643d72b-2f4f-cdd6-09a0-fd2989c7ca8e)
- [如何確定 TCP 連接埠為開啟或關閉？](https://kb.synology.com/zh-tw/DSM/tutorial/Whether_TCP_port_is_open_or_closed)