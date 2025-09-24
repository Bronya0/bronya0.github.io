---
title: 推荐一个我开源的Kafka客户端KafkaKing
date: 2024-04-01T12:10
authors: bronya0
keywords:
  - kafka
tags: 
  - kafka
  - kafka-king
  - 开源
---

![License](https://img.shields.io/github/license/Bronya0/Kafka-King)
![GitHub release](https://img.shields.io/github/release/Bronya0/Kafka-King)
![GitHub All Releases](https://img.shields.io/github/downloads/Bronya0/Kafka-King/total)
![GitHub stars](https://img.shields.io/github/stars/Bronya0/Kafka-King)
![GitHub forks](https://img.shields.io/github/forks/Bronya0/Kafka-King)

<strong>一个现代、实用的kafka GUI客户端。</strong>
<!-- truncate -->

![](/imgs/kafka-king.png)

本项目是一个kafka GUI客户端，支持各个系统，开源免费、简单好用。
点个star支持作者辛苦开源吧 谢谢❤❤

加群和作者一起交流： <a target="_blank" href="https://qm.qq.com/cgi-bin/qm/qr?k=pDqlVFyLMYEEw8DPJlRSBN27lF8qHV2v&jump_from=webapi&authKey=Wle/K0ARM1YQWlpn6vvfiZuMedy2tT9BI73mUvXVvCuktvi0fNfmNR19Jhyrf2Nz">研发技术交流群：964440643</a>
 
同款elasticsearch客户端 `ES-King` ：https://github.com/Bronya0/ES-King 


## Kafka-King功能清单
- [x] 查看集群节点列表（完成）
- [x] 支持PLAINTEXT、SASL PLAINTEXT用户名密码认证（完成）
- [x] 创建（支持批量）、删除主题，指定副本数、分区数（完成）
- [x] 支持根据消费者组统计每个topic的消息总量、提交总量、积压量（完成）
- [x] 支持查看topic的分区的详细信息（offset），并支持添加额外的分区（完成）
- [x] 支持模拟生产者，批量发送消息，是否开启gzip压缩、acks、batch_size、liner_ms，可以用来做性能调优（完成）
- [x] 支持模拟消费者，按照内置的组进行指定size的消费（完成）
- [x] 支持图表监控多个topic的消息生产性能、消费性能、积压情况（完成）
- [x] 健康检查
- [x] 多彩主题，追寻你的美（>0.25版本）
- ……

## 下载
[下载地址](https://github.com/Bronya0/Kafka-King/releases)，点击【Assets】，选择自己的平台下载，支持windows、macos、linux。

> 小提示：使用前请检查kafka集群配置的`advertised.listeners`，如果配置是域名，那么在King中填写连接地址时，请提前在本机电脑的hosts文件中添加对应域名解析，否则会因为无法解析域名而报NodeNotReadyError