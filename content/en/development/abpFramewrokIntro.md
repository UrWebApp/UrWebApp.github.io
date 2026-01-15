---
title: abp Framework - The Framework of Frameworks
date: 2023-02-09 22:11:07
category: Development
author: kai98k
tags:
  - .Net
  - Angular
---

## Framework Introduction

abp.io is an extended version of ASP.NET Boilerplate Project. The two are different frameworks, but common point is they both apply DDD concept. Here abp.io will be abbreviated as (abp vNext). abp vNext is an open source microservice architecture based on .Net Core. UI page supports MVC (Razor), Angular, Blazor, and provides basic infrastructure (Infra), startup templates, reusable application modules, UI themes, DB diversity, etc., as well as rich documentation and commands to help developers save development time.

## Framework Features

- Microservice compatible
  ![Microservice](https://i.imgur.com/Zi3TfMc.png) Image source: abp.io
- Modular architecture: Modern layered architecture, including but not limited to service layer, application layer, data access layer, etc.
- Best practice of DDD (Domain-driven Design): Including but not limited to DDD infrastructure such as entities, aggregate roots, factory pattern, repository pattern, etc.
- Built-in system infrastructure such as API documentation, Log processing, etc.
- Multi-tenancy/Saas
  ![](https://i.imgur.com/QULZ5wD.png) Image source: abp.io

## Minimum Framework Requirements

- Must understand DDD design patterns and practice methods.
- Must understand Code First method of creating database.

## Solution Initialization

> This example will follow official website tutorial, and solve and explain problems that might be encountered. If interested, you can follow official website documentation directly for quick start, and come back to watch if there are problems.
>
> You can quickly generate initialization installation commands at [Get Started](https://abp.io/get-started) on official website, and add required [extra commands](https://docs.abp.io/zh-Hans/abp/6.0/CLI), like version etc. This example uses multi-layer application, Angular and default theme as UI framework, database is SQL Server.
> ![](https://i.imgur.com/Id0AYUa.png)

First install abp cli

```=
dotnet tool install -g Volo.Abp.Cli
```

Then create project using abp cli

```=
abp new Acme.BookStore -u angular --pwa -v 6.0.0
```

Problem encountered here might be error on package manager. If missing Yarn is seen in terminal, can install Yarn to replace NPM, otherwise Angular will lose dependency packages. When executing npm install on frontend, following error will appear.

`"npm install" unable to resolve dependency tree for angular/common (using ABP CLI default project)`

But regardless of whether there is error, after terminal finishes, two folders will appear, `angular`, `aspnet-core`.

## Backend Solution Operation

### Create Entity

Before starting development, need to have preliminary understanding of Domain-Driven Design (DDD).

Following tutorial in abp vNext documentation, first add Books folder in Domain layer, and add Book class in this folder, add code in Book class.

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

AggregateRoot is an important concept in DDD. If not familiar with this, suggest understanding DDD first. Here AuditedAggregateRoot is an AggregateRoot class provided by abp framework with some calculated properties like creation time etc. Then follow tutorial to add BookType enumeration in Domain.Shared layer.

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

### Create Data

**Prerequisite Step:
Must change default connection string in `appsettings.json` in DbMigrator project to target database connection string.**

Add entity to DbContext of project in EntityFrameworkCore layer.

```csharp=
//....
public class BookStoreDbContext :
    AbpDbContext<BookStoreDbContext>,
    IIdentityDbContext,
    ITenantManagementDbContext
{
    /* Add DbSet properties for your Aggregate Roots / Entities here. */
    public DbSet<Book> Books { get; set; }
    //...omitted
}
```

Then go to bottom of DbContext class, map data to table.

```csharp=
 protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        /* Include modules to your migration db context */
        // ... builder...omitted
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

After deciding whether to feed initial data into table according to tutorial, reach step of Data Migration. Enter terminal command or use Nuget package tool command.

```=
dotnet ef migrations add Created_Book_Entity
```

Then set DbMigrator project as startup project and run. Might encounter following error during run.

`Microsoft.Data.SqlClient.SqlException: 'Invalid object name 'dbo.AppBooks'.`

At this time need to initialize Migrations in EFCore layer.

```=
dotnet ef migrations add init
```

After initialization, add entity once more.

```=
dotnet ef migrations add book
```

Run DbMigrator project once more.

### Create Service

Create BookDto class in Application.Contracts, add following code.

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

With BookDto, we also need to create CreateUpdateBookDto in Application.Contracts layer, to create and update Book.

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

After setting DTO, need to map DTO with entity. abp has built-in AutoMapper to handle this, so need to set in AutoMapperProfile in Application layer.

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

After doing these, need to define interface of application layer. Create IBookAppService in Application.Contracts.

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

`ICrudAppService` is CRUD method provided by abp, built-in `GetAsync`, `GetListAsync`, `CreateAsync`, `UpdateAsync`, `DeleteAsync`.

After defining interface, implement BookAppService class in Application layer. Here will use generic repository pattern to communicate with entity.

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

Next can follow tutorial to set HttpApi.Host as startup project, run HttpApi.Host project, and pop up Swagger API UI.
![swagger](https://i.imgur.com/3nQRJrS.png)

Can test if book list can be successfully retrieved.

## Client Angular

### Localization

In Localization/BookStore in Domain.Shared layer, can see json of each language template. First change content in en.json. Note here that abp vNext recommends adding `Menu:<Item>` prefix before menu items, and `Enum:<Type>` prefix before enumerations.

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

### Initial Setup

Use terminal cd to Angular project, enter command to install Npm Packages with Yarn.

```Bash=
yarn
```

Then enter command to generate BookModule with yarn.

```Bash=
yarn ng generate module book --module app --routing --route books
```

After entering, following additions and updates will be done.

```Bash=
CREATE src/app/book/book-routing.module.ts (335 bytes)
CREATE src/app/book/book.module.ts (343 bytes)
CREATE src/app/book/book.component.html (19 bytes)
CREATE src/app/book/book.component.spec.ts (585 bytes)
CREATE src/app/book/book.component.ts (195 bytes)
CREATE src/app/book/book.component.scss (0 bytes)
UPDATE src/app/app-routing.module.ts (2181 bytes)
```

After successful addition, use command to generate client proxy, which is automatic connection with backend. At this time, need to let backend HttpApi.Host project be in running state before entering command

```Bash=
abp generate-proxy -t ng
```

After above command compilation finishes, file list below should appear
![](https://i.imgur.com/9K3SXaM.png)
If there is error here, or missing files, can try to update npm package using abl cli.

```=
abp update --npm
```

Delete `package-lock.json` then install Npm Packages with Yarn again, then can directly enter command to generate client proxy again. If still not successfully generated, suggest reinstalling with abp cli again.

If all generated successfully, can replace code below in `/src/app/book/book.component.ts`.

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

Can see `BookService`, `ListService` injected here.
`ListService` provides simple pagination, query, sorting functions.

After writing function of BookComponent, now need to change HTML, replace content of `/src/app/book/book.component.html` with following code.

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

Finally, use command `npm run start` to run frontend page, book list screen can successfully appear.

![](https://i.imgur.com/DxP3Wsn.png)

If unable to run successfully, please delete `package-lock.json` again and enter command `yarn` to reinstall package, then run again.

## Frontend Page Customization

Can go to themes in documentation, there are more detailed steps and tutorials inside, but unfortunately there is currently no Chinese localization here, so it will test friends' English foundation. Here will briefly explain.

![](https://i.imgur.com/jShCXgN.png)

abp vNext provides option for layout customization, but here it is not really customizing abp vNext component, but making one yourself to replace, can see explanation in document.

![](https://i.imgur.com/mFZ3sg9.png)

So need to find key of component to replace first, which is component name, then replace in `app.component.ts`.

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

## Summary

abp vNext framework implements integration of .Net Core and DDD design pattern to optimization, allowing users to save a lot of time when developing microservices in DDD mode. Unfortunately, the whole thing is too huge, and because abp vNext emphasizes microservices, allowing multiple apps to share a backend, so frontend dependency on backend is very high, many frontend configs and i18n have to be retrieved using backend Endpoint. Users besides having to read documentation in detail before using, also need to consider whether their project really needs to introduce this framework. Currently feel good usage is to develop frontend yourself for middle and back office, integrate abp vNext backend, and use frontend attached with abp vNext as back office, to do permission management and tenant management actions.

## Will update if there is subsequent development and usage

## Reference

- abp.io
- [Introduction to ABP vNext (1): Opening Plan & Basic Knowledge](https://blog.51cto.com/u_12460661/3019374)
