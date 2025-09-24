---
title: 静态博客添加giscus评论系统
date: 2023-09-13T10:10
authors: bronya0
tags: 
  - giscus
---

giscus基于github的discussion的评论服务，配置简单，集成也容易。
<!-- truncate -->

## 准备
进入官网：https://giscus.app/zh-CN

咱们所有操作都是在官网上。

1、提前创建好一个空的github的公开仓库，安装一个giscus应用，并授权访问你的特殊仓库

2、安装app：https://github.com/apps/giscus

3、选择 giscus 连接到的仓库，确保：

- 该仓库是公开的，否则访客将无法查看 discussion。
- giscus app 已安装，否则访客将无法评论和回应。
- Discussions 功能已在你的仓库中启用。

然后要选择页面与嵌入的 discussion 之间的映射关系，这里一般用`title`就行

特性的话选择：
- 将评论框放在评论上方
- 懒加载评论
- 启用主帖子上的反应（reaction）

然后会给你生成一个js，咱们放文章html底部即可

## js引入

```js showLineNumbers
<script src="https://giscus.app/client.js"
        data-repo="[在此输入仓库]"
        data-repo-id="[在此输入仓库 ID]"
        data-category="[在此输入分类名]"
        data-category-id="[在此输入分类 ID]"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="zh-CN"
        crossorigin="anonymous"
        async>
</script>
```

完事了。

## react引入

react引入的话也简单：

1. 先 npm install react-giscus
2. 然后使用：

```js showLineNumbers
import Giscus from '@giscus/react'

      <Giscus    
        repo="Bronya0/comments"
        repoId="R_kgDOMhRvHw"
        category="Announcements"
        categoryId="DIC_kwDOMhRvH84CiHWr"  // E.g. id of "General"
        mapping="title"                        // Important! To map comments to URL
        term="Welcome to @giscus/react component!"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="light"
        lang="zh-CN"
        loading="lazy"
        crossorigin="anonymous"
      />
```
参数换成自己的。