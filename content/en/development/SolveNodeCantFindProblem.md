---
title: Solve Problem - node is not an internal or external command
date: 2023-04-09
categories: Development
author: kai98k
tags:
  - node.js
  - npm
---

npm, webpack etc. all need node support. If node has problems, usually other related commands also cannot work. If node is installed but this problem still appears, maybe there is an error in environment variables.

## Environment Variables

If it is Windows environment, you can query in start search bar.

![Step 1](https://i.imgur.com/25vCJJm.png)

After opening, click Environment Variables.

![Step 2](https://i.imgur.com/6cdQIJ9.png)

If your node version is also managed using nvm, then you will see nvm related info in user variables. But regardless of whether nvm is installed or not, you should check environment variables of node in Path in system variables below.

![Step 3](https://i.imgur.com/VgzTXOI.png)

At this time if you don't find folder path containing `node.exe`, you need to add path containing this file. Because I have installed nvm, so it will be in folder of node version number. If using nvm to switch node but environment variable didn't change, you can also set it here.

![Step 4](https://i.imgur.com/5oPMw6e.png)

## Last Resort

When you find there is node environment variable but still report error, you can check if `node.exe` is missing. Even if not missing, you can also reinstall directly. But premise for successful reinstallation is to delete all environment variables first, let reinstalled node/nvm help establish environment variables.

## Reference

- [windows install nvm and manually configure system node path](https://www.796t.com/content/1544611888.html)
