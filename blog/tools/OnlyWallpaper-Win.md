---
title: OnlyWallpaper-Win - Windows动态壁纸的守护进程架构
authors: bronya0
tags: [Windows, Go, Win32, IPC, 守护进程]
---

在 Windows 上实现动态壁纸需要与系统核心组件交互，包括桌面窗口管理、电源状态监控、注册表配置等。
于是我开发了**OnlyWallpaper-Win**，采用微服务架构思路，通过 CLI + 守护进程的分离设计，实现了一个稳定、低耗的 Windows 动态壁纸解决方案。

https://github.com/Bronya0/OnlyWallpaper-Win
<!-- truncate -->
## 系统要求

- Windows 10/11
- mpv 播放器（用于视频解码和渲染）
- Go 1.25+（可选，用于源码编译）

## 架构设计

### 1. CLI + 守护进程分离架构

```
┌─────────────────────────────────────────┐
│         用户命令行界面 (CLI)            │
│  onlywallpaper start/stop/status        │
└──────────────────┬──────────────────────┘
                   │ 命名管道通信(IPC)
                   ▼
┌─────────────────────────────────────────┐
│       后台守护进程(Daemon)               │
│  ├─ mpv 播放器管理                     │
│  ├─ Windows WorkerW 窗口操作            │
│  ├─ 电源/全屏监控                      │
│  └─ 配置文件管理                       │
└─────────────────────────────────────────┘
```

**为什么选择分离架构？**

- **用户体验**：命令行响应快速，不阻塞
- **稳定性**：守护进程异常不影响系统，易于重启
- **权限管理**：某些 Windows API 需要守护进程持续运行
- **扩展性**：后续可添加 Web UI、系统托盘等前端

### 2. Windows 特定实现细节

#### WorkerW 窗口操作

```go
// internal/desktop/desktop_windows.go
package desktop

import (
    "github.com/Microsoft/go-winio"
    "golang.org/x/sys/windows"
)

func SetWallpaperWindow(hwnd windows.HWND, videoPath string) error {
    // 1. 找到 WorkerW 窗口（真实壁纸容器）
    workerW := FindWorkerW()
    if workerW == 0 {
        return errors.New("WorkerW window not found")
    }
    
    // 2. 创建 mpv 窗口作为 WorkerW 的子窗口
    mpvHwnd := CreateMPVWindow(workerW)
    
    // 3. 调整窗口大小和位置
    screenWidth := GetScreenWidth()
    screenHeight := GetScreenHeight()
    
    SetWindowPos(mpvHwnd, 0, 0, screenWidth, screenHeight, SWP_NOZORDER)
    
    return nil
}

func FindWorkerW() windows.HWND {
    // WorkerW 是 Desktop Window Manager 管理的特殊窗口
    // 需要枚举子窗口找到
    parentHwnd := windows.FindWindow(syscall.StringToUTF16Ptr("ProgMan"), nil)
    
    var workerW windows.HWND
    windows.EnumChildWindows(parentHwnd, func(hwnd windows.HWND) bool {
        className := GetWindowClassName(hwnd)
        if className == "WorkerW" {
            workerW = hwnd
            return false  // 停止枚举
        }
        return true
    })
    
    return workerW
}
```

#### 命名管道 IPC 通信

```go
// internal/ipc/ipc.go
package ipc

import (
    "github.com/Microsoft/go-winio"
)

const PipeName = "\\\\.\\pipe\\OnlyWallpaper"

// 服务端：守护进程监听命令
func StartServer(handler func(cmd string) string) error {
    listener, err := winio.ListenPipe(PipeName, nil)
    if err != nil {
        return err
    }
    defer listener.Close()
    
    for {
        conn, err := listener.Accept()
        if err != nil {
            continue
        }
        
        go func(c net.Conn) {
            defer c.Close()
            
            buf := make([]byte, 1024)
            n, _ := c.Read(buf)
            cmd := string(buf[:n])
            
            // 处理命令
            response := handler(cmd)
            c.Write([]byte(response))
        }(conn)
    }
}

// 客户端：CLI 发送命令
func SendCommand(cmd string) (string, error) {
    conn, err := winio.Dial(PipeName)
    if err != nil {
        return "", err
    }
    defer conn.Close()
    
    conn.Write([]byte(cmd))
    
    response := make([]byte, 1024)
    n, _ := conn.Read(response)
    return string(response[:n]), nil
}
```

#### 注册表管理（开机自启）

