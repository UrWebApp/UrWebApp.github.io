---
title: Let you roughly understand Queue
date: 2023-06-07
category: Development
author: johch3n611u
tags:
  - .Net
  - RabbitMQ
---

![hello-world-example-routing](https://github.com/UrWebApp/UrWebApp.github.io/blob/main/img/rabmq.png?raw=true)

## Remote Procedure Call ( RPC ) Queue

Remote Procedure Call Queue is a queue used for handling Remote Procedure Calls (RPC) in distributed systems. In distributed systems, different applications may run on different hosts or containers and communicate with each other over the network. When one application needs to call a function or method in another application, the RPC mechanism is required.

It is usually used to pass RPC requests and responses between different applications. When an application needs to call a function in another application, it places the request in the RPC queue and then waits for the request to be processed. When the other application finishes processing the request, it puts the result back into the RPC queue, and ultimately the application that sent the request receives the result.

It is usually implemented based on some Message Queue systems, such as RabbitMQ, Apache Kafka, etc. These message queue systems provide reliable message delivery guarantees, ensuring that messages are delivered even if the application is offline or crashes.

## RabbitMQ

RabbitMQ is an open-source Message Queue system implemented in Erlang language, which can be used for handling message delivery and RPC communication in distributed systems. It is a highly reliable, scalable, and cross-platform message broker, supporting multiple message protocols, such as AMQP (Advanced Message Queuing Protocol), STOMP (Streaming Text Oriented Messaging Protocol), etc.

The basic architecture includes Producer, Consumer, Exchange, Queue, and Binding. The Producer sends messages to the Exchange, existing routing rules in Exchange route the messages to the corresponding Queue, and then the Consumer takes messages from the Queue for processing. The relationship between Exchange and Queue can be set through Binding.

RabbitMQ provides reliable message delivery guarantees and supports multiple message patterns, such as Point-to-Point, Publish/Subscribe, Work Queue, etc. It also provides a rich management interface and API, making it convenient for users to manage and monitor message queues.

Because RabbitMQ has high reliability, scalability, and cross-platform capability, it is widely used in distributed systems, microservice architectures, cloud computing, and other fields.

## Enqueue

Enqueue is an operation that adds an element to the rear of a queue data structure. In other words, it adds the element to the last position in the queue. The term "enqueue" is commonly used in computer science to describe the process of adding elements to a queue.

A queue is a commonly used data structure in computer science, typically used to implement algorithms that require First-In-First-Out (FIFO) processing order. In a queue, elements are added to the rear of the queue and removed from the front. This means the first element added to the queue is the first one to be removed.

The opposite operation of Enqueue is Dequeue, which is the operation of removing an element from the front of the queue. Enqueue and dequeue operations together allow us to implement queue data structures, which can be used in various algorithms and applications.

## C\# Implementation of Producer

> Program.cs

```C#
using RabbitMQ.Client;
using System;
using System.Text;

class Program
{
    static void Main(string[] args)
    {
        // Create RabbitMQ connection
        var factory = new ConnectionFactory() { HostName = "localhost" };
        using var connection = factory.CreateConnection();

        // Create RabbitMQ channel
        using var channel = connection.CreateModel();

        // Declare a queue named "demo-queue"
        channel.QueueDeclare(queue: "demo-queue",
                             durable: false,
                             exclusive: false,
                             autoDelete: false,
                             arguments: null);

        // Message to send
        string message = "Hello, RabbitMQ!";

        // Convert message to byte array
        var body = Encoding.UTF8.GetBytes(message);

        // Send message to the queue named "demo-queue"
        channel.BasicPublish(exchange: "",
                             routingKey: "demo-queue",
                             basicProperties: null,
                             body: body);

        Console.WriteLine($"Sent message: {message}");
    }
}
```

## C\# Implementation of Consumer

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
        // Create RabbitMQ connection
        var factory = new ConnectionFactory() { HostName = "localhost" };
        using var connection = factory.CreateConnection();

        // Create RabbitMQ channel
        using var channel = connection.CreateModel();

        // Declare a queue named "demo-queue"
        channel.QueueDeclare(queue: "demo-queue",
                             durable: false,
                             exclusive: false,
                             autoDelete: false,
                             arguments: null);

        // Create an event consumer
        var consumer = new EventingBasicConsumer(channel);

        // Set handler after receiving message
        consumer.Received += (model, ea) =>
        {
            // Get received message
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);

            Console.WriteLine($"Received message: {message}");
        };

        // Start consuming messages from the queue named "demo-queue"
        channel.BasicConsume(queue: "demo-queue",
                             autoAck: true,
                             consumer: consumer);

        Console.WriteLine("Press [enter] to exit.");
        Console.ReadLine();
    }
}
```

## Q&A:

1. Why declare the demo-queue sequence twice?

Because in RabbitMQ, both the sender and receiver need to declare the sequence in their programs so that they can send and receive messages. The two sequence declarations are the same, and `their settings must be the same`. If a `sequence does not exist`, then when we `send a message to this sequence, RabbitMQ will automatically create this sequence`.

2. If the tested RabbitMQ is hosted on a non-local machine, executing with the same queue name might cause conflict, and the consumer may not find it.

Need to restart mq server, or change the name to find it.

## Reference

[RabbitMQ Basic Introduction, Installation Tutorial](https://kucw.github.io/blog/2020/11/rabbitmq/)
