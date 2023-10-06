---
title: 解決 Git 錯誤:Repository not found
date: 2023-03-05    
categories: Dev Tech
author: kai98k
tags:
- Git
---

當一台電腦中使用不同 github 帳號時，常常會發生衝突問題，就會造成明明就有此儲存庫，但一直報錯，且無法使用

```
執行 git:clone...

=> fatal: Repository not found
```

此時在 windows OS，可以使用下列認證管理員(Credential Manager.)，來砍掉 access token 來修正錯誤，在其他 OS 可以使用 CMD 來砍。

認證管理員可讓您檢視和刪除用來登入網站、已連線應用程式和網路的已儲存認證。

1. 開啟認證管理員，請在工作列的搜尋方塊中輸入認證管理員，然後選取 [認證管理員控制台]。
2. 選取 [Windows 認證] 來刪除 Git 的認證。

![控制台](https://i.imgur.com/6zCMAl0.png)

3. 再重新執行 clone、push、pull 等操作，重新登入一次 git 帳號。

## Reference
- [Git - remote: Repository not found](https://stackoverflow.com/questions/37813568/git-remote-repository-not-found)