```go
// internal/autostart/autostart_windows.go
package autostart

import (
    "golang.org/x/sys/windows/registry"
)

func EnableAutostart(videoPath string) error {
    key, _, err := registry.CreateKey(
        registry.CURRENT_USER,
        `Software\Microsoft\Windows\CurrentVersion\Run`,
        registry.WRITE,
    )
    if err != nil {
        return err
    }
    defer key.Close()
    
    exePath := GetExecutablePath()
    cmd := fmt.Sprintf(`"%s" start --video "%s"`, exePath, videoPath)
    
    return key.SetStringValue("OnlyWallpaper", cmd)
}

func DisableAutostart() error {
    key, err := registry.OpenKey(
        registry.CURRENT_USER,
        `Software\Microsoft\Windows\CurrentVersion\Run`,
        registry.WRITE,
    )
    if err != nil {
        return err
    }
    defer key.Close()
    
    return key.DeleteValue("OnlyWallpaper")
}
```

### 3. 智能节能机制

#### 应用窗口检测

```go
// internal/power/power.go
package power

import (
    "time"
    "unsafe"
    "syscall"
    "golang.org/x/sys/windows"
)

func MonitorForegroundWindow(callback func(isPaused bool)) {
    ticker := time.NewTicker(2 * time.Second)
    defer ticker.Stop()
    
    for range ticker.C {
        hwnd := GetForegroundWindow()
        className := GetWindowClassName(hwnd)
        
        // 判断是否为系统窗口（任务栏、系统托盘等）
        isSystemWindow := isSystemWindowClass(className)
        
        // WorkerW 窗口意味着桌面可见
        isDesktop := className == "WorkerW" || className == "ProgMan"
        
        isPaused := !isDesktop && !isSystemWindow
        callback(isPaused)
    }
}

func isSystemWindowClass(className string) bool {
    systemClasses := map[string]bool{
        "Shell_TrayWnd":     true,  // 任务栏
        "ReBarWindow32":     true,  // 任务栏容器
        "Button":            true,  // 系统按钮
        "Static":            true,  // 系统静态文本
    }
    return systemClasses[className]
}
```

#### 电池供电检测

```go
// 监控系统电源状态
func MonitorPowerStatus(callback func(onBattery bool)) {
    ticker := time.NewTicker(5 * time.Second)
    defer ticker.Stop()
    
    for range ticker.C {
        status := GetSystemPowerStatus()
        
        // ACLineStatus: 0=离线(电池), 1=在线(电源)
        onBattery := status.ACLineStatus == 0
        callback(onBattery)
    }
}

func GetSystemPowerStatus() *SYSTEM_POWER_STATUS {
    var status SYSTEM_POWER_STATUS
    syscall.SyscallN(
        procGetSystemPowerStatus.Addr(),
        uintptr(unsafe.Pointer(&status)),
    )
    return &status
}
```

### 4. mpv 播放器集成

```go
// internal/player/player.go
package player

import (
    "os/exec"
    "fmt"
)

type Player struct {
    cmd    *exec.Cmd
    isPaused bool
}

func (p *Player) Start(videoPath string, opts *Options) error {
    args := []string{
        "--wid=" + fmt.Sprintf("%d", p.windowHandle),
        "--no-input-default-bindings",
        "--input-ipc-server=" + os.ExpandEnv(`%APPDATA%\OnlyWallpaper\mpv.sock`),
    }
    
    // 硬件解码
    args = append(args, "--hwdec=auto")  // 自动选择 DXVA2/D3D11VA
    
    // 音频设置
    if !opts.EnableAudio {
        args = append(args, "--no-audio")  // 完全跳过音频解码
    } else {
        args = append(args, fmt.Sprintf("--volume=%d", opts.Volume))
    }
    
    // 宽高比保持
    args = append(args, "--keepaspect=yes")
    
    // 循环播放（目录模式）
    if opts.IsDirectory {
        args = append(args, "--loop-playlist=inf")
    }
    
    args = append(args, videoPath)
    
    p.cmd = exec.Command("mpv", args...)
    return p.cmd.Start()
}

func (p *Player) Pause() error {  
    // 通过 IPC socket 发送暂停命令
    return p.sendIPCCommand("set pause yes")
}

func (p *Player) Resume() error {
    return p.sendIPCCommand("set pause no")
}
```

## 命令行接口

```bash
# 启动单个视频
onlywallpaper start --video "C:\Videos\wallpaper.mp4"

# 启动目录（按文件名顺序）
onlywallpaper start --video "C:\Videos\wallpapers\"

# 随机播放目录中的视频
onlywallpaper start --video "C:\Videos\" --shuffle

# 带声音播放
onlywallpaper start --video "C:\Videos\beach.mp4" --audio

# 指定音量
onlywallpaper start --video "C:\Videos\beach.mp4" --volume 60

# 查看运行状态
onlywallpaper status

# 停止播放
onlywallpaper stop

# 配置开机自启
onlywallpaper autostart on
onlywallpaper autostart off
```

## 配置文件管理

配置文件位置：`%APPDATA%\OnlyWallpaper\config.json`

```json
{
  "video_path": "C:\\Videos\\wallpaper.mp4",
  "enable_audio": false,
  "volume": 50,
  "shuffle": false,
  "hwdec": "auto",
  "auto_pause_fullscreen": true,
  "auto_pause_battery": true
}
```

