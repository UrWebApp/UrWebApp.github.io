---
title: Queue を大まかに理解させる
date: 2023-06-07
category: Development
author: johch3n611u
tags:
  - .Net
  - RabbitMQ
---

![hello-world-example-routing](https://github.com/UrWebApp/UrWebApp.github.io/blob/main/img/rabmq.png?raw=true)

## Remote Procedure Call ( RPC ) Queue

Remote Procedure Call Queue は、分散システムでリモートプロシージャコール（RPC）を処理するために使用されるキューです。分散システムでは、異なるアプリケーションが異なるホストまたはコンテナで実行され、ネットワークを介して互いに通信する場合があります。あるアプリケーションが別のアプリケーションの関数またはメソッドを呼び出す必要がある場合、RPC メカニズムが必要になります。

通常、異なるアプリケーション間で RPC リクエストとレスポンスを渡すために使用されます。アプリケーションが別のアプリケーションの関数を呼び出す必要がある場合、リクエストを RPC キューに入れ、リクエストが処理されるのを待ちます。別のアプリケーションがリクエストの処理を完了すると、結果を RPC キューに戻し、最終的にリクエストを送信したアプリケーションが結果を受け取ります。

通常、RabbitMQ、Apache Kafka などのメッセージキュー（Message Queue）システムに基づいて実装されます。これらのメッセージキューシステムは、信頼性の高いメッセージ配信保証を提供し、アプリケーションがオフラインまたはクラッシュした場合でもメッセージの配信を保証します。

## RabbitMQ

RabbitMQ は、Erlang 言語で実装されたオープンソースのメッセージキュー（Message Queue）システムであり、分散システムでメッセージ配信と RPC 通信を処理するために使用できます。これは、信頼性が高く、スケーラブルで、クロスプラットフォームなメッセージブローカーであり、AMQP（Advanced Message Queuing Protocol）、STOMP（Streaming Text Oriented Messaging Protocol）などの複数のメッセージプロトコルをサポートしています。

基本アーキテクチャには、プロデューサー（Producer）、コンシューマー（Consumer）、Exchange、Queue、Binding が含まれます。プロデューサーはメッセージを Exchange に送信し、Exchange は設定されたルーティングルールに従って対応する Queue にメッセージをルーティングし、コンシューマーは Queue からメッセージを取り出して処理します。Exchange と Queue の関係は Binding を介して設定できます。

RabbitMQ は信頼性の高いメッセージ配信保証を提供し、ポイントツーポイント（Point-to-Point）、パブリッシュ/サブスクライブ（Publish/Subscribe）、ワークキュー（Work Queue）などの複数のメッセージパターンをサポートしています。また、豊富な管理インターフェースと API を提供しており、ユーザーがメッセージキューを管理および監視するのに便利です。

RabbitMQ は高い信頼性、スケーラビリティ、クロスプラットフォーム性を備えているため、分散システム、マイクロサービスアーキテクチャ、クラウドコンピューティングなどの分野で広く使用されています。

## Enqueue

Enqueue は、キューデータ構造の末尾に要素を追加する操作です。言い換えれば、キューの最後の位置に要素を追加します。「enqueue」という用語は、通常、コンピュータサイエンスで、キューに要素を追加するプロセスを説明するために使用されます。

キューはコンピュータサイエンスで一般的に使用されるデータ構造であり、通常、先入れ先出し（FIFO）の処理順序を必要とするアルゴリズムを実装するために使用されます。キューでは、要素はキューの末尾に追加され、キューの先頭から削除されます。これは、キューに追加された最初の要素が最初に削除される要素であることを意味します。

Enqueue の逆の操作は Dequeue であり、キューの先頭から要素を削除する操作です。enqueue と dequeue の操作により、キューデータ構造を実装でき、さまざまなアルゴリズムやアプリケーションで使用できます。

## C\# プロデューサー（Producer）の実装

> Program.cs

```C#
using RabbitMQ.Client;
using System;
using System.Text;

class Program
{
    static void Main(string[] args)
    {
        // RabbitMQ 接続を作成
        var factory = new ConnectionFactory() { HostName = "localhost" };
        using var connection = factory.CreateConnection();

        // RabbitMQ チャンネルを作成
        using var channel = connection.CreateModel();

        // 「demo-queue」という名前のキューを宣言
        channel.QueueDeclare(queue: "demo-queue",
                             durable: false,
                             exclusive: false,
                             autoDelete: false,
                             arguments: null);

        // 送信するメッセージ
        string message = "Hello, RabbitMQ!";

        // メッセージを byte 配列に変換
        var body = Encoding.UTF8.GetBytes(message);

        // 「demo-queue」という名前のキューにメッセージを送信
        channel.BasicPublish(exchange: "",
                             routingKey: "demo-queue",
                             basicProperties: null,
                             body: body);

        Console.WriteLine($"Sent message: {message}");
    }
}
```

## C\# コンシューマー（Consumer）の実装

> SomeService => Receiver.cs

```C#
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Text;

class Receiver
{
    static void Main(string[] args)
    {
        // RabbitMQ 接続を作成
        var factory = new ConnectionFactory() { HostName = "localhost" };
        using var connection = factory.CreateConnection();

        // RabbitMQ チャンネルを作成
        using var channel = connection.CreateModel();

        // 「demo-queue」という名前のキューを宣言
        channel.QueueDeclare(queue: "demo-queue",
                             durable: false,
                             exclusive: false,
                             autoDelete: false,
                             arguments: null);

        // イベントコンシューマーを作成
        var consumer = new EventingBasicConsumer(channel);

        // メッセージを受信した後の処理ハンドラを設定
        consumer.Received += (model, ea) =>
        {
            // 受信したメッセージを取得
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);

            Console.WriteLine($"Received message: {message}");
        };

        // 「demo-queue」という名前のキューからのメッセージの受信を開始
        channel.BasicConsume(queue: "demo-queue",
                             autoAck: true,
                             consumer: consumer);

        Console.WriteLine("Press [enter] to exit.");
        Console.ReadLine();
    }
}
```

## Q&A：

1. なぜ demo-queue シーケンスを 2 回宣言するのですか？

RabbitMQ では、送信側と受信側の両方がプログラムでシーケンスを宣言して、メッセージを送信および受信できるようにする必要があるためです。2 つのシーケンス宣言は同じであり、`それらの設定は同じでなければなりません`。`シーケンスが存在しない`場合、このシーケンスに`メッセージを送信すると、RabbitMQ は自動的にこのシーケンスを作成します`。

2. テスト対象の RabbitMQ がローカルマシン以外の場所に構築されている場合、キュー名を実行すると重複する可能性があり、consume が見つからないことがあります

mq server を再起動するか、名前を変更しないと見つからない場合があります。

## 参照

[RabbitMQ 基本紹介、インストールチュートリアル](https://kucw.github.io/blog/2020/11/rabbitmq/)
