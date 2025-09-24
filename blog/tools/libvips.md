---
title: libvips：一个高效的图像处理工具用法
date: 2025-09-02T20:11
authors: bronya0
keywords:
  - tool
tags: 
  - libvips
---

libvips 是一个需求驱动、水平线程化的图像处理库。与其他类似的库相比，libvips 运行速度快，占用内存少。

提供了大约300种图像处理操作，涵盖算术、直方图、卷积、形态学操作、频率滤波、颜色、重采样、统计等。它支持从8位整数到128位复数的多种数值类型，并且图像可以有任意数量的波段。
<!-- truncate -->

### 主要作用

支持多种图像格式，包括JPEG、JPEG 2000、JPEG XL、TIFF、PNG、WebP、HEIC、AVIF、FITS、Matlab、OpenEXR、PDF、SVG、HDR、PPM/PGM/PFM、CSV、GIF、Analyze、NIfTI、DeepZoom 和 OpenSlide。此外，还可以通过ImageMagick或GraphicsMagick加载图像，从而支持DICOM等格式。

### 安装方式

对于大多数类Unix操作系统（包括macOS），可以通过系统的包管理器进行安装。 Windows用户可以在官方发布的版本中找到预编译的二进制文件（在这：https://github.com/libvips/build-win64-mxe/releases）。

如果需要从源码编译，libvips 使用 Meson 构建系统（0.56或更高版本）。编译前需要确保系统中已安装 `build-essential`、`pkg-config`、`libglib2.0-dev` 和 `libexpat1-dev` 等基础依赖，有些麻烦。

源码编译基本步骤如下：
```bash
cd libvips-x.y.z
meson setup build --prefix /usr/local
cd build
meson compile
meson test
meson install
```

### 使用方式

libvips 提供了命令行工具 `vips`，可以直接在终端中调用其功能。

**基本操作**

可以通过以下命令来执行一个操作，例如将图片旋转90度：
```bash
vips rot input.jpg output.jpg d90
```
如果不带任何参数运行一个操作，`vips` 会打印出该操作的简要说明和用法。

**可选参数**

许多操作都带有可选参数，可以在命令行中通过选项来指定。例如，`gamma` 操作可以附加 `--exponent` 参数来指定伽马因子：
```bash
vips gamma input.jpg output.jpg --exponent 0.42
```

**文件格式转换**

`vips` 可以自动处理图像文件的格式转换。它通过文件的前几个字节来识别输入格式，并根据输出文件的后缀名来确定输出格式。 在保存文件时，可以在文件名后用方括号附加特定格式的选项，例如设置JPEG的输出质量和去除元数据：
```bash
vips affine k2.jpg x.jpg[Q=90,strip] "2 0 0 1"
```

**操作链**

由于每个 `vips` 命令都在独立的进程中运行，若想将多个操作链接起来，需要借助中间文件。为了提升效率，建议使用libvips自身的 `.v` 格式作为中间文件。

```bash
vips invert input.jpg t1.v
vips affine t1.v output.jpg "2 0 0 1"
rm t1.v
```

### 图片压缩

除了基本的图像处理操作，`libvips` 在图像的保存和压缩方面也提供了丰富的选项，允许用户对输出文件的大小和质量进行精细控制。

#### jpegsave：保存为JPEG

`jpegsave` 是用于将图像保存为JPEG格式的命令。最关键的参数是质量因子 `--Q`。

*   `--Q <number>`: 设置JPEG的质量，范围是1-100。数值越低，压缩率越高，但图像质量也越差。通常，75-85是一个兼顾质量和文件大小的良好范围。
*   `--strip`: 移除图像中的所有元数据（如EXIF信息），可以显著减小文件大小。
*   `--optimize-coding`: 启用霍夫曼编码优化，可以在不损失质量的前提下，进一步减小文件大小。
*   `--interlace`: 生成渐进式JPEG，这对于Web图像加载体验友好。

**示例：**
```bash
# 将input.png转换为JPEG，质量为80，并移除元数据
vips jpegsave input.png output.jpg --Q=80 --strip
```

#### pngsave：保存为PNG

`pngsave` 用于将图像保存为PNG格式。

*   `--compression <number>`: 设置zlib压缩级别，范围是0-9。9代表最高压缩率，但处理速度也最慢。
*   `--strip`: 同样用于移除元数据。
*   `--palette`: 如果图像颜色数量小于等于256色，此选项会生成一个8位调色板PNG，可以极大地减小文件体积。

**示例：**
```bash
# 将input.tiff保存为PNG，使用最大压缩级别，并尝试生成调色板
vips pngsave input.tiff output.png --compression=9 --strip --palette=true
```

### 通用图片压缩流程

在实际应用中，压缩图片往往不只是保存为特定格式，通常还包括调整尺寸。`libvips` 的 `thumbnail` 命令是为此优化的最高效工具，它能快速生成高质量的缩略图，并且可以直接结合存盘选项进行压缩。

这种将**操作和存盘选项**结合的方式是 `libvips` 命令行的一大特色，也是其高效的原因之一。

**示例：**

假设你有一个名为 `original.jpg` 的大尺寸图片，希望将其等比缩放到宽度为1200像素，并以75的质量保存为JPEG，同时去除元数据。

```bash
# 一行命令完成缩放和压缩
vips thumbnail original.jpg compressed.jpg 1200 --height 0 -o .jpg[Q=75,strip]```

或者使用更简洁的语法，直接在输出文件名后附加选项：

```bash
vips thumbnail original.jpg compressed.jpg[Q=75,strip] 1200
```

**命令解析:**

*   `thumbnail`: 调用高效的缩略图生成功能。
*   `original.jpg`: 输入文件。
*   `compressed.jpg[Q=75,strip]`: 输出文件名，并在方括号内附加了 `jpegsave` 的参数。
    *   `Q=75`: 设置JPEG质量为75。
    *   `strip`: 移除元数据。
*   `1200`: 指定输出图像的目标宽度为1200像素。`thumbnail` 会自动计算高度以保持长宽比。