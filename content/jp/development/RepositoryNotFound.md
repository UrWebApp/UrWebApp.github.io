---
title: Git エラー解決：Repository not found
date: 2023-03-05
categories: Development
author: kai98k
tags:
  - Git
---

1 台のコンピュータで異なる github アカウントを使用している場合、競合の問題が頻繁に発生し、リポジトリが明らかに存在していても「repository not found」というエラーが発生して使用できないことがあります。

```
git:clone を実行中...

=> fatal: Repository not found
```

このとき、Windows OS では、次の資格情報マネージャー (Credential Manager) を使用してアクセストークンを削除し、エラーを修正できます。他の OS では、CMD を使用して削除できます。

資格情報マネージャーを使用すると、Web サイト、接続されたアプリケーション、およびネットワークへのサインインに使用される保存された資格情報を表示および削除できます。

1. 資格情報マネージャーを開きます。タスクバーの検索ボックスに「資格情報マネージャー」と入力し、[資格情報マネージャー コントロール パネル] を選択します。
2. [Windows 資格情報] を選択して、Git の資格情報を削除します。

![コントロールパネル](https://i.imgur.com/6zCMAl0.png)

3. clone、push、pull などの操作を再度実行し、git アカウントに再度ログインします。

## Reference

- [Git - remote: Repository not found](https://stackoverflow.com/questions/37813568/git-remote-repository-not-found)
