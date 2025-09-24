---
title: wsl install报错灾难性故障 Error code:Wsl/InstallDistro/E_UNEXPECTED
date: 2024-04-02T12:11
authors: bronya0
keywords:
  - wsl
tags: 
  - wsl
---

:::tip
今天在家安装wsl遇到这个问题，后来解决了，本质上是网络问题。
国内直接wsl install是不行的，要添加参数--web-download
:::
<!-- truncate -->

例如：
```
wsl --install -d Debian --web-download
```
直接就成功了。记得把代理打开。

其他的命令：

```
wsl --update --web-download
wsl --list --online
wsl --install -d Debian --web-download


wsl --set-version Debian  2
wsl --set-default-version 2
wsl -l -v

启动wsl虚拟机命令：wsl
```