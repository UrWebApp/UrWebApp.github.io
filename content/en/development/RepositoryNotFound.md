---
title: Solve Git Error: Repository not found
date: 2023-03-05
categories: Development
author: kai98k
tags:
- Git
---

When one computer uses different github accounts, conflict problems often occur, causing error "repository not found" even though the repository clearly exists, and it cannot be used.

```
Executing git:clone...

=> fatal: Repository not found
```

At this time in windows OS, you can use the following Credential Manager to remove access token to fix the error. In other OS, you can use CMD to remove.

Credential Manager lets you view and delete saved credentials used for signing in to websites, connected applications and networks.

1. Open Credential Manager, type Credential Manager in search box on taskbar, then select [Credential Manager Control Panel].
2. Select [Windows Credentials] to delete Git credentials.

![Control Panel](https://i.imgur.com/6zCMAl0.png)

3. Execute clone, push, pull operations again, and login to git account once more.

## Reference

- [Git - remote: Repository not found](https://stackoverflow.com/questions/37813568/git-remote-repository-not-found)
