---
title: 讓你大概搞懂 Queue
date: 2023-06-07
categories: Dev Tech
author: johch3n611u
tags:
- .Net
- RabbitMQ
---

![hello-world-example-routing](https://github.com/UrWebApp/UrWebApp.github.io/blob/main/img/rabmq.png)

## Remote Procedure Call ( RPC ) Queue

Remote Procedure Call Queue 是一種在分散式系統中用於處理遠程過程調用（RPC）的佇列。在分散式系統中，不同的應用程序可能運行在不同的主機或容器中，透過網路互相通信。當一個應用程序需要調用另一個應用程序中的函數或方法時，就需要使用RPC機制。

通常用於在不同的應用程序之間傳遞 RPC 請求和回應。當應用程序需要調用另一個應用程序中的函數時，它將請求放入 RPC queue 中，然後等待該請求被處理。當另一個應用程序處理完該請求後，它將結果放回到 RPC queue 中，最終由發送請求的應用程序接收結果。

通常基於一些消息佇列（Message Queue）系統實現，例如 RabbitMQ、Apache Kafka 等。這些消息佇列系統提供了可靠的消息傳遞保證，確保即使在應用程序離線或崩潰的情況下也能保證消息傳遞。

## RabbitMQ

RabbitMQ 是一個開源的消息佇列（Message Queue）系統，使用Erlang語言實現，可以在分散式系統中用於處理消息傳遞和RPC通信。它是一個高度可靠、可擴展、跨平台的消息代理，支持多種消息協議，例如 AMQP（Advanced Message Queuing Protocol）、STOMP（Streaming Text Oriented Messaging Protocol）等。

基本架構包括生產者（Producer）、消費者（Consumer）、Exchange、Queue 和 Binding。生產者將消息發送到Exchange，Exchange根據設定的路由規則將消息路由到對應的Queue，然後消費者從 Queue 中取出消息進行處理。Exchange 和 Queue 之間的關係可以通過Binding進行設定。

RabbitMQ 提供了可靠的消息傳遞保證，支持多種消息模式，例如點對點（Point-to-Point）、發布/訂閱（Publish/Subscribe）、工作隊列（Work Queue）等。它還提供了豐富的管理界面和 API，方便用戶對消息佇列進行管理和監控。

由於 RabbitMQ 具有高度可靠性、可擴展性和跨平台性，因此被廣泛應用於分散式系統、微服務架構、雲計算等領域。

## Enqueue

Enqueue 是一個將元素添加到佇列資料結構尾端的操作。換句話說，它將元素添加到佇列中的最後一個位置。“enqueue”一詞通常用於計算機科學中，用於描述將元素添加到佇列的過程。

佇列是計算機科學中常用的資料結構，通常用於實現需要先進先出（FIFO）處理順序的演算法。在佇列中，元素添加到佇列的尾端，並從佇列的前端刪除。這意味著第一個添加到佇列的元素是第一個被刪除的元素。

Enqueue 的相反操作是 Dequeue，它是從佇列的前端刪除元素的操作。enqueue 和 dequeue 操作一起允許我們實現佇列資料結構，可在各種演算法和應用程序中使用。

## C\# 實作 Producer 生產者

> Program.cs

``` C#
using RabbitMQ.Client;
using System;
using System.Text;

class Program
{
    static void Main(string[] args)
    {
        // 建立 RabbitMQ 連線
        var factory = new ConnectionFactory() { HostName = "localhost" };
        using var connection = factory.CreateConnection();

        // 建立 RabbitMQ 頻道
        using var channel = connection.CreateModel();

        // 宣告一個名為「demo-queue」的佇列
        channel.QueueDeclare(queue: "demo-queue",
                             durable: false,
                             exclusive: false,
                             autoDelete: false,
                             arguments: null);

        // 要發送的訊息
        string message = "Hello, RabbitMQ!";

        // 將訊息轉換成 byte 陣列
        var body = Encoding.UTF8.GetBytes(message);

        // 發送訊息到名為「demo-queue」的佇列中
        channel.BasicPublish(exchange: "",
                             routingKey: "demo-queue",
                             basicProperties: null,
                             body: body);

        Console.WriteLine($"Sent message: {message}");
    }
}
```

## C\# 實作 Consumer 消費者

> SomeService => Receiver.cs

``` C#
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Text;

class Receiver
{
    static void Main(string[] args)
    {
        // 建立 RabbitMQ 連線
        var factory = new ConnectionFactory() { HostName = "localhost" };
        using var connection = factory.CreateConnection();

        // 建立 RabbitMQ 頻道
        using var channel = connection.CreateModel();

        // 宣告一個名為「demo-queue」的佇列
        channel.QueueDeclare(queue: "demo-queue",
                             durable: false,
                             exclusive: false,
                             autoDelete: false,
                             arguments: null);

        // 建立一個事件消費者
        var consumer = new EventingBasicConsumer(channel);

        // 設定接收到訊息後的處理程序
        consumer.Received += (model, ea) =>
        {
            // 取得接收到的訊息
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);

            Console.WriteLine($"Received message: {message}");
        };

        // 開始接收來自名為「demo-queue」的佇列的訊息
        channel.BasicConsume(queue: "demo-queue",
                             autoAck: true,
                             consumer: consumer);

        Console.WriteLine("Press [enter] to exit.");
        Console.ReadLine();
    }
}
```

## Q&A：

1. 為何要宣告兩次 demo-queue 序列？

因為在 RabbitMQ 中，發送者和接收者都需要在他們的程式中宣告序列，以便能夠發送和接收訊息，兩個序列宣告是相同的，且`它們的設置必須是相同的`。如果一個`序列不存在`，那麼當我們向這個序列`發送訊息時，RabbitMQ 會自動創建這個序列`。


2. 如果測試的 RabbitMQ 是架設在非本機，執行 queue 名稱可能會重複，造成 consume 收尋不到

需要 mq server 重啟，或換名稱才能撈到

## 參考

[RabbitMQ 基本介紹、安裝教學](https://kucw.github.io/blog/2020/11/rabbitmq/)