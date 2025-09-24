---
title: PostMan太卡了，我手写了个api调试工具
date: 2025-04-11
authors: bronya0
keywords:
  - api
tags: 
  - api
---

今天调试的时候打开`apifox`和`postman`都很卡，公司电脑实在太弱鸡了。一怒之下自己写了个api调试工具。

<!-- truncate -->

技术栈就老东西，有了[kafka-king](https://github.com/Bronya0/Kafka-King)和[es-king](https://github.com/Bronya0/ES-King)的开发经验，写这种东西没啥难度。

桌面架构用的wails，类似tauri。
- 后端：golang（用resty处理http请求，不直接用标准库）。本地存储肯定就sqlite（这玩意儿坑也挺多的，web用pg用惯了）
- 前端：vue3、naive ui

## 特点
- 支持持久化历史查询，一键恢复
- 支持便捷的定义header、param、body、url等
- 轻量，启动快

## 效果
写了俩天基本完成了，基本满足我的需求。群里有小伙伴问我啥时候开源发布，看来这还是个痛点。

不过暂时没这个想法，我本地开发的工具非常多，不过基本都是给自己用的，比如追番工具、待办工具等等，因为要开源维护耗费的精力很大，而且都是免费项目，虽说有朋友会给一些赞助不过很少。

![](/imgs/sc/2025-04-11_16-47-17.png)

![](/imgs/sc/2025-04-11_16-47-37.png)

