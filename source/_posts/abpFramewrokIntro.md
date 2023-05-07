---
title: abp Framework 框架的框架
date: 2023-02-09 22:11:07
categories: Dev Tech
author: kai98k
tags:
- .Net
- Angular
---
## 框架簡介
abp.io 是 ASP.NET Boilerplate Project的擴展版本，兩者為不同框架，但共通點都是套用 DDD 概念，這邊會將 abp.io 簡稱(abp vNext)，abp vNext 是一套基於 .Net Core 的開源微服務架構，UI 頁面可支援 MVC(Razor)、Angular、Blazor，且提基本的基礎設施(Infra)、啟動模板、可複用的應用模組、UI 主題、DB 多樣性等等，以及有豐富的文檔及指令，幫助開發者節省開發時間。

## 框架特色
* 微服務相容
![微服務](https://i.imgur.com/Zi3TfMc.png)圖片來源: abp.io
* 模組化架構: 現代分層式架構，包含但不限於服務層、應用層、資料存取層等等。
* DDD (Domain-driven Design)的最佳實踐: 包含但不限於實體、聚合根、工廠模式、倉儲模式等等的 DDD 基礎設施。
* 內建 API 文件、Log 處理等等系統基礎設施。
* 多租戶/Saas
![](https://i.imgur.com/QULZ5wD.png)圖片來源: abp.io

## 框架最低要求
* 須了解 DDD 的設計模式，與實踐方式。
* 須了解 Code First 建立資料庫的方式。

## 方案初始化
>這次範例會照著官網教程走一遍，並解決與說明可能會碰到的問題，如有興趣可以先直接照著官網文件，快速入門，如有問題再回來觀看。
>
可在官網的[開始](https://abp.io/get-started)，來快速產生初始化安裝指令，並加上自己所需的[額外指令](https://docs.abp.io/zh-Hans/abp/6.0/CLI)，像是版本等等，這邊範例使用多層應用、Angular 與預設主題作為 UI 框架，資料庫為 SQL Server。
![](https://i.imgur.com/Id0AYUa.png)

先安裝 abp cli
```=
dotnet tool install -g Volo.Abp.Cli
```
之後利用 abp cli 建立專案
```=
abp new Acme.BookStore -u angular --pwa -v 6.0.0
```
這邊會遇到的問題，可能會是套件管理器上的錯誤，如在終端上看到缺少 Yarn 的話，可以再多安裝 Yarn 來取代 NPM，不然 Angular 會遺失依賴套件，在前端執行 npm install 時，會出現下列錯誤。

`"npm install" unable to resolve dependency tree for angular/common (using ABP CLI default project)`

但無論有沒有錯誤，終端跑完，會出現兩份資料夾，`angular`，`aspnet-core`。

## 後端方案運行
### 建立實體
在開始開發前，需先對領域驅動設計(Domain-Driven Design,DDD) 有初步認知。

照著 abp vNext 文件中的教程，首先在 Domain 層中新增 Books 資料夾，並在此資料夾新增 Book 類別，在 Book 類別中添加程式碼。
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
聚合根(AggregateRoot)是 DDD 中的重要概念，如對此不熟悉的話，建議先了解 DDD，而這邊 AuditedAggregateRoot 是 abp 框架提供的一個具有一些計算屬性像是建立時間等等的 AggregateRoot 類別，接著照著教程在 Domain.Shared 層新增 BookType 列舉。
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
### 建立資料
**前置步驟:
須將 DbMigrator 專案中的 `appsettings.json` 內的預設連線字串改為目標資料庫的連線字串。**

將實體添加到 EntityFrameworkCore 層的專案 DbContext。
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
再至 DbContext 類別的最下面，將資料對映到資料表上。
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

依照教程看自行抉擇是否要餵初始資料進資料表後，到達資料轉移(Migration)的步驟，輸入終端命令或使用 Nuget 套件工具指令。
```=
dotnet ef migrations add Created_Book_Entity
```
接著將 DbMigrator 專案設為啟動專案，並運行，在運行時可能會遇到下列錯誤。

`Microsoft.Data.SqlClient.SqlException: 'Invalid object name 'dbo.AppBooks'.`

此時需要在 EFCore 層對 Migrations 初始化。
```=
dotnet ef migrations add init
```
初始化完畢，再加入實體一次。
```=
dotnet ef migrations add book
```
再執行一次 DbMigrator 專案。
### 建立服務
在 Application.Contracts 建立 BookDto 類別，增加以下程式碼。
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
有了 BookDto 後，我們還需要在 Application.Contracts 層中建立 CreateUpdateBookDto，來建立與更新 Book。
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
設定好 DTO 後，要將 DTO 與實體對映，abp 內建 AutoMapper 來處理這件事情，所以需要在 Application 層中的 AutoMapperProfile 進行設定。
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
做好上面這些事後，需要定義應用層的接口介面，在 Application.Contracts 建立 IBookAppService。
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
`ICrudAppService` 是 abp 提供的 CRUD 方法，內建了 `GetAsync`、`GetListAsync`、`CreateAsync`、`UpdateAsync`、`DeleteAsync`。

定義好接口後，要在 Application 層實作 BookAppService 類別，這邊會利用通用倉儲模式跟實體溝通。
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


接下來即可照著教程設定，將 HttpApi.Host 設為啟動專案，運行 HttpApi.Host 專案，並跳出 Swagger API UI。
![swagger](https://i.imgur.com/3nQRJrS.png)

可以測試看看，是否能成功取回書籍列表。

## 客戶端 Angular
### 本地化
在 Domain.Shared 層中的 Localization/BookStore 中可以看到各個語言範本的 json，先在 en.json 換掉內容，這邊要注意的是 abp vNext 建議在選單種類前加上`Menu:<Item>`前綴，以及列舉前加上`Enum:<Type>`前綴。
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
### 初始設置
利用終端 cd 至 Angular 專案，輸入指令用 Yarn 安裝 Npm Packages。
```Bash=
yarn
```
接著輸入指令用 yarn 產生 BookModule。
```Bash=
yarn ng generate module book --module app --routing --route books
```
輸入完會做以下新增及更新。
```Bash=
CREATE src/app/book/book-routing.module.ts (335 bytes)
CREATE src/app/book/book.module.ts (343 bytes)
CREATE src/app/book/book.component.html (19 bytes)
CREATE src/app/book/book.component.spec.ts (585 bytes)
CREATE src/app/book/book.component.ts (195 bytes)
CREATE src/app/book/book.component.scss (0 bytes)
UPDATE src/app/app-routing.module.ts (2181 bytes)
```
成功新增後，利用指令產生客戶端代理，也就是自動跟後端做串接，此時要先讓後端 HttpApi.Host 專案為啟動狀態，才能輸入指令
```Bash=
abp generate-proxy -t ng
```
上述指令編譯完成後，應該要出現下圖檔案列表
![](https://i.imgur.com/9K3SXaM.png)
在這邊如果有報錯，或是缺少檔案，可以試著使用 abl cli 更新 npm 套件。
```=
abp update --npm
```
刪掉 `package-lock.json` 接著再用 Yarn 安裝一次 Npm Packages，接著可以直接再輸入產生客戶端代理的指令，如果還是沒有成功產生建議再用 abl cli 重新安裝。

如果都能成功產生，就可以在 `/src/app/book/book.component.ts` 置換下面程式碼。
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

這邊可以看到注入了 `BookService`、`ListService`。
`ListService` 提供簡單的換頁、查詢、排列功能。

將 BookComponent 的功能寫上後，現在要換 HTML 了，把`/src/app/book/book.component.html`的內替換上下列程式碼。
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
最後，使用指令`npm run start`運行前端頁面，可成功出現書籍列表畫面。

![](https://i.imgur.com/DxP3Wsn.png)

如果無法成功運行，請再將`package-lock.json` 刪掉並再下指令`yarn`重新安裝套件包，再運行看看。

## 前端頁面客製化
可以至文件的主題中，裡面有更仔細的步驟與教學，但很可惜的是這邊目前沒有中文化，所以就要考驗小夥伴們的英文底仔了，這邊會簡單講解一下。

![](https://i.imgur.com/jShCXgN.png)

abp vNext 提供版面客製化的選項，但這裡卻不真正意義上去客製化 abp vNext 元件，而是自己做一個去替換，可以看到文件內說明。

![](https://i.imgur.com/mFZ3sg9.png)

所以要先找到要替換元件的 key，也就是元件名字，然後在 `app.component.ts`中做替換。
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
## 總結
abp vNext 框架把 .Net Core 與 DDD 設計模式的整合實踐到最佳化，讓使用者在以 DDD 模式下開發微服務可以省掉不少的時間，可惜整體過於龐大，且因為 abp vNext 強調微服務，讓多個 app 可共用一個後端，因此前端對於後端的依賴性非常高，許多前端 config 與 i18n 都得使用後端 Endpoint 來取得，使用者除了必須詳讀文件後再來使用，也要考量自身的專案是否真的需要導入此套框架，目前覺得不錯的用法是自行開發前端來做中後台，整合 abp vNext 的後端，而 abp vNext 附與的前端做為後台，做權限管理與租戶管理的行為。

## 如有後續開發與使用，再做更新

## Reference

* abp.io
* [初识ABP vNext（1）：开篇计划&基础知识](https://blog.51cto.com/u_12460661/3019374)