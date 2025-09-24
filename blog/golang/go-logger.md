---
title: 推荐一个go-logger日志库
date: 2025-01-02T11:10
authors: bronya0
keywords:
  - go-logger
tags: 
  - go
  - 开源
---

最近用go的日志库，很多人用的zap，为了追求高性能。但是zap功能很少，缺少日志切分和滚动，导致经常在代码里集成一些三方切割库，反而导致代码交叉，影响性能。
<!-- truncate -->
后来在github上发现一个go日志库，既有高性能，又自带时间、体积切割，于是点了关注。

然后我也提交了几个pr，添加了自定义日志func的功能，扩展使用场景。

目前我在自己的 项目里已经用上了，配置非常简单，简直不要太舒服。

项目地址：https://github.com/donnie4w/go-logger
使用文档：https://tlnet.top/logdoc

作者也说明了我提交的部分：

![](/imgs/2024-08-09_15-59-58.png)

给大家看看我项目里的配置，真的很简单：

```go showLineNumbers
func InitLogger(path string) *logger_.Logging {

	logger := logger_.NewLogger()
	logger.SetOption(&logger_.Option{
		Level:     logger_.LEVEL_INFO,
		Console:   true, // 控制台输出
		Format:    logger_.FORMAT_LEVELFLAG | logger_.FORMAT_SHORTFILENAME | logger_.FORMAT_DATE | logger_.FORMAT_MICROSECNDS,
		Formatter: "{level} [{time}] {file}: {message}\n",
		// size或者time模式
		FileOption: &logger_.FileTimeMode{ // 这里用时间切割
			Filename:   path,             // 日志文件路径
			Timemode:   logger_.MODE_DAY, // 按天
			Maxbuckup:  120,              // 最多备份日志文件数
			IsCompress: false,            // 是否压缩
		},
	})

	return logger
}

```

新版本添加了堆栈输出和自定义函数，更加好用了。