**配置项说明：**

- `hwdec` - 硬件解码模式
  - `auto`：自动选择最优（推荐）
  - `auto-safe`：安全模式选择
  - `d3d11va`：强制使用 Direct3D11
  - `dxva2`：强制使用 DXVA2
  - `no`：禁用（不推荐，CPU占用高）

## 性能优化

### 内存占用

| 场景 | 占用 | 说明 |
|------|------|------|
| 静音播放 | 80-120 MB | 完全跳过音频解码 |
| 有声播放 | 120-150 MB | 包含音频输出 |

### CPU 占用

- **硬件解码启用**：5-15%（包括守护进程、电源监控）
- **硬件解码禁用**：30-60%（高度依赖视频分辨率）

### 建议

1. 使用 H.264 编码的 MP4 文件（最佳兼容性）
2. 分辨率不超过 1920×1080
3. 启用硬件解码（`--hwdec=auto`）
4. 启用全屏暂停（自动节省资源）

## 目录播放与大文件列表处理

当目录中视频超过 100 个时，自动生成播放列表文件：

```go
// internal/playlist/playlist.go
func (p *Playlist) GenerateM3U() error {
    listPath := os.ExpandEnv(`%APPDATA%\OnlyWallpaper\playlist.m3u`)
    
    f, err := os.Create(listPath)
    if err != nil {
        return err
    }
    defer f.Close()
    
    f.WriteString("#EXTM3U\n")
    
    for _, video := range p.Videos {
        f.WriteString(fmt.Sprintf("#EXTINF:-1,%s\n", filepath.Base(video)))
        f.WriteString(video + "\n")
    }
    
    return nil
}
```

**优势：**
- 避免 Windows 命令行 32KB 长度限制
- mpv 更快扫描播放列表
- 支持条带式加载

## 编译和部署

### 标准编译

```bash
go build -o onlywallpaper.exe .
```

### 优化二进制大小

```bash
go build -ldflags="-s -w" -o onlywallpaper.exe .
```

### 跨平台编译（在 Linux 为 Windows 编译）

```bash
GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -o onlywallpaper.exe .
```

## 开发经验总结

### 1. Win32 API 的学习曲线

Windows API 文档丰富但繁琐。建议：
- 使用 `golang.org/x/sys/windows` 而非手工 syscall
- 利用现有库如 `go-winio`、`go-ole` 
- 在 WinDbg 中调试窗口句柄问题

### 2. 电源监控的陷阱

不能使用 WMI 的 `Win32_PowerManagementEvent` 事件（需要权限）。改用轮询 API 更稳定：

```go
// 不推荐 - 需要管理员权限和 WMI
// wmi.Query("SELECT * FROM Win32_PowerManagementEvent", ...)

// 推荐 - 直接调用 Windows API
GetSystemPowerStatus()
```

### 3. 命名管道的超时处理

```go
// 客户端连接需要添加超时，避免长时间挂起
conn, err := winio.DialPipe(pipeName, &winio.PipeConfig{
    MessageMode: true,
    InputBufferSize: 512,
    OutputBufferSize: 512,
})

// 或者使用 context
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()
// ... with context
```

## 与 macOS 版本的对比

| 特性 | macOS | Windows |
|------|-------|---------|
| 架构 | 单进程 + WKWebView | CLI + 守护进程 + mpv |
| 窗口管理 | Objective-C Cocoa | Win32 API |
| 渲染 | Metal GPU | Direct3D 或 OpenGL（mpv选择） |
| 节能机制 | 事件回调 | 轮询监控 |
| 功耗 | 10-50mW | 5-15% CPU（hardware decode） |
| 配置方式 | 环保路径存储 | JSON 配置文件 |

## 常见问题排查

### Q: 启动失败 "未找到 mpv"

```powershell
# 验证 mpv 安装
mpv --version

# 检查系统 PATH
echo $env:PATH -split ";"
```

### Q: 目录中有几百个视频无法播放

已自动处理 - 会生成播放列表文件 `%APPDATA%\OnlyWallpaper\playlist.m3u`

### Q: 壁纸闪烁或不停暂停

检查日志：`%APPDATA%\OnlyWallpaper\daemon.log`

通常是 WorkerW 窗口被刷新导致，可尝试禁用全屏暂停：

```json
{
  "auto_pause_fullscreen": false
}
```

## 项目链接

- **GitHub**：https://github.com/Bronya0/OnlyWallpaper-Win
- **核心文件**：
  - `internal/desktop/desktop_windows.go` - 窗口管理
  - `internal/ipc/ipc.go` - 进程通信
  - `internal/power/power.go` - 电源监控

---

> Windows API 学习资源：[Microsoft Docs](https://docs.microsoft.com/windows/win32) | 欢迎提交 Issue 和 Pull Request！
