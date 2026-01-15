---
title: Reduce dependency conflicts, improve development efficiency: Solve version management challenges with pnpm
date: 2024-03-04
categories: Development
author: johch3n611u
tags:
- node
- npm
- pnpm
- nvm
- nrm
authorsWords: Clean up or reinstall, just rely on pnpm
---

## Knowledge Points

### Node:

1. Runtime environment based on Chrome V8 JavaScript engine
2. It allows you to run JavaScript code on server side
3. Provides many built-in modules and functions, enabling developers to conduct server-side development

### Node_Module:

1. Directory for storing packages required by the project
2. When you use npm or pnpm to install packages, these packages will be downloaded and stored in node_module directory

### npm (Node Package Manager):

1. Official package manager for Node.js
2. It is used to install, manage and share JavaScript packages
3. npm provides a huge package library for developers to use

### nvm (Node Version Manager):

1. Tool for managing Node.js versions
2. It allows you to install and switch between different versions of Node.js on same machine
3. Can easily switch Node.js versions between different projects

### nrm (Npm Registry Manager):

1. Tool for managing npm registry
2. It allows you to easily switch npm registries, such as switching from npm official registry to other private or self-hosted registries
3. Provides functions to detect registry speed and show available registries

## Important Commands

[pnpm official website](https://pnpm.io/installation)

1. It is another package manager for Node.js, similar to npm but has some different advantages
2. Reduces disk usage and installation time by sharing dependencies, only need to install once
3. It solves dependency conflict problems and provides fast and efficient dependency management

```
1. Install pnpm on Windows
iwr https://get.pnpm.io/install.ps1 -useb | iex

2. Find special directory location of .pnpm
pnpm root -g

Command Help
pnpm help

Install node
pnpm env use --global < OPTIONS >

Query pnpm directory (If no custom storage location set, pnpm will automatically create storage on same drive)
pnpm store path

pnpm init

3. Delete old node_module and use pnpm i to generate node_module containing .pnpm hard links. For operation rules detail refer to [Casper] Replace npm with pnpm, make node_modules no longer a capacity monster!
npm install = pnpm install

npm i <pkg> = pnpm add <pkg>

npm run <cmd> =	pnpm <cmd>
```

## Reference

- [Solve Problem - node is not an internal or external command](https://urwebapp.github.io/Dev-Tech/SolveNodeCantFindProblem/)
- [How to manage multiple nodejs versions with pnpm?](https://medium.com/frontendweb/how-to-manage-multiple-nodejs-versions-with-pnpm-8bcce90abedb)
- [Difference between nvm/nrm/npm in node.js](https://juejin.cn/post/7123447437939638302)
- [how-to-change-where-pnpm-installs-the-global-packages](https://stackoverflow.com/questions/58278194/how-to-change-where-pnpm-installs-the-global-packages)
- [how-to-get-pnpm-store-directory](https://stackoverflow.com/questions/55403775/how-to-get-pnpm-store-directory)
- [pnpm directory location change](https://pnpm.io/cli/config)
- [pnpm remove](https://pnpm.io/cli/remove)
- [Uninstall pnpm](https://pnpm.io/zh-TW/7.x/uninstall)
- [If no store is configured, pnpm will automatically create a store on the same drive](https://pnpm.io/zh-TW/configuring)
- [[Casper] Replace npm with pnpm, make node_modules no longer a capacity monster!](https://ithelp.ithome.com.tw/articles/10319375)
