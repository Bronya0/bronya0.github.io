---
title: k8s快速部署应用
date: 2024-05-04T20:01
authors: bronya0
tags: 
  - k8s
---

首先把项目打成docker镜像，这个就不说了。
打完后可以把镜像推到镜像仓库里，也可以直接导入到k8s节点的docker上，使用`docker load`命令。
然后是三步走，创建pvc、development、service、ingress，其中pvc可以看情况复用已有的。
<!-- truncate -->

## pvc
持久卷。
```yaml showLineNumbers
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  annotations:
    volume.beta.kubernetes.io/storage-provisioner: cluster.local/nfs-client-provisioner
  finalizers:
    - kubernetes.io/pvc-protection
  name: 持久卷名
  namespace: 命名空间
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 2Gi
  storageClassName: 存储类
```

## deployment
**作用**:

- **管理应用的副本**:
  - `Deployment` 用于定义和管理应用的副本数，确保即使在节点故障或其他问题发生时，应用也能保持可用性。
  - `Deployment` 控制器会自动维护应用的期望状态，比如重启失败的容器、替换过时的 Pod 等。
- **滚动更新和回滚**:
  - `Deployment` 支持滚动更新和回滚功能，可以在不中断服务的情况下更新应用版本。
  - 当你更新 `Deployment` 的模板时，Kubernetes 会逐步替换旧的 Pod 为新的 Pod，确保整个过程中应用的可用性不受影响。
- **健康检查**:
  - `Deployment` 可以配置健康检查机制，以确保只有健康的 Pod 才会被调度和维持。

mountPath是容器目录，subPath是持久卷下的对应创建的子目录
```yaml showLineNumbers
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deployment名称
  namespace: 命名空间
  labels:
    app: deployment名称
spec:
  replicas: 1（副本数量）
  selector:
    matchLabels:
      app: deployment名称
  template:
    metadata:
      labels:
        app: deployment名称
    spec:
      containers:
      - name: 自定义命名-container
        image: 镜像名:对应tag
        volumeMounts:
          - mountPath: /home/logs
            subPath: logs
            name: volumeA
          - mountPath: /home/apps/conf
            subPath: conf
            name: volumeA
        ports:
        - containerPort: 80
      volumes:
      - name: volumeA
        persistentVolumeClaim:
          claimName: 要用的pvc
```

## service

- **服务发现**:
  - `Service` 是 Kubernetes 中用于定义一组 Pod 的逻辑集合和如何访问它们的一种抽象。
  - 它提供了服务发现机制，允许客户端通过一个稳定的 DNS 名称来访问后端的 Pod 实例，即使这些 Pod 的 IP 地址发生了变化。
- **负载均衡**:
  - `Service` 可以为后端的 Pod 提供负载均衡能力，将流量均匀地分配给这些 Pod。
  - 它可以根据请求将流量路由到不同的 Pod 上，确保负载均衡。
- **网络策略**:
  - `Service` 可以与网络策略配合使用，控制服务之间的网络通信。

```yaml showLineNumbers
apiVersion: v1
kind: Service
metadata:
  name: 自定义服务名
  namespace: 命名空间
  labels:
    app: 自定义服务名
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: 在deploment中定义的name
```

## ingress
**作用**:

- **外部流量路由**:
  - `Ingress` 用于定义 HTTP 和 HTTPS 流量的路由规则，可以将外部流量路由到集群内部的服务。
  - 它提供了一种将外部流量路由到集群内服务的方法，通常是通过 HTTP 和 HTTPS 协议。
- **反向代理和负载均衡**:
  - `Ingress` 通常与反向代理服务（如 Nginx、Traefik 等）一起工作，为集群内部的服务提供反向代理和负载均衡功能。
  - 它可以根据 URL 路径、主机名等条件将外部请求转发到不同的服务。
- **TLS 终止**:
  - `Ingress` 可以处理 TLS/SSL 加密，为外部流量提供加密连接，并在 Ingress 控制器处终止 SSL 连接，再将未加密的流量发送到后端服务。
- **可扩展性**:
  - `Ingress` 规则可以很容易地扩展和修改，支持添加或移除服务，调整路由规则等。

```yaml showLineNumbers
kind: Ingress
apiVersion: extensions/v1beta1
metadata:
  name: Ingress名
  namespace: 命名空间
  annotations:
    nginx.ingress.kubernetes.io/proxy-body-size: 1024m
#    nginx.ingress.kubernetes.io/rewrite-target: /$2
    nginx.ingress.kubernetes.io/ssl-redirect: 'false'
spec:
  tls:
    # ...
  rules:
    - http:
        paths:
          - path: /api(/|$)(.*)
            pathType: Prefix
            backend:
              serviceName: 服务名
              servicePort: 服务端口
```

## 总结
- **Deployment** 用于管理应用的部署和滚动更新。
- **Service** 用于定义服务的逻辑集合和访问方式，提供服务发现和负载均衡。
- **Ingress** 用于定义外部流量的路由规则，处理反向代理和 TLS 终止，使得外部流量可以访问集群内部的服务。