---
title: 使用 go-co-op/gocron  实现高效定时任务管理
date: 2025-01-04T19:10
authors: bronya0
keywords:
  - gocron
tags: 
  - go
---

定时任务是一个常见的需求，例如定时清理数据、发送通知、执行备份等。Go 语言提供了多种方式来实现定时任务，网上的资料大多是`github.com/robfig/cron`，但这个库许多年不维护了，这里不推荐。

 [`go-co-op/gocron`](https://github.com/go-co-op/gocron) 是一个功能强大且易于使用、维护积极的定时任务调度库。本文介绍使用 `gocron/v2` 实现高效的定时任务管理，并结合数据库记录任务状态。
<!-- truncate -->

## 1. **gocron 简介**

`gocron` 是一个基于 Go 语言的定时任务调度库，支持以下特性：
- 基于 Cron 表达式的任务调度。
- 支持任务并发控制、单例模式等。
- 提供任务执行前后的钩子函数（事件监听）。
- 支持任务的动态添加、删除和更新。

`gocron/v2` 是其最新版本，提供了更简洁的 API 和更强大的功能。


## 2. **项目结构**

以下是一个基于 `gocron/v2` 的定时任务管理项目的核心代码结构：

```plaintext
.
├── main.go
├── config
│   └── config.go        # 配置文件
├── model
│   └── cron_job.go      # 数据库模型
├── global
│   └── global.go        # 全局变量（如数据库连接）
└── scheduler
    └── scheduler.go     # 定时任务调度逻辑
```


## 3. **核心代码实现**

### 3.1 初始化调度器

首先，我们需要初始化一个调度器，并设置时区等全局选项。

```go
func initScheduler() *gocron.Scheduler {
	s, err := gocron.NewScheduler(
		gocron.WithLocation(time.Local), // 设置时区
		gocron.WithGlobalJobOptions(),   // 全局任务选项
	)
	if err != nil {
		glog.Log.Errorf("initScheduler失败！: %v", err)
		panic("initScheduler失败！: " + err.Error())
	}
	return &s
}
```


### 3.2 添加任务

通过 `addJob` 函数，我们可以动态添加定时任务。每个任务包括：
- 任务名称（`jobName`）。
- Cron 表达式（`crontab`）。
- 任务函数（`function`）。
- 任务参数（`parameters`）。

```go
func addJob(s *gocron.Scheduler, jobName string, crontab string, function any, parameters ...any) {
	scheduler := *s

	// 如果启用数据库，保存或更新任务信息
	if config.GloConfig.DB.Enable {
		saveOrUpdate(jobName, crontab, function)
	}

	// 创建新任务
	_, err := scheduler.NewJob(
		gocron.CronJob(crontab, true), // Cron 表达式
		gocron.NewTask(function, parameters...), // 任务函数和参数
		gocron.WithEventListeners(panicListener(), beforeListener(), afterListener()), // 事件监听
		gocron.WithName(jobName), // 任务名称
		gocron.WithTags(jobName, getFunctionName(function)), // 任务标签
		gocron.WithSingletonMode(gocron.LimitModeReschedule), // 单例模式
	)

	if err != nil {
		glog.Log.Errorf("定时任务注册失败！: %v：%v", jobName, err)
		panic(err)
	}
	glog.Log.Infof("定时任务: %v 注册成功", jobName)
}
```


### 3.3 任务状态管理

为了记录任务的执行状态，我们可以将任务信息保存到数据库中。以下是任务状态的保存和更新逻辑：

```go
func saveOrUpdate(jobName, crontab string, fun any) {
	// 如果任务已存在，则更新 Cron 表达式并重置状态
	if global.DB.Where("name = ? and func = ?", jobName, getFunctionName(fun)).First(&model.CronJob{}).RowsAffected > 0 {
		global.DB.Model(&model.CronJob{}).Where("name = ? and func = ?", jobName, getFunctionName(fun)).
			UpdateColumns(map[string]interface{}{
				"crontab":        crontab,
				"last_run_start": nil,
				"last_run_end":   nil,
				"run_count":      0,
				"success":        true,
				"error":          nil,
			})
		return
	}

	// 如果任务不存在，则创建新记录
	cronJob := &model.CronJob{
		Name:    jobName,
		Crontab: crontab,
		Func:    getFunctionName(fun),
	}
	result := global.DB.Where("name = ?", jobName).Create(cronJob)
	if result.Error != nil {
		glog.Log.Errorf("任务记录创建失败: %v", result.Error)
		panic(result.Error)
	}
}
```

### 3.4 事件监听

`gocron` 提供了任务执行前后的钩子函数，我们可以利用这些钩子函数记录任务的执行状态。

#### 任务开始前
```go
func beforeListener() gocron.EventListener {
	return gocron.BeforeJobRuns(func(jobID uuid.UUID, jobName string) {
		glog.Log.Infof("Job %s is start running...", jobName)

		if !config.GloConfig.DB.Enable {
			return
		}
		// 更新任务开始时间
		global.DB.Model(&model.CronJob{}).Where("name = ?", jobName).
			UpdateColumns(map[string]interface{}{
				"last_run_start": time.Now(),
			})
	})
}
```

#### 任务结束后
```go
func afterListener() gocron.EventListener {
	return gocron.AfterJobRuns(func(jobID uuid.UUID, jobName string) {
		glog.Log.Infof("Job %s is running end", jobName)

		if !config.GloConfig.DB.Enable {
			return
		}
		// 更新任务结束时间和执行次数
		global.DB.Model(&model.CronJob{}).Where("name = ?", jobName).
			UpdateColumns(map[string]interface{}{
				"last_run_end": time.Now(),
				"run_count":    gorm.Expr("run_count + 1"),
				"success":      true,
			})
	})
}
```

#### 任务异常时
```go
func panicListener() gocron.EventListener {
	return gocron.AfterJobRunsWithPanic(func(jobID uuid.UUID, jobName string, recoverData any) {
		glog.Log.Errorf("Job Panic！！！：jobName: %s jobID: (%s): %+v\n", jobName, jobID, recoverData)

		if !config.GloConfig.DB.Enable {
			return
		}
		// 更新任务异常信息
		global.DB.Model(&model.CronJob{}).Where("id = ?", jobID).
			UpdateColumns(map[string]interface{}{
				"last_run_end": time.Now(),
				"run_count":    gorm.Expr("run_count + 1"),
				"success":      false,
				"error":        fmt.Sprintf("%+v", recoverData),
			})
	})
}
```

### 3.5 启动调度器

最后，启动调度器以开始执行任务。

```go
func start(s *gocron.Scheduler) {
	scheduler := *s
	scheduler.Start()
	glog.Log.Info("定时任务启动成功...")
}
```


## 参考文档
- [gocron GitHub 仓库](https://github.com/go-co-op/gocron)
- [Go 官方文档](https://golang.org/doc/)

希望本文对你有所帮助！如果有任何问题或建议，欢迎留言讨论。