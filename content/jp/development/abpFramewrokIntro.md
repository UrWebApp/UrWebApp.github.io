---
title: abp Framework - フレームワークのフレームワーク
date: 2023-02-09 22:11:07
category: Development
author: kai98k
tags:
  - .Net
  - Angular
---

## フレームワークの紹介

abp.io は ASP.NET Boilerplate Project の拡張バージョンです。両者は異なるフレームワークですが、共通点はどちらも DDD の概念を適用していることです。ここでは abp.io を (abp vNext) と略します。abp vNext は .Net Core に基づくオープンソースのマイクロサービスアーキテクチャで、UI ページは MVC(Razor)、Angular、Blazor をサポートし、基本的なインフラストラクチャ (Infra)、スタートアップテンプレート、再利用可能なアプリケーションモジュール、UI テーマ、DB の多様性などを提供し、開発者が開発時間を節約するのに役立つ豊富なドキュメントとコマンドも提供します。

## フレームワークの特徴

- マイクロサービス互換
  ![マイクロサービス](https://i.imgur.com/Zi3TfMc.png) 画像ソース: abp.io
- モジュラーアーキテクチャ：サービス層、アプリケーション層、データアクセス層などに限定されない、最新の階層型アーキテクチャ。
- DDD (ドメイン駆動設計) のベストプラクティス：エンティティ、集約ルート、ファクトリパターン、リポジトリパターンなどの DDD インフラストラクチャを含みますが、これらに限定されません。
- API ドキュメント、ログ処理などのシステムインフラストラクチャを内蔵。
- マルチテナント/Saas
  ![](https://i.imgur.com/QULZ5wD.png) 画像ソース: abp.io

## フレームワークの最低要件

- DDD の設計パターンと実践方法を理解している必要があります。
- データベースを作成する Code First の方法を理解している必要があります。

## ソリューションの初期化

> 今回の例は公式サイトのチュートリアルに従い、遭遇する可能性のある問題を解決して説明します。興味がある場合は、公式サイトのドキュメントに直接従ってクイックスタートし、問題がある場合は戻ってきて確認することができます。
>
> 公式サイトの [Get Started (開始)](https://abp.io/get-started) で、初期化インストールコマンドをすばやく生成し、バージョンなどの必要な[追加コマンド](https://docs.abp.io/zh-Hans/abp/6.0/CLI) を追加できます。この例では、多層アプリケーション、Angular、およびデフォルトのテーマを UI フレームワークとして使用し、データベースは SQL Server です。
> ![](https://i.imgur.com/Id0AYUa.png)

まず abp cli をインストールします

```=
dotnet tool install -g Volo.Abp.Cli
```

その後、abp cli を利用してプロジェクトを作成します

```=
abp new Acme.BookStore -u angular --pwa -v 6.0.0
```

ここで遭遇する可能性のある問題は、パッケージマネージャーのエラーである可能性があります。ターミナルで Yarn が不足していると表示された場合は、NPM の代わりに Yarn を追加インストールできます。そうしないと、Angular は依存パッケージを失い、フロントエンドで npm install を実行すると、次のエラーが表示されます。

`"npm install" unable to resolve dependency tree for angular/common (using ABP CLI default project)`

ただし、エラーがあるかどうかに関係なく、ターミナルの実行が完了すると、`angular`、`aspnet-core` の 2 つのフォルダが表示されます。

## バックエンドソリューションの実行

### エンティティの作成

開発を開始する前に、ドメイン駆動設計 (Domain-Driven Design, DDD) について予備知識を持っている必要があります。

abp vNext ドキュメントのチュートリアルに従い、まず Domain 層に Books フォルダを新規作成し、このフォルダに Book クラスを追加して、Book クラスにコードを追加します。

```csharp=
using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Kai.BookStore.Books
{
    public class Book : AuditedAggregateRoot<Guid>
    {
        public string Name { get; set; }

        public BookType Type { get; set; }

        public DateTime PublishDate { get; set; }

        public float Price { get; set; }
    }
}
```

集約ルート (AggregateRoot) は DDD の重要な概念です。これに慣れていない場合は、まず DDD を理解することをお勧めします。ここでの AuditedAggregateRoot は、abp フレームワークによって提供される、作成時間などの計算されたプロパティを持つ AggregateRoot クラスです。次に、チュートリアルに従って Domain.Shared 層に BookType 列挙型を追加します。

```csharp=
namespace Kai.BookStore.Books
{
    public enum BookType
    {
        Undefined,
        Adventure,
        Biography,
        Dystopia,
        Fantastic,
        Horror,
        Science,
        ScienceFiction,
        Poetry
    }
}

```

### データの作成

**前手順：
DbMigrator プロジェクトの `appsettings.json` 内のデフォルトの接続文字列をターゲットデータベースの接続文字列に変更する必要があります。**

エンティティを EntityFrameworkCore 層のプロジェクト DbContext に追加します。

```csharp=
//....
public class BookStoreDbContext :
    AbpDbContext<BookStoreDbContext>,
    IIdentityDbContext,
    ITenantManagementDbContext
{
    /* Add DbSet properties for your Aggregate Roots / Entities here. */
    public DbSet<Book> Books { get; set; }
    //...省略
}
```

次に DbContext クラスの一番下に移動し、データをテーブルにマッピングします。

```csharp=
 protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        /* Include modules to your migration db context */
        // ... builder...省略
        /* Configure your own tables/entities inside here */
        builder.Entity<Book>(b =>
        {
            b.ToTable(BookStoreConsts.DbTablePrefix + "Books", BookStoreConsts.DbSchema);
            b.ConfigureByConvention(); //auto configure for the base class props
            b.Property(x => x.Name).IsRequired().HasMaxLength(128);
            //...
        });
    }
```

チュートリアルに従って初期データをテーブルにフィードするかどうかを決定した後、データ移行 (Migration) の手順に進みます。ターミナルコマンドを入力するか、Nuget パッケージツールコマンドを使用します。

```=
dotnet ef migrations add Created_Book_Entity
```

次に、DbMigrator プロジェクトをスタートアッププロジェクトとして設定して実行します。実行時に次のエラーが発生する可能性があります。

`Microsoft.Data.SqlClient.SqlException: 'Invalid object name 'dbo.AppBooks'.`

このとき、EFCore 層で Migrations を初期化する必要があります。

```=
dotnet ef migrations add init
```

初期化が完了したら、もう一度エンティティを追加します。

```=
dotnet ef migrations add book
```

もう一度 DbMigrator プロジェクトを実行します。

### サービスの作成

Application.Contracts に BookDto クラスを作成し、次のコードを追加します。

```csharp=
using System;
using Volo.Abp.Application.Dtos;

namespace Kai.BookStore.Books;

public class BookDto : AuditedEntityDto<Guid>
{
    public string Name { get; set; }

    public BookType Type { get; set; }

    public DateTime PublishDate { get; set; }

    public float Price { get; set; }
}
```

BookDto ができたら、Book を作成および更新するために、Application.Contracts 層に CreateUpdateBookDto も作成する必要があります。

```csharp=
using System;
using System.ComponentModel.DataAnnotations;

namespace Kai.BookStore.Books;

public class CreateUpdateBookDto
{
    [Required]
    [StringLength(128)]
    public string Name { get; set; }

    [Required]
    public BookType Type { get; set; } = BookType.Undefined;

    [Required]
    [DataType(DataType.Date)]
    public DateTime PublishDate { get; set; } = DateTime.Now;

    [Required]
    public float Price { get; set; }
}
```

DTO を設定した後、DTO とエンティティをマッピングする必要があります。abp にはこれを処理する AutoMapper が組み込まれているため、Application 層の AutoMapperProfile で設定する必要があります。

```csharp=
using Kai.BookStore.Books;
using AutoMapper;

namespace Acme.BookStore;

public class BookStoreApplicationAutoMapperProfile : Profile
{
    public BookStoreApplicationAutoMapperProfile()
    {
        CreateMap<Book, BookDto>();
         CreateMap<CreateUpdateBookDto, Book>();
    }
}
```

これらを行った後、アプリケーション層のインターフェースを定義する必要があります。Application.Contracts に IBookAppService を作成します。

```csharp=
using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Kai.BookStore.Books;

public interface IBookAppService :
    ICrudAppService< //Defines CRUD methods
        BookDto, //Used to show books
        Guid, //Primary key of the book entity
        PagedAndSortedResultRequestDto, //Used for paging/sorting
        CreateUpdateBookDto> //Used to create/update a book
{

}

```

`ICrudAppService` は abp が提供する CRUD メソッドであり、`GetAsync`、`GetListAsync`、`CreateAsync`、`UpdateAsync`、`DeleteAsync` が組み込まれています。

インターフェースを定義した後、Application 層で BookAppService クラスを実装します。ここでは、汎用リポジトリパターンを使用してエンティティと通信します。

```csharp=
using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace Kai.BookStore.Books;

public class BookAppService :
    CrudAppService<
        Book, //The Book entity
        BookDto, //Used to show books
        Guid, //Primary key of the book entity
        PagedAndSortedResultRequestDto, //Used for paging/sorting
        CreateUpdateBookDto>, //Used to create/update a book
    IBookAppService //implement the IBookAppService
{
    public BookAppService(IRepository<Book, Guid> repository)
        : base(repository)
    {

    }
}

```

次に、チュートリアルに従って HttpApi.Host をスタートアッププロジェクトとして設定し、HttpApi.Host プロジェクトを実行して、Swagger API UI をポップアップさせることができます。
![swagger](https://i.imgur.com/3nQRJrS.png)

ブックリストを正常に取得できるかどうかをテストできます。

## クライアント Angular

### ローカリゼーション

Domain.Shared 層の Localization/BookStore で、各言語テンプレートの json を確認できます。まず en.json の内容を変更します。ここで注意すべき点は、abp vNext では、メニュー項目の前に `Menu:<Item>` プレフィックスを、列挙の前に `Enum:<Type>` プレフィックスを追加することを推奨していることです。

```json=
{
  "Culture": "en",
  "Texts": {
    "Menu:Home": "Home",
    "Menu:ContactUs": "Contact Us",
    "Menu:ArticleSample": "Article Sample",
    "Home": "Home",
    "Welcome": "Welcome",
    "LongWelcomeMessage": "Welcome to the application. This is a startup project based on the ABP framework. For more information visit abp.io.",
    "Date": "Date",
    "Permission:Dashboard": "Dashboard",
    "Menu:Dashboard": "Dashboard",
    "Menu:HomePage": "Home page",
    "Dashboard": "Dashboard",
    "ExternalProvider:Google": "Google",
    "ExternalProvider:Google:ClientId": "Client ID",
    "ExternalProvider:Google:ClientSecret": "Client Secret",
    "ExternalProvider:Microsoft": "Microsoft",
    "ExternalProvider:Microsoft:ClientId": "Client ID",
    "ExternalProvider:Microsoft:ClientSecret": "Client Secret",
    "ExternalProvider:Twitter": "Twitter",
    "ExternalProvider:Twitter:ConsumerKey": "Consumer Key",
    "ExternalProvider:Twitter:ConsumerSecret": "Consumer Secret",
    "NewsletterHeader": "Subscribe to the newsletter!",
    "NewsletterInfo": "Get information about the latest happenings.",
    "NewsletterPreference_Default": "Default Newsletter",
    "NewsletterPrivacyAcceptMessage": "I accept the <a href='/privacy-policy'>Privacy Policy</a>.",
    "ChangeLanguage": "Change language",
    "Menu:BookStore": "Book Store",
    "Menu:Books": "Books",
    "PublishDate": "Publish date",
    "NewBook": "New book",
    "Name": "Name",
    "Type": "Type",
    "Price": "Price",
    "CreationTime": "Creation time",
    "AreYouSureToDelete": "Are you sure you want to delete this item?",
    "Enum:BookType.0": "Undefined",
    "Enum:BookType.1": "Adventure",
    "Enum:BookType.2": "Biography",
    "Enum:BookType.3": "Dystopia",
    "Enum:BookType.4": "Fantastic",
    "Enum:BookType.5": "Horror",
    "Enum:BookType.6": "Science",
    "Enum:BookType.7": "Science fiction",
    "Enum:BookType.8": "Poetry"
  }
}
```

### 初期設定

ターミナルを使用して cd で Angular プロジェクトに移動し、コマンドを入力して Yarn で Npm パッケージをインストールします。

```Bash=
yarn
```

次に、コマンドを入力して yarn で BookModule を生成します。

```Bash=
yarn ng generate module book --module app --routing --route books
```

入力が完了すると、次の追加と更新が行われます。

```Bash=
CREATE src/app/book/book-routing.module.ts (335 bytes)
CREATE src/app/book/book.module.ts (343 bytes)
CREATE src/app/book/book.component.html (19 bytes)
CREATE src/app/book/book.component.spec.ts (585 bytes)
CREATE src/app/book/book.component.ts (195 bytes)
CREATE src/app/book/book.component.scss (0 bytes)
UPDATE src/app/app-routing.module.ts (2181 bytes)
```

正常に追加されたら、コマンドを使用してクライアントプロキシを生成します。これはバックエンドとの自動的な接続です。このとき、コマンドを入力する前に、バックエンドの HttpApi.Host プロジェクトを実行状態にしておく必要があります。

```Bash=
abp generate-proxy -t ng
```

上記のコマンドのコンパイルが完了すると、次の図のファイルリストが表示されるはずです。
![](https://i.imgur.com/9K3SXaM.png)
ここでエラーが報告されたり、ファイルが不足している場合は、abl cli を使用して npm パッケージを更新してみてください。

```=
abp update --npm
```

`package-lock.json` を削除してから、Yarn を使用して Npm パッケージを再度インストールし、クライアントプロキシを生成するコマンドを直接再入力します。それでも正常に生成されない場合は、abl cli を使用して再インストールすることをお勧めします。

すべて正常に生成できたら、`/src/app/book/book.component.ts` の次のコードを置き換えることができます。

```typescript=
import { ListService, PagedResultDto } from '@abp/ng.core';
import { Component, OnInit } from '@angular/core';
import { BookService, BookDto } from '@proxy/books';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss'],
  providers: [ListService],
})
export class BookComponent implements OnInit {
  book = { items: [], totalCount: 0 } as PagedResultDto<BookDto>;

  constructor(public readonly list: ListService, private bookService: BookService) {}

  ngOnInit() {
    const bookStreamCreator = (query) => this.bookService.getList(query);

    this.list.hookToQuery(bookStreamCreator).subscribe((response) => {
      this.book = response;
    });
  }
}
```

ここで `BookService`、`ListService` が注入されていることがわかります。
`ListService` は簡単なページング、クエリ、並べ替え機能を提供します。

BookComponent の機能を記述したら、今度は HTML を変更します。`/src/app/book/book.component.html` の内容を次のコードに置き換えます。

```typescript=
<div class="row entry-row">
  <div class="col-12 col-sm-auto">
    <h1 class="content-header-title">{{ '::Menu:Books' | abpLocalization }}</h1>
  </div>

  <div class="col-lg-auto pl-lg-0">
    <abp-breadcrumb></abp-breadcrumb>
  </div>

  <div class="col">
    <div class="text-lg-right pt-2"></div>
  </div>
</div>

<div class="card">
  <div class="card-body">
    <ngx-datatable [rows]="book.items" [count]="book.totalCount" [list]="list" default>
      <ngx-datatable-column [name]="'::Name' | abpLocalization" prop="name"></ngx-datatable-column>
      <ngx-datatable-column [name]="'::Type' | abpLocalization" prop="type">
        <ng-template let-row="row" ngx-datatable-cell-template>
          {{ '::Enum:BookType.' + row.type | abpLocalization }}
        </ng-template>
      </ngx-datatable-column>
      <ngx-datatable-column [name]="'::PublishDate' | abpLocalization" prop="publishDate">
        <ng-template let-row="row" ngx-datatable-cell-template>
          {{ row.publishDate | date }}
        </ng-template>
      </ngx-datatable-column>
      <ngx-datatable-column [name]="'::Price' | abpLocalization" prop="price">
        <ng-template let-row="row" ngx-datatable-cell-template>
          {{ row.price | currency }}
        </ng-template>
      </ngx-datatable-column>
    </ngx-datatable>
  </div>
</div>

```

最後に、コマンド `npm run start` を使用してフロントエンドページを実行すると、ブックリスト画面が正常に表示されます。

![](https://i.imgur.com/DxP3Wsn.png)

正常に実行できない場合は、`package-lock.json` をもう一度削除し、コマンド `yarn` を入力してパッケージを再インストールしてから、もう一度実行してください。

## フロントエンドページのカスタマイズ

ドキュメントのテーマに移動すると、より詳細な手順とチュートリアルがありますが、残念ながら現在ここには中国語化 (ローカリゼーション) がないため、仲間の英語の基礎が試されます。ここでは簡単に説明します。

![](https://i.imgur.com/jShCXgN.png)

abp vNext はレイアウトのカスタマイズオプションを提供しますが、ここでは実際に abp vNext コンポーネントをカスタマイズするのではなく、自分で作成して置き換えます。ドキュメント内の説明を参照できます。

![](https://i.imgur.com/mFZ3sg9.png)

そのため、まず置き換えるコンポーネントのキー（コンポーネント名）を見つけて、`app.component.ts` で置き換える必要があります。

```typescript=
//...

@Component(/* component metadata */)
export class AppComponent {
  constructor(
    private replaceableComponents: ReplaceableComponentsService, // injected the service
  ) {
    this.replaceableComponents.add({
      component: YourNewApplicationLayoutComponent,
      key: eThemeLeptonXComponents.ApplicationLayout,
    });
  }
}
```

## まとめ

abp vNext フレームワークは、.Net Core と DDD 設計パターンの統合を最適化まで実装しており、ユーザーは DDD モードでマイクロサービスを開発する際に多くの時間を節約できます。残念ながら、全体があまりにも巨大であり、abp vNext はマイクロサービスを強調し、複数のアプリが 1 つのバックエンドを共有できるようにしているため、フロントエンドのバックエンドへの依存度が非常に高く、多くのフロントエンド設定と i18n はバックエンドエンドポイントを使用して取得する必要があります。ユーザーは、使用する前にドキュメントを詳細に読む必要があるだけでなく、自身のプロジェクトで本当にこのフレームワークを導入する必要があるかどうかも検討する必要があります。現在良いと感じている使用法は、ミドルおよびバックオフィス用のフロントエンドを自分で開発して abp vNext バックエンドを統合し、abp vNext に付属のフロントエンドをバックオフィスとして使用して、権限管理とテナント管理を行うことです。

## 今後の開発や使用があれば、また更新します

## Reference

- abp.io
- [ABP vNext を知る (1): オープニングプランと基礎知識](https://blog.51cto.com/u_12460661/3019374)
