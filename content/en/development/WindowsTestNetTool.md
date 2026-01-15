---
title: Windows Connection Test Tools
date: 2023-03-03 18:30:00
categories: Development
author: kai98k
tags:
  - Internet
---

Relying on these tools, non-major engineers can also understand basic TCP/IP, better know where the network problem is, and then report the problem to network administrator... or handle it yourself (?)

## ping

Ping can be said to be the most basic command, but if you want to deeply judge status of network and various external hosts, it can also become very complicated. First talk about simplest usage, for details please refer to [IBM Documentation](https://www.ibm.com/docs/zh-tw/aix/7.3?topic=p-ping-command#ping__row-d3e81277).

1. Open Command Prompt (CMD)

![Step 1](https://i.imgur.com/KmlnDSO.png)

2. `ping [IP address/Host name]`, can see if ping Host name, it will send packet to that IP, and calculate round trip time, which is actually calculating the ping value often heard in games.

![Step 2](https://i.imgur.com/eEvXMyF.png)

## telnet

Refer to [Synology Documentation](https://kb.synology.com/zh-tw/DSM/tutorial/Whether_TCP_port_is_open_or_closed), when connection problem might be following scenarios:

- Port forwarding rules not correctly set.
- External IP address set as private IP address.
- Network connection blocked by firewall rules.
- Service not protecting properly.

You can use `telnet` to test.

1. On windows need to go to `Turn Windows features on or off` first, turn on telnet service
   ![Step 1](https://i.imgur.com/gQ1dQLz.png)
2. Check telnet client
   ![Step 2](https://i.imgur.com/By12ZLH.png)
3. Use cmd to enter `telnet [ IP address or host name] [port]`

If failed will return image below
![Step 3](https://i.imgur.com/SUPvDc2.png)

If successful will jump directly to blank

## tracert

[Microsoft Official Documentation says](https://support.microsoft.com/zh-tw/topic/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-tracert-%E7%96%91%E9%9B%A3%E6%8E%92%E8%A7%A3-windows-%E4%B8%AD%E7%9A%84-tcp-ip-%E5%95%8F%E9%A1%8C-e643d72b-2f4f-cdd6-09a0-fd2989c7ca8e)

> TRACERT diagnostic utility determines the route taken to a destination by sending Internet Control Message Protocol (ICMP) echo packets to the destination. In these packets, TRACERT uses varying IP Time-To-Live (TTL) values. Because each router along the path is required to decrement packet's TTL by at least 1 before forwarding the packet, the TTL is effectively a hop counter. When packet's TTL reaches zero (0), the router sends an ICMP "Time Exceeded" message back to source computer.

Too hard to understand... But actually it is sending packet to specific address, to resolve points and info passed through on the way. For large networks where multiple paths can lead to same point, or involving many intermediate components (routers or bridges), TRACERT is a very useful troubleshooting tool.

Usage is also entering command `tracert [IP address/hostname]` in cmd

![tracert](https://i.imgur.com/8dVwArb.png)

## Test-NetConnection

Test-NetConnection is similar to telnet, but will get more information, and when successful, info will not be refreshed. But this time command is entered in **windows powerShell**.

![Test-NetConnection](https://i.imgur.com/EcLrSyD.png)

## Reference

- [Windows Test TCP Connection, Better Method than Telnet](https://blog.darkthread.net/blog/ps-test-netconnection/)
- [How to use TRACERT to troubleshoot TCP/IP problems in Windows](https://support.microsoft.com/zh-tw/topic/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-tracert-%E7%96%91%E9%9B%A3%E6%8E%92%E8%A7%A3-windows-%E4%B8%AD%E7%9A%84-tcp-ip-%E5%95%8F%E9%A1%8C-e643d72b-2f4f-cdd6-09a0-fd2989c7ca8e)
- [How to determine if TCP port is open or closed?](https://kb.synology.com/zh-tw/DSM/tutorial/Whether_TCP_port_is_open_or_closed)
