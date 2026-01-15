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

## Adjust Computer Performance Through Software

Recently, to meet the needs of working on open source projects, I bought a second-hand Asus laptop (X550JX) for $367 (original price $900). With 4GB of RAM and a traditional HDD, it was incredibly slow, taking 5 minutes just to open Chrome. I originally planned to upgrade the hardware, but after some software adjustments, it became surprisingly smooth.

### Clean Temporary Files

Windows generates a lot of temporary files. A few gigabytes of temporary files can significantly impact disk reading speed.

- Open Notepad, paste the following code, save as `.bat`, and run as administrator.

```Batch
@echo off
echo Cleaning system junk files, please wait...
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
echo Junk files cleaned!
echo. & pause
```

### Startup Applications

After using a computer for a long time, many installed software will silently set themselves to start automatically, occupying memory without you knowing.

- Open Task Manager -> Startup -> Disable software you don't need to start automatically.

> Press `win` + `r`, enter `shell:startup`, you can delete shortcut files of software you don't need to start automatically.

### Windows 10 Settings

- System -> Power & sleep -> Additional power settings -> Ultimate Performance (If not available, choose High performance)
- Personalization -> Colors -> Transparency effects (Off)

### Asus BIOS

- Restart computer -> Press F2 to enter BIOS -> Advanced -> Internal Pointing Device (Disable)
- Restart computer -> Press F2 to enter BIOS -> Boot -> Launch CSM (Enabled) -> Fast Boot (Enabled)

After these adjustments, it's smooth enough to run VS Code, Chrome (20+ tabs), and Line simultaneously without lag. It's really awesome!
