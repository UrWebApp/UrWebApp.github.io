---
title: 初心者の領域展開 - ドメイン駆動設計
date: 2023-01-29 15:00
category: Development
author: kai98k
authorsWords: デザインパターンに初めて触れたとき、本当に抽象的すぎて、基本的には何かの術式だと思いました。ビジネスの必要性を機に、初心者の術師の視点で、ドメイン駆動設計 (DDD) というこの高度な呪術をもう一度認識し直しました。
tags:
  - Architecture
  - C#
  - DDD
  - OOD/OOP
---

## ドメイン（Domain）について

開発前の作業では、開発者は通常、ビジネスノウハウ、つまりその領域の知識（ドメイン知識）を理解するためにかなりの時間を費やし、理解した後にビジネスロジックを含むコードに変換します。

しかし、私がプロジェクト開発を始めたばかりの頃のように、何も考えずにすべてのビジネスロジックを一緒に書いてしまうことがあります。まだマシな状況は階層化の概念があることですが、悪いと MVC のモデルにすべてを直接詰め込んでしまいます。![What's in the model?](https://i.imgur.com/ubO98GX.png)

時が経つにつれて、システムの巨大化は無秩序な構造を引き起こし、開発効率を低下させるだけでなく、機能を見つけるだけでどれくらいの時間がかかるかわからなくなり、A を変更すると結果として B も壊れてしまい、協力作業時にも問題が発生し、範囲を効果的に分割または定義できなくなります。

DDD の誕生は、このような問題を解決し、産業分野のビジネスロジックをコードに忠実に反映させるためのものです。さらに、それぞれのビジネスロジック（機能）が簡単に変更されないように保護し、優れた拡張性を持たせることもできます。![Services](https://i.imgur.com/UAHwGZB.png)

## DDD の統合

DDD の概念を提唱した著者 Eric Evans によると、DDD は 3 つの核心的なポイント（理解しやすいように以下は日本語訳を使用）に焦点を当てており、戦略的設計（Strategic Design）と戦術的設計（Tactical Design）に分かれています。

- 複雑な開発設計は **ドメインモデル** に基づく必要がある（戦術的設計）
- 開発を **コアドメイン** と **ドメインロジック** の中心に置く（戦術的設計）
- 開発者は **ドメインエキスパート** と協力してドメインモデルを設計し、ビジネス上の問題を解決する必要がある（戦略的設計）

### 複雑な開発設計はドメインモデルに基づく必要がある

DDD ではモデルの作成についてもいくつかの深い概念を定義しているため、データベースとオブジェクトの関連付けを確立するために DataBase First を使用することは比較的難しく、ほとんどの場合、**Code First** でデータベースとオブジェクトの関連付けを確立するために、以下のドメインモデルに依存します。

#### Entity（エンティティ）

一意の値を持つ識別可能なオブジェクト。プログラムでは、一意の値を通じてこのオブジェクトのライフサイクルを追跡できます。商品には長さ、幅、高さなどの多くの属性がありますが、生産ラインでほぼすべての商品が同じように見える場合は、商品の商品番号に頼って追跡するしかありません。この商品/オブジェクトがどこにあるかを気にしない場合は、Entity として作成されません。

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

通常、一意の値はコード内で生成されます。これにより、データベースに依存しないだけでなく、一意の値を生成するタイミングを把握し、フォーマットをより適切にカスタマイズできます。

#### Value Object（値オブジェクト）

オブジェクトが識別可能な特性を持つ必要がなく、属性値のみが必要な場合は、Value Object として作成できます。

Value Object は不変性を持ち、作成後に変更することはできません。通常は Entity の属性値クラスであり、概念的な全体性 (Conceptual Whole)、つまり完全性を持っています。

今、工場を設立したいと仮定します。この工場を設立するには住所が必要です。住所がない場合、この工場がどこにあるかわからないため、この工場は私たちにとって実際に建設されていないのと同じです。これは非常に抽象的で、少し哲学的ですらあります。

その不変の特性のため、変更が必要な場合は、直接新しいものを作成して置き換えることができます。

```csharp=
// イメージ、動作しません
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
factory.name = "ドメイン工場";
factory.address = new Address(5,"忠孝西路1号");
factory.changeAddress(new Address(5,"忠孝東路2号"));
```

#### Aggregate（集約）、Aggregate Root（集約ルート）

Aggregate も一意の識別子を持ち、そのライフサイクルを識別できます。簡単に言えば、Aggregate はオブジェクトのオブジェクトです。その内部のオブジェクトは外部と直接通信できません。すべてのアクセスは、この Aggregate Root、オブジェクトのルートを介して行う必要があります。そして、その設計方法はドメイン内のノウハウに基づいて行われます。たとえば、Aggregate を車として設定する場合、中にはタイヤ、ハンドル、車載チップなどが含まれる可能性があります。タイヤは消耗品であり、捨てた後にどこに行ったかを知る必要はないので、値オブジェクトになるかもしれません。一方、車載チップはエンティティであり、盗まれたとしても、上の盗難防止番号に基づいてその位置を知るために警察に通報する必要があります。

```csharp=
// わかりやすい版 AggregateRoot
public class Car:AggregateRoot<Id>{
    public class Chip : Entity<Id>{
        // Todo: チップの属性
    }
    public class Tire : ValueObject{
        // Todo: タイヤの属性
    }
}
```

### 開発をコアドメインとドメインロジックの中心に置く

今日、あるシステムを開発する必要があるとします。このシステムには、注文などの機能、照会やカスタマーサービスなどのいくつかの補助機能、さらに決済ゲートウェイ接続などのサードパーティ機能が含まれる可能性があり、システムはこれらの機能に従って開発されます。

すべての機能を一緒に書くことはもうできないため、このときビジネスロジックに従ってドメインの分割を開始する必要があります。最も収益性の高いメイン機能がコアドメインになり、開発と保守に多くの時間を費やす可能性がありますが、メイン機能をサポートする他のサブ機能はサブドメインになります。この時点で、マイクロサービス（Microservices）の概念も少しあります。

もう少し細かく分けると、**Supporting Subdomain（支援サブドメイン）** と **Generic Subdomain（汎用サブドメイン）** があります。前述の補助機能は Supporting Subdomain になり、サードパーティ機能は Generic Subdomain に分類されます。これらのサードパーティ機能は、決済ゲートウェイ接続が複数あるなど、市場にすでに多くの成熟したソリューションが存在するため、選択して置き換えることができます。

#### Factories（ファクトリ）パターン

DDD のベストプラクティスでは、Aggregate とオブジェクトの複雑な作成プロセスをカプセル化するためにファクトリパターンを適用し、それらが互いに影響しないようにすることをお勧めします。Aggregate インターフェースを作成することで、同じノウハウを持つ Aggregate を実装します。自動車工場が異なるモデルの車を作るときにシャーシプラットフォームを共有する必要があると想像してください。このシャーシプラットフォームが私たちのインターフェースです。

```csharp=
public interface carChassis: AggregateRoot<Id>
{
    public string company { set; get; }
    public string name { set; get; }
    public string type { set; get; }
    public bool discontinued { set; get; }
}

// ドメイン知識に基づいて属性を拡張
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

#### Repository（リポジトリ）パターン

DDD でリポジトリパターンを実践するには、Aggregate と組み合わせて、その Aggregate Root からのみ各 Entity と Value object にアクセスできるグローバルインターフェースを実現する必要があります。それだけでなく、その詳細をカプセル化し、その範囲を設定する必要もあります。

リポジトリの設定

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
    // Todo リポジトリ共通メソッド
}
```

リポジトリの使用

```csharp=
 public class CarService : IService, ICarService
    {
        private readonly ICarRepository<Car, Id> _carRepository;
        public CarService(ICarRepository<Car, Id> carRepository)
        {
            _carRepository = carRepository;
        }
        // TODO: メソッドの実装
    }
```

#### Service

DDD にも階層化設計パターンが適用されています。DDD の Service 層は、Entity、Value Object とは関係のないビジネスロジックを専門に扱います。

### 開発者はドメインエキスパートと協力してドメインモデルを設計し、ビジネス上の問題を解決する必要がある

DDD では、開発における設計以外に、開発前のチーム内の非開発者と開発者の間のコミュニケーションと交流も強調しており、これらの交流を通じて生み出されたビジネスロジックの合意に基づいて開発を行います。チームは、コミュニケーションと交流を支援するために次の点を使用します。

#### Ubiquitous Language（ユビキタス言語）

> "We have really everything in common with America
> nowadays except, of course, language" - Oscar Wilde （私たちはアメリカとあらゆる点で共通していますが、もちろん言語を除いては）

非開発者が開発者とコミュニケーションをとるとき、相手が蛇語（パーセルタング）を話していると思うことがよくあります。その理由は、双方が交換しているものについて合意の基礎がなく、それぞれの理解に曖昧さが存在するためです。したがって、双方が合意できる語彙と言語を採用する必要があります。これが **Ubiquitous Language（ユビキタス言語）** です。

通常、Ubiquitous Language には次の特徴があります：

- **正確な語彙**：コミュニケーションの中で（_たくさんの、たぶんなど_）をよく耳にします。このような曖昧な言葉は、双方の認識の違いを引き起こします。このとき、プログラムは与えられた確率に従ってのみ実行でき、Yes と No しかないことを非開発者に教育する必要があります。さらに、事務を記述する必要がある場合は、可能な限り完全に記述するようにします。今日、車が必要だと言ったとき、相手はトラックのことを言っているかもしれませんが、私たちは乗用車として理解しているかもしれません。
- **混同しにくい**：貿易業界では、非開発者が DN と言っているのをよく耳にしますが、実際に使用される DN には Delivery Note、Debit Note、Document/Notice などがあります。開発者がそれを聞いたとき、どれのことかわからないことがよくあります。この場合は、直接フルネームを使用して説明する必要があります。
- **システムビジネスロジックを備えている**：双方のコミュニケーション後に生成された Ubiquitous Language は、変数名やシステム内の命名（ShippmentOrder など）に採用できます。そうでない場合は、資格がない可能性があります。

#### Bounded Context（境界づけられたコンテキスト）

大きなパイをいくつかの部分に分割する概念です。前述のように、システムをいくつかの機能モジュールに分割する概念ですが、ここでは Ubiquitous Language と組み合わせて、まず非開発者と話し合い、青写真を設計してから、図に従って構築します。

> 今日、あるシステムを開発する必要があるとします。このシステムには、注文などの機能、照会やカスタマーサービスなどのいくつかの補助機能、さらに決済ゲートウェイ接続などのサードパーティ機能が含まれる可能性があり、システムはこれらの機能に従って開発されます。

チームで Bounded Context を定義することは、実際には Domain をマイクロサービスに 1 つずつ切り取ることなので、境界の定義は明確にし、互いに汚染されないようにするのが最善であり、責任の境界線を明確にすることができます。この時点で、ドメインエキスパートの介入も非常に重要です。ドメインエキスパートは、どの Bounded Context が本当の Core Domain であるかを分析する必要があります。この手順を行わないと、無関係な機能の開発に時間を浪費するだけでなく、ビジネス「チャンス」の損失につながる可能性さえあります。

ここでは、国の運営を比喩として使用します
![バブルチャート](https://i.imgur.com/q8bU0aT.png)

## まとめ

この記事では、DDD 設計パターンの長所と短所については分析しませんでした。なぜなら、著者にとって、何事にも最善の解決策はなく、トレードオフと選択があるだけだからです。したがって、自分のプロジェクトに基づいて DDD が適しているかどうかを判断する必要があります。DDD はビジネスとシステムの統合問題を解決することを目的としています。問題が非常に単純で十分に直感的であれば、過去を修正できるかもしれません。また、システムや製品のビジネスドメインが複雑で分割しにくく、技術的な適用も比較的複雑な場合は、DDD を使用した開発はあまり適していません。しかし、あまり落胆しないでください。結局のところ、それらはただのツールにすぎないので、別のものに変えればいいのです。

## Reference

- [Think in Domain-Driven Design シリーズ](https://ithelp.ithome.com.tw/users/20111997/ironman/2730)
- [DDD for Beginners](https://docs.google.com/viewerng/viewer?url=https://akrabat.com/wp-content/uploads/2017-01-11-CodeMash-DDD-for-beginners.pdf)
- [Domain-Driven Design: What is it and how do you use it](https://blog.airbrake.io/blog/software-design/domain-driven-design)s
