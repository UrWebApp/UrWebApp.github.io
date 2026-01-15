---
title: Solve Problem of Unable to Connect to Specified IP and Port
date: 2023-04-09 15:00
categories: Development
author: kai98k
tags:
  - Internet
---

When we thought IIS was all set, and the site could be successfully opened on the Server, and the web page could be viewed, but when connecting with external IP to view, we found out it was a daydream and everything was empty talk. At this time, we need to do some tests to find the problem. You can use these [Connection Test Tools](https://urwebapp.github.io/Web/Windows%20%E6%B8%AC%E8%A9%A6%E9%80%A3%E7%B7%9A%E5%B7%A5%E5%85%B7/) to help.

When it is found that there is really a connection problem, the problem should be solved through the following checks.

## Firewall Rules

For windows, you need to add new Inbound and Outbound rules in windows firewall, because not all ports are connectable by default, so setting must be done here.

1. Open firewall and click Inbound/Outbound Rules on the left

![Step 1](https://i.imgur.com/wu9lcih.png)

2. Click New Rule on the right

![Step 2](https://i.imgur.com/5uC54sa.png)

3. Click Port

![Step 3](https://i.imgur.com/jKF8YRr.png)

4. Enter specified Port, never open all Ports

![Step 4](https://i.imgur.com/c4Ls19Q.png)

5. Allow connection of this Port

![Step 5](https://i.imgur.com/XSmbvJd.png)

6. Choose network profile to apply the rule, which are the three options that often pop up when computer is setting up network connection.

![Step 6](https://i.imgur.com/ZkjUWvO.png)

7. Name and finish adding

![Step 7](https://i.imgur.com/Hafw0Et.png)

## Check SSL and URL Redirect/Rewrite

For windows, you can check on IIS whether it is set to require SSL to connect, or if there are URL rewrite rules, meaning that specified to connect to this IP address but redirected to another one.

![Check SSL and URL Redirect/Rewrite](https://i.imgur.com/gyC1NiT.png)

## Resource Monitor

When all above are fine, it is very likely that the port is occupied by other resources. At this time, open Resource Monitor to check.

![Resource Monitor](https://i.imgur.com/L7trrzd.png)

You can see ports currently used by resources. Check if there are duplicates, which is likely the cause of unable to connect.

![Ports used by resources](https://i.imgur.com/3y3PPiO.png)

## Reference

Me and Supervisor
