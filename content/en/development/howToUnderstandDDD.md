---
title: Beginner's Domain Expansion - Domain-Driven Design
date: 2023-01-29 15:00
category: Development
author: kai98k
authorsWords: When first encountering design patterns, I really felt it was very abstract, basically some kind of spell technique. Taking the opportunity of business needs, I re-acquainted myself with Domain-Driven Design (DDD), this high-level curse technique, from the perspective of a novice sorcerer again.
tags:
  - Architecture
  - C#
  - DDD
  - OOD/OOP
---

## About Domain

In pre-development work, developers usually spend a large part of time understanding business Know-how, which is Domain knowledge, and after understanding, convert it into code with business logic.

But like when I first started project development, I would write all business logic together without thinking. Better situation is having concept of layering, worse is stuffing everything directly into Model of MVC. ![What's in the model?](https://i.imgur.com/ubO98GX.png)

Over time, hugeness of system will cause disorganized structure, not only reducing development efficiency, just finding a function takes unknown time, when changing A, result B is also broken, and will also cause problems during cooperation, unable to effectively split or define scope.

The birth of DDD is to solve this kind of problem, allowing business logic of industry domain to be faithfully reflected in code. Besides, it can also protect respective business logic (function) from being easily changed, and even allow good extensibility. ![Services](https://i.imgur.com/UAHwGZB.png)

## Integration of DDD

According to Eric Evans, author who proposed DDD concept, DDD focuses on three core points (using Chinglish below for better understanding), and is divided into Strategic Design and Tactical Design:

- Complex development design needs to be based on **domain models** (Tactical Design)
- Let development revolve around **core domain** and **domain logic** (Tactical Design)
- Developers need to cooperate with **domain experts** to design domain models to solve business problems (Strategic Design)

### Complex development design needs to be based on domain models

DDD also defines some deeper concepts for creating models, so it is relatively unable to use Database First to establish database and object association, almost relying on following domain models to establish database and object association via **Code First**.

#### Entity

Identifiable object with unique value. In program we can track lifecycle of this object through unique value. Like a product has many attributes such as length, width, height etc., but if on production line almost every product looks same, we can only rely on product number on product to track. If we don't care where this product/object is, it won't be created as Entity.

```csharp=
public class Product : Entity<Id>
{
    public string Name { get; set; }
    public float Price { get; set; }
    public int Size { get; set; }
    protected Product(){}
    public Product(Id id):base(id){}
}
```

Unique values are usually generated in code, this move can not rely on database, and can also master timing of generating unique value, and better customize format.

#### Value Object

When object does not need to have identifiable characteristic, only needs attribute values, it can be created as Value Object.

Value Object has immutability, cannot be changed after creation, usually is an attribute value class of an Entity, and has a Conceptual Whole, actually talking about integrity.

Suppose now want to set up a factory, this factory must have an address to be established. If there is no address, we don't know where this factory is, then this factory is equal to not being actually built for us. This is very abstract, even a bit philosophical.

Because of its immutable characteristic, so when need to change it, simply create a new one to replace directly.

```csharp=
// Illustration, cannot work
public class Factory : Entity<Id>
{
    public string name { get; set; }
    public Address address { get; set; }
    public changeAddress(Address address){
        this.address = address;
    }
}
public class Address : ValueObject
{
    public Address(int cityId,string street){
        this.cityId = cityId;
        this.street = street;
    }
    public int cityId { get; set }
    public string street { get; set; }
}

var factory = new Factory();
factory.name = "Domain Factory";
factory.address = new Address(5,"No. 1, Zhongxiao West Road");
factory.changeAddress(new Address(5,"No. 2, Zhongxiao East Road"));
```

#### Aggregate, Aggregate Root

Aggregate also has unique identifier, can identify its lifecycle. In short, Aggregate is object of objects. Its internal objects cannot communicate directly with outside. Any access must go through this Aggregate Root, the root of object. And its design method will be done based on Know-how in Domain. For example, setting Aggregate as a car, inside might be tires and steering wheel, car chip etc. And tire is consumable, no need to know where it went after being thrown away, might be value object. And car chip will be entity, even if stolen, we also want to report to police to know its location according to anti-theft number on it.

```csharp=
// Easy to understand version AggregateRoot
public class Car:AggregateRoot<Id>{
    public class Chip : Entity<Id>{
        // Todo: Chip attributes
    }
    public class Tire : ValueObject{
        // Todo: Tire attributes
    }
}
```

### Let development revolve around core domain and domain logic

Suppose today need to develop a system, this system might have functions like ordering, plus a few auxiliary functions like inquiry, customer service, plus a third-party function like payment gateway connection, and system will be developed according to these functions.

Because cannot write all functions together anymore, at this time need to start splitting Domain according to business logic. The most profitable main function will be Core Domain, possibly spending more time to develop and maintain, while other sub-functions supporting main function are Subdomain. At this time there is also a bit of Microservices concept.

If split finer, there will be **Supporting Subdomain** and **Generic Subdomain**. Mentioned auxiliary functions will be Supporting Subdomain, and third-party functions will be classified into Generic Subdomain. These third-party functions are mostly mature solutions already existing in market, like payment gateway connection has more than one, can select and replace.

#### Factories Pattern

In DDD best practices, it is recommended to apply factory pattern to encapsulate complex creation process of Aggregate and objects, ensuring they do not affect each other. Implement Aggregate with same know-how through creating an Aggregate interface. Imagine a car factory needs to share a chassis platform when making different models of cars, and this chassis platform is our interface.

```csharp=
public interface carChassis: AggregateRoot<Id>
{
    public string company { set; get; }
    public string name { set; get; }
    public string type { set; get; }
    public bool discontinued { set; get; }
}

// Expand attributes according to domain knowledge
public class VWAG02 : carChassis
{
    public bool hasRline { set; get; }
}
public class PAG03 : carChassis
{
    public bool hasGT { set; get; }
    public bool hasConvertible { set; get; }
}
```

#### Repository Pattern

Practicing repository pattern in DDD needs to combine with Aggregate, to achieve a global interface that can only access Entities and Value objects from its Aggregate Root. Not only that, also need to encapsulate its details, and set its scope.

Set Repository

```csharp=
// Aggregate Root
public class Car : AggregateRoot<Id>
{
    //...
}
// Respository Interface
public interface ICarRepository : IRepository<Car,Id>
{
    List<T> GetList();
    // Todo Repository common methods
}
```

Use Repository

```csharp=
 public class CarService : IService, ICarService
    {
        private readonly ICarRepository<Car, Id> _carRepository;
        public CarService(ICarRepository<Car, Id> carRepository)
        {
            _carRepository = carRepository;
        }
        // TODO: Implement method
    }
```

#### Service

DDD also applies layered design pattern. Service layer of DDD specifically deals with business logic unrelated to Entity, Value Object.

### Developers need to cooperate with domain experts to design domain models to solve business problems

Besides design in development, DDD also emphasizes communication and exchange between non-developers and developers in team before development, and develop based on consensus on business logic generated through these exchanges. And team will use following points to help communication and exchange.

#### Ubiquitous Language

> "We have really everything in common with America
> nowadays except, of course, language" - Oscar Wilde

When non-developers communicate with developers, mostly will think other party is speaking Parseltongue. The reason is that both parties have no consensus basis on what they are exchanging, each has ambiguity in understanding, so need to adopt vocabulary and language that both parties can have consensus on, this is **Ubiquitous Language**.

Usually Ubiquitous Language has following characteristics:

- **Precise vocabulary**: Often hear (_many, maybe, etc._) in communication. Such ambiguous words will cause cognitive difference between both parties. At this time should need to educate non-developers that program can only execute according to given probability, and only yes and no. Besides, if need to describe matters, also try to describe completely. Today maybe need a car, other party might be saying truck, but we understand as passenger car.
- **Not easily confused**: In trading industry, often hear non-developers saying DN here and there, but in practice DN used actually has Delivery Note, Debit Note, Document/Notice etc. When developers hear it, often don't know which one it is. At this time should use full name directly to explain.
- **With system business logic**: Ubiquitous Language produced after communication between both parties can be adopted in variable naming or naming in system, like ShippmentOrder. If not, maybe not qualified.

#### Bounded Context

Concept of dividing a big pie into several portions. Like mentioned above, concept of splitting a system into several function modules. But here is combined with Ubiquitous Language, discuss with non-developers first, design blueprint first, then build according to diagram.

> Suppose today need to develop a system, this system might have functions like ordering, plus a few auxiliary functions like inquiry, customer service, plus a third-party function like payment gateway connection, and system will be developed according to these functions.

Defining Bounded Context in team is actually cutting Domain into microservices one by one, so definition of boundaries is best to be clear and not pollute each other, can draw clear line of responsibility. At this time, intervention of domain experts is also very important. Domain experts must analyze which Bounded Context is the real Core Domain. If this move is not done, not only waste time developing irrelevant functions, but even cause loss of business "opportunity".

Here use operation of country as metaphor
![Bubble Chart](https://i.imgur.com/q8bU0aT.png)

## Summary

This article did not analyze pros and cons of DDD design pattern, because for author, there is no best solution for anything, only trade-offs and choices. So have to decide whether DDD is suitable based on your own project. DDD aims to solve integration problem of business and system. When problem is very simple and intuitive enough, might correct past. In addition, when business domain of system or product is complex and hard to divide, and relatively complex in technical application, it is also not quite suitable to use DDD for development. But don't be too discouraged, after all they are just tools, just change to another one.

## Reference

- [Think in Domain-Driven Design Series](https://ithelp.ithome.com.tw/users/20111997/ironman/2730)
- [DDD for Beginners](https://docs.google.com/viewerng/viewer?url=https://akrabat.com/wp-content/uploads/2017-01-11-CodeMash-DDD-for-beginners.pdf)
- [Domain-Driven Design: What is it and how do you use it](https://blog.airbrake.io/blog/software-design/domain-driven-design)s
