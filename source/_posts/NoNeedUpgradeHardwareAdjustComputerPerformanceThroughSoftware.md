---
title: 免升級硬體，透過軟體調整電腦性能
date: 2023-01-14
categories: Dev Tech
author: johch3n611u
tags:
- computer-science
---

> 此文章會不定時編修，如有錯誤在麻煩各位大神請不吝設指教，感謝！

## 自製 bat 清除系統垃圾

1. 新增一個 txt 文字檔並將以下內容複製貼上到文字檔內

```Batch

:: \d 用於切換 drive 硬碟，當要 cd 的路徑不再同個硬碟時
CD \d %PATH%

:: 關閉顯示指令
@echo off
:: 顯示文字
echo 中文亂碼，請改為 txt 檔案另存為 ANSI
echo 正在清除系統垃圾檔案中，請稍候……
:: 清除 tmp 暫存檔
Del /f /s /q %systemdrive%\*.tmp
:: 清除 _mp 臨時安裝程序文件
Del /f /s /q %systemdrive%\*._mp
:: 清除 log 記錄檔
Del /f /s /q %systemdrive%\*.log
:: 清除 gid 全局索引文件
Del /f /s /q %systemdrive%\*.gid
:: 清除 chk 損壞檔案的碎片
Del /f /s /q %systemdrive%\*.chk
:: 清除 old 保留舊系統的檔案
Del /f /s /q %systemdrive%\*.old
Del /f /s /q %systemdrive%\recycled\*.*
Del /f /s /q %windir%\*.bak
Del /f /s /q %windir%\prefetch\*.*
Del /f /q %userprofile%\cookies\*.*
Del /f /q %userprofile%\recent\*.*
Del /f /s /q "%userprofile%\Local Settings\Temporary Internet Files\*.*"
Del /f /s /q "%userprofile%\Local Settings\Temp\*.*"
Del /f /s /q "%userprofile%\recent\*.*"
Del /S /F /Q "%systemroot%\Temp\*.*"
Del /S /F /Q "%AllUsersProfile%\「開始」功能表\程式集\Windows Messenger.lnk"
RD /S /Q %windir%\temp & md %windir%\temp
RD /S /Q "%userprofile%\Local Settings\Temp"
MD "%userprofile%\Local Settings\Temp"
RD /S /Q "%systemdrive%\Program Files\Temp"
MD "%systemdrive%\Program Files\Temp"
RD /S /Q "%systemdrive%\d"
net user aspnet /Delete
cleanmgr /sagerun:99
echo 清除系統垃圾檔案完成！
:: 使顯示器停下，並顯示"請按任意鍵繼續..."
pause
```

2. 另存為 ANSI 的文字檔案，在另存為 .bat 副檔名的 bat 檔案，這樣就能直接點選使用了
3. Win + R 輸入 shell:startup 會進入到，自動啟動的資料夾將 clean.bat 檔案放在這即可每次開機自動執行，清理一下上述檔案

## Win 10 設定

1. 打開設定 => 系統 => 儲存體 => 開啟儲存空間感知器 => 開啟感知器設定 => 打勾刪除我的應用程式未使用的暫存檔案
2. 打開設定 => 系統 => 儲存體 => 其他儲存空間設定 => 默認保存位置調為開機硬碟 ( C 槽 )之外
3. Win + R 輸入 msconfig => 開機 => 進階選項 => 處理器數目打勾 => 改為最大處理器數目










