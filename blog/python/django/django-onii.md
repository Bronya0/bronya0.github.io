---
title: 开源一个Django脚手架django-onii
date: 2024-09-12T22:09
authors: bronya0
keywords:
  - django
tags: 
  - django
---

封装了业务常用的一些轮子，整合起来做成了一个框架，写接口开箱即用。

项目地址：https://github.com/Bronya0/django-onii

better django starter. like onii-sama
<!-- truncate -->


## 组件
- django：Web框架。使用3.2 LTS版本
- django-q：定时任务和异步任务
- django-restframework：RESTful API
- redis-py：Redis客户端
- kafka-python：Kafka客户端
- elasticsearch：Elasticsearch客户端
- openpyxl：Excel工具
- psycopg2：PostgreSQL客户端

better django starter. like onii-sama

## Component
- django：Web framework. Use 3.2 LTS version
- django-q：Scheduled task and asynchronous task
- django-restframework：RESTful API
- redis-py：Redis client
- kafka-python：Kafka client
- elasticsearch：Elasticsearch client
- openpyxl：Excel util
- psycopg2：PostgreSQL client

## 结构

```
├─apps
│  ├─async_task
│  │  ├─filters
│  │  │  └─__pycache__
│  │  ├─models
│  │  │  └─__pycache__
│  │  ├─serializers
│  │  ├─services
│  │  │  └─__pycache__
│  │  ├─tasks
│  │  ├─views
│  │  │  └─__pycache__
│  │  └─__pycache__
│  └─__pycache__
├─conf
├─deploy
├─jobs
├─middleware
├─onii
│  └─__pycache__
└─utils
    └─__pycache__
```