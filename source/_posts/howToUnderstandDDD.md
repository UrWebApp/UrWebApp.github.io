---
title: 新手的領域展開-領域驅動設計
date: 2023-01-29 15:00
categories: Design Pattern
author: kai98k
tags:
- Architecture
- C#
- DDD
- OOD/OOP
---
剛接觸到設計模式的時候，真的覺得很抽象，根本就是甚麼術式吧，趁著業務需要，再次以新手術師的角度，重新認識一遍領域驅動設計(Domain-Driven Design,DDD)，這個高級咒術。

## 關於 Domain 
在開發前置作業中，開發者通常會有很大一部分的時間在理解業務 Know-how，也就是該領域的知識(Domain knowledge)，在了解之後，進而轉成有業務邏輯的程式碼。

但是像我在剛接觸專案開發的時候，就會一股腦的把所業務邏輯寫在一起，好一點的狀況是還有分層的概念，壞一點就是直接都塞在 MVC 的 Model 中。![What's in the model?](https://i.imgur.com/ubO98GX.png)

久而久之，系統的龐大會造成雜亂無章的結構，不僅會降低開發效率，光是找一個功能就不知道要找多久，改 A 時，結果 B 也壞掉了，也會在合作時產生問題，無法有效拆分或是定義範圍。

而 DDD 的誕生，就是為了解決這種問題，讓產業領域的業務邏輯可以忠實的映射在程式碼之中，除此之外，還可以保護各自的業務邏輯(功能)不會輕易被改動，甚至擁有良好的擴充性。![Services](https://i.imgur.com/UAHwGZB.png)

## DDD 的集成
根據提出 DDD 概念的作者 Eric Evans 所述，DDD 專注於核心三點(以下使用晶晶體較好理解)，且分為 Strategic Design 戰略設計與 Tactical Design戰術設計 :
* 複雜的開發設計需要基於 **domain models**(戰術設計)
* 讓開發圍繞在 **core domain** 和 **domain Logic**(戰術設計)
* 開發者需與**領域專家**合作設計 domain models，來解決業務問題(戰略設計)

### 複雜的開發設計需要基於 domain models
DDD 中對於建立 model 也定義了一些較深的概念，因此也較無法使用 DataBase First 來建立資料庫與物件關聯，幾乎是靠下列的 domain models 來做 **Code First** 建立資料庫與物件關聯。

#### Entity 實體
具有唯一值的可辨識物件，在程式中我們可以透過唯一值來追蹤此物件的生命週期，像是一個商品會有許多長寬高等等屬性，但如果在產線上幾乎每個商品都長一樣，我們就只能靠商品上的商品編號來做追蹤，如果不 care 這個商品/物件到底在哪，就不會建立成 Entity。
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
唯一值通常會在程式碼產生，此舉不僅可以不依賴資料庫，也可以掌握生產唯一值的時機，與更好客製化格式。
#### Value Object 值物件
如果不需要讓物件具有被辨識的特性時，只需要屬性值時，此時可以建立成 Value Object。

Value Object 具有不變性，在創建後就不能改變，通常會是一個 Entity 的屬性值類別，且會有一個概念整體性(Conceptual Whole)，其實講的就是完整性。

假設現在要設立一間工廠，這間工廠必須要有地址才可以建立，如果沒有地址的話，我們不知道這間工廠在哪，那這個工廠對於我們來說就等於沒有實際被建造出來，這很抽象，甚至有點哲學。

因為其不可變的特性，所以需要改變它的時候，可以直接再重新建立一個新的來做替換。
```csharp=
// 示意，無法運作
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
factory.name = "領域工廠";
factory.address = new Address(5,"忠孝西路1號");
factory.changeAddress(new Address(5,"忠孝東路2號"));
```
#### Aggregate(聚合)、Aggregate Root(聚合根)
Aggregate 也具有唯一標示，能辨識其生命週期，簡而言之 Aggregate 就是物件的物件，其內部的物件是無法直接跟外部溝通的，任何的存取都要透過這個 Aggregate Root，物件的根，而其設計的方法，會依據 Domain 中的 Know-how 來做，像是以 Aggregate 設為車子來說，裡面包的可能就是輪胎和方向盤、車用晶片等等，而輪胎是消耗品，不需要知道它丟了之後去了哪裡，可能會是值物件，而車用晶片就會是實體，就算是被偷了，我們也要報警根據上面的防盜編號去知道它的位置。
```csharp=
// 易懂版 AggregateRoot
public class Car:AggregateRoot<Id>{
    public class Chip : Entity<Id>{
        // Todo: 晶片的屬性
    }
    public class Tire : ValueObject{
        // Todo: 輪胎的屬性
    }
}
```
### 讓開發圍繞在 core domain 和 domain Logic
假設今天需要開發一個系統，這個系統可能會功能像是訂貨下單，加上幾個輔助功能像是查詢、客服，再加上一個第三方功能像是金流串接，而系統就會依造這些功能來做開發。

因為不能再將各個功能通通寫在一起，這時候就要依造業務邏輯開始拆分 Domain，最賺錢的主功能會是 Core Domain，可能要花較多的時間開發與維護，而其他支援主功能的子功能就是 Subdomain，此時也有點微服務(Microservices)的概念了。

再分細一點的話，會有 **Supporting Subdomain** 與 **Generic Subdomain**，上述輔助功能就會是 Supporting Subdomain，而第三方功能是會歸到 Generic Subdomain，這類第三方功能大致上是市場上已經有許多成熟方案，像是金流串接就不止一間，可選擇與替換。

#### Factories 工廠模式
DDD 的最佳實踐中，建議套用工廠模式來封裝 Aggregate 與物件的複雜建立過程，確保其不會互相影響，透過建立一個 Aggregate 的接口介面來實做同樣 know-how 的 Aggregate，想像一個車廠在做不同型號的車時都需要共用一個底盤平台，而這個底盤平台就是我們的介面。
```csharp=
public interface carChassis: AggregateRoot<Id>
{
    public string company { set; get; }
    public string name { set; get; }
    public string type { set; get; }
    public bool discontinued { set; get; }
}

// 根據領域知識擴充屬性
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
#### Respository 倉儲模式
在 DDD 中實踐倉儲模式需要結合 Aggregate，來達成一個只能從其 Aggregate Root 存取各 Entity 與 Value object 的全域接口介面，不僅如此，還要封裝其細節，與設定其範圍。

設定倉儲
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
    // Todo 倉儲通用方法
}
```
使用倉儲
```csharp=
 public class CarService : IService, ICarService
    {
        private readonly ICarRepository<Car, Id> _carRepository;
        public CarService(ICarRepository<Car, Id> carRepository)
        {
            _carRepository = carRepository;
        }
        // TODO: 實做方法
    }
```
#### Service
DDD 也有套用分層設計模式，DDD 的 Service 層專門在處理與 Entity、Value Object 無關的業務邏輯。
### 開發者需與領域專家合作設計 domain models，來解決業務問題
DDD 除了在開發上的設計以外，也強調開發前團隊中非開發人員與開發人員的溝通交流，且依造這些透過交流產生對業務邏輯的共識來開發，而團隊會用以下幾點來幫助溝通交流。
#### Ubiquitous Language  通用語言
>"We have really everything in common with America
nowadays except, of course, language" - Oscar Wilde

在非開發人員與開發人員溝通時，多半會認為對方在說著爬說語，原因就是出在兩方對於正在交流的東西，並沒有共識基礎，各自在理解上都存在歧義，所以就要採用兩方都能有共識的詞彙與語言，這就是**Ubiquitous Language**。

通常 Ubiquitous Language 會有以下幾點特色:
* **精準的詞彙**: 在交流中常會聽到(*很多、可能會等等*)，這類模稜兩可的詞彙，會造成雙方的認知差異，此時應該就需要教育非開發人員，程式只能造著給定的機率，與只有是和否來執行，除此之外，如需要描述事務時，也要盡量描述完整，今天也許需要一台車，對方說得可能是卡車，但我們理解得是小客車。
* **不容易混淆**: 在貿易業中，常會聽到非開發人員講 DN 來 DN 去的，但是實務上會用到的 DN，其實是有 Delivery Note、Debit Note、Document/Notice 等等，開發人員聽到時，常常會不知道是哪一個，此時就應該直接使用全名來做解釋。
* **具系統商業邏輯**: 雙方交流過後產生出的 Ubiquitous Language，可採納在變數命名或是系統中的命名，像是運輸單(ShippmentOrder)，如果不是，也許就不具資格。

#### Bounded Context 限界上下文
將一個大餅畫成好幾份的概念，有如上文中，將一個系統拆分成好幾個功能模組的概念，但這邊是結合 Ubiquitous Language，先與非開發人員討論，先將藍圖設計好，再造圖施工。
>假設今天需要開發一個系統，這個系統可能會功能像是訂貨下單，加上幾個輔助功能像是查詢、客服，再加上一個第三方功能像是金流串接，而系統就會依造這些功能來做開發。

在團隊定義 Bounded Context 其實就在切割 Domain 成為一個一個微服務了，所以在界線的定義最好是要保持明確且不相互汙染，可以讓責任劃清界線。此時，領域專家的介入也非常重要，領域專家必須分析哪個 Bounded Context 才是真正的 Core Domain，如無此舉的話，不僅僅是浪費了開發程式的時間在無關緊要的功能上，甚至會導致商機的錯失。

這邊利用國家的運作來比喻
![](https://i.imgur.com/q8bU0aT.png)

## Summary
本文並沒有分析 DDD 設計模式的優缺點，因為對於作者來說，任何事都沒有最佳解，只有取捨跟選擇而已，所以要憑自身的專案來決定使用 DDD 適不適合，DDD 旨在解決商業與系統的整合問題，當問題很簡單與足夠直覺時，可能會矯正過往。另外，當系統或產品的業務領域複雜不好分割，相對地在技術應用上也複雜時，也不太適用 DDD 來開發，不過這也不用過於灰心，畢竟都只是工具罷了，再換一種就好。

## Reference

* [Think in Domain-Driven Design 系列](https://ithelp.ithome.com.tw/users/20111997/ironman/2730)
* [DDD for Beginners](https://docs.google.com/viewerng/viewer?url=https://akrabat.com/wp-content/uploads/2017-01-11-CodeMash-DDD-for-beginners.pdf)
* [Domain-Driven Design: What is it and how do you use it](https://blog.airbrake.io/blog/software-design/domain-driven-design)s