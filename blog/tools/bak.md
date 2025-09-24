---
title: 写一个自动备份服务器目录的shell脚本
date: 2024-07-03T20:55
authors: bronya0
keywords:
  - 脚本
tags: 
  - 脚本
---

# 写一个自动备份服务器目录的shell脚本

这类需求还是很常见的，我个人喜欢写脚本放crontab里每天跑一次，留存个7份，脚本和大家分享下，也可以自己修改内容。

- 脚本中，首先定义了变量，包括备份目录、存放位置、保留天数、targz的文件名。
- 然后，使用mkdir命令创建备份目录和存放位置，如果目录不存在则创建，如果存在则跳过。
- 使用tar命令打包备份目录，并保存为targz文件
- 使用find命令查找存储目录下的所有targz文件，并删除超过指定天数的文件，最后，输出备份结果和删除结果。

<!-- truncate -->

```bash showLineNumbers
#!/bin/bash

# 设置备份目录、存放位置、保留天数、targz的文件名
BACKUP_DIR="/home"
STORAGE_DIR="/root/bak"
DAYS=7
NAME="backup"

# 确保存储目录存在
mkdir -p "${STORAGE_DIR}"

# 备份
BACKUP_FILE="${STORAGE_DIR}/${NAME}_$(date +%Y%m%d).tar.gz"
tar czf "${BACKUP_FILE}" "${BACKUP_DIR}"

# 保留最近7天的备份文件
find "${STORAGE_DIR}" -maxdepth 1 -name "${NAME}_*.tar.gz" -mtime +$((DAYS - 1)) -delete

# 输出结果
echo "备份完成: ${BACKUP_FILE}"
echo "已删除超过 ${DAYS} 天的旧备份文件"
```
