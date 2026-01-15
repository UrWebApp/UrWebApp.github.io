---
title: Note Of Using Oracle
date: 2021-03-09
category: Environment
author: johch3n611u
tags:
  - Windows
  - Note
  - Performance
---

## ソフトウェアによるコンピュータのパフォーマンス調整

最近、オープンソースプロジェクトに取り組む必要があり、中古の Asus ノートパソコン (X550JX) を 367 ドル (定価 900 ドル) で購入しました。RAM は 4GB で従来の HDD を搭載していましたが、Chrome を開くのに 5 分もかかるほど信じられないほど遅かったです。最初はハードウェアのアップグレードを計画していましたが、いくつかのソフトウェア調整を行った後、驚くほどスムーズになりました。

### 一時ファイルのクリーンアップ

Windows は多くの一時ファイルを生成します。数ギガバイトの一時ファイルは、ディスクの読み取り速度に大きな影響を与える可能性があります。

- メモ帳を開き、以下のコードを貼り付け、`.bat` として保存し、管理者として実行します。

```Batch
@echo off
echo システムのジャンクファイルをクリーニングしています。お待ちください...
del /f /s /q %systemdrive%\*.tmp
del /f /s /q %systemdrive%\*._mp
del /f /s /q %systemdrive%\*.log
del /f /s /q %systemdrive%\*.gid
del /f /s /q %systemdrive%\*.chk
del /f /s /q %systemdrive%\*.old
del /f /s /q %systemdrive%\recycled\*.*
del /f /s /q %windir%\*.bak
del /f /s /q %windir%\prefetch\*.*
rd /s /q %windir%\temp & md %windir%\temp
del /f /q %userprofile%\cookies\*.*
del /f /q %userprofile%\recent\*.*
del /f /s /q "%userprofile%\Local Settings\Temporary Internet Files\*.*"
del /f /s /q "%userprofile%\Local Settings\Temp\*.*"
del /f /s /q "%userprofile%\recent\*.*"
echo ジャンクファイルがクリーニングされました！
echo. & pause
```

### スタートアップ アプリ

コンピュータを長く使用していると、インストールされた多くのソフトウェアが知らないうちに自動的に起動するように設定され、メモリを占有します。

- タスクマネージャーを開く -> スタートアップ -> 自動起動する必要のないソフトウェアを無効にします。

> `win` + `r` を押し、`shell:startup` と入力すると、自動起動する必要のないソフトウェアのショートカットファイルを削除できます。

### Windows 10 設定

- システム -> 電源とスリープ -> 電源の追加設定 -> 究極のパフォーマンス (利用できない場合は、高パフォーマンスを選択)
- 個人用設定 -> 色 -> 透明効果 (オフ)

### Asus BIOS

- コンピュータを再起動 -> F2 を押して BIOS に入る -> Advanced -> Internal Pointing Device (Disable)
- コンピュータを再起動 -> F2 を押して BIOS に入る -> Boot -> Launch CSM (Enabled) -> Fast Boot (Enabled)

これらの調整を行った後、VS Code、Chrome (20 以上のタブ)、Line を同時に実行してもラグがなく、十分にスムーズになりました。本当に素晴らしいです！
