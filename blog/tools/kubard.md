---
title: 推荐一个k8s面板kuboard附快速安装教程
date: 2024-11-03T20:11
authors: bronya0
keywords:
  - kuboard
tags: 
  - kuboard
---

# 推荐一个k8s面板kuboard附快速安装教程

一个k8s面板，认可度高，建议安装v3而不是v4（v4java写的，且依赖mysql。而且目前还不稳定）

官方文档：https://kuboard.cn/install/v3/install.html
<!-- truncate -->
## 1、用kubectl安装

（[安装 Kuboard v3 - kubernetes | Kuboard](https://kuboard.cn/install/v3/install-in-k8s.html#安装)）

```bash
kubectl apply -f https://addons.kuboard.cn/kuboard/kuboard-v3-swr.yaml
# 等待 kuboard 名称空间中所有的 Pod 就绪
watch kubectl get pods -n kuboard
```

  访问:30080。卸载：kubectl delete -f https://addons.kuboard.cn/kuboard/kuboard-v3.yaml

## 2、或者用docker 更简单

```bash
docker run -d \
  --restart=unless-stopped \
  --name=kuboard \
  -p 8999:80/tcp \
  -p 10081:10081/tcp \
  -e KUBOARD_ENDPOINT="http://内网IP:80" \
  -e KUBOARD_AGENT_SERVER_TCP_PORT="10081" \
  -v /root/kuboard-data:/data \
  eipwork/kuboard:v3
```

   访问:8999

- 用户名： admin 密码： Kuboard123

### kuboard中的概念翻译：

- 工作负载：deployment
- 容器组：pod
- 应用路由：ingress

