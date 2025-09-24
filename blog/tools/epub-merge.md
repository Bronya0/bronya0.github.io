---
title: combine EPUB Merge在线合并工具
date: 2025-08-11
authors: bronya0
keywords:
  - combine EPUB
tags: 
  - tool
---

介绍一个我开发的小工具，它能帮助将多个 EPUB 文件合并成一个。项目名为 **EPUB Merge Workshop**，目前已经上线。你可以在这里访问它：[https://epub.ysboke.cn/](https://epub.ysboke.cn/)

<!-- truncate -->

## 项目简介

EPUB Merge Workshop 是一个简单、快速且安全的在线工具，用于将多个 EPUB 文件合并成一个单一的书籍文件。只需要拖放文件，根据需要重新排序，然后点击合并即可。支持国际化，中日英三国。

## 动机
主要是我看轻小说不喜欢分一堆卷，所以自己写了几千行golang代码和页面自建了个。

我开发这个工具的初衷是为了解决一个很常见的需求：将一系列的 EPUB 文件（例如，一部小说的不同卷）合并成一个文件，以便于在电子阅读器上进行管理和阅读。市面上虽然有一些解决方案，但它们要么是桌面应用，需要安装；要么是在线工具，但功能或安全性不尽如人意。因此，我决定自己开发一个。



## 技术实现

该工具的核心合并算法是自行开发的。合并多个epub目前市面上没有公开成熟的库。

### 前端

*   **界面**: 只用了简洁的 HTML、CSS 和 JavaScript 来构建用户界面，重点是易用性。单页面没上vue等框架
*   **文件处理**: 用HTML5 的 File API，用户可以在本地选择文件，然后通过拖放的方式对它们进行排序。
*   **EPUB 解析与构建**: 前端基本不涉及


国际化
1、我并没有用框架，只是一个单独的html，就实现了很多框架的功能，像国际化其实很简单，定义各国语言的字典，给p标签加id，写个js函数去读取浏览器语言，并加载对应的label，参考：

```js
    function updateDynamicText() {
        if (totalMergedCount !== null) {
            const counterElem = document.getElementById('total-merged-counter');
            if (counterElem) {
                // 模板已由 applyTranslations 设置
                const template = translations[currentLang].totalMergedCount;
                // 使用特定于语言环境的格式替换占位符
                counterElem.textContent = template.replace('{count}', totalMergedCount.toLocaleString(currentLang));
                counterElem.style.display = 'block'; // 使其可见
            }
        }
    }

  function applyTranslations(lang) {
        currentLang = lang;
        const strings = translations[lang];

        document.documentElement.lang = lang;
        document.title = strings.pageTitle;

        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.dataset.langKey;
            // 排除我们手动控制的上传区域文本
            if (strings[key] && el.id !== 'upload-text-main' && el.id !== 'upload-text-sub') {
                el.textContent = strings[key];
            }
        });

        // 手动更新上传区域文本，因为它可能处于“忙碌”或“空闲”状态
        if (uploadArea.classList.contains('disabled')) {
            uploadTextMain.textContent = strings.uploadAreaBusyText;
            uploadTextSub.textContent = strings.uploadAreaBusySubtext;
        } else {
            uploadTextMain.textContent = strings.uploadAreaText;
        }

        // 更新按钮状态文本
        if (submitBtn.disabled) {
            submitBtn.textContent = strings.submitBtnDisabledText;
        } else {
            submitBtn.textContent = strings.submitBtnText;
        }

        // 更新语言切换器样式
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        // 更新包含动态数据的文本
        updateDynamicText();
    }

    function detectLanguage() {
        const userLang = (navigator.language || navigator.userLanguage).slice(0, 2);
        if (translations[userLang]) {
            return userLang;
        }
        return 'en'; // 默认返回英文
    }
```
所以简单的页面没必要用框架

### 后端

合并算法基本都在后端，纯手写。web框架为echo，除此之外没用什么三方库

另外实现了图片压缩功能，也并没有用什么很高深的库，只用了标准库，代码可以探讨下

```go

// CompressImage 压缩图片，保持比例，默认压缩到50%，支持直接替换源文件
// filePath: 输入图片路径（如果 replaceSource 为 true，输出覆盖此路径）
// outputPath: 输出图片路径（如果 replaceSource 为 false 则使用此路径）
// scale: 压缩比例（0-1，1表示原大小）
// quality: JPEG压缩质量（1-100，仅对JPEG有效）
// replaceSource: 是否替换源文件
func CompressImage(filePath, outputPath string, scale float64, quality int, replaceSource bool) error {
  // 打开输入文件
  file, err := os.Open(filePath)
  if err != nil {
    return fmt.Errorf("打开输入文件失败: %v", err)
  }
  defer file.Close()

  // 解码图片
  img, format, err := image.Decode(file)
  if err != nil {
    return DecodeErr
  }
  file.Close()

  // 计算新的尺寸
  bounds := img.Bounds()
  newWidth := int(float64(bounds.Dx()) * scale)
  newHeight := int(float64(bounds.Dy()) * scale)
  if newWidth <= 0 || newHeight <= 0 {
    return fmt.Errorf("压缩比例过小导致尺寸无效")
  }

  // 创建目标图片
  dst := image.NewRGBA(image.Rect(0, 0, newWidth, newHeight))

  // 使用高质量的 Catmull-Rom 插值算法进行缩放
  draw.CatmullRom.Scale(dst, dst.Bounds(), img, img.Bounds(), draw.Over, nil)

  // 确定输出路径
  finalOutputPath := outputPath
  if replaceSource {
    finalOutputPath = filePath
  }

  // 如果替换源文件，先将压缩结果保存到临时文件
  var tempPath string
  if replaceSource {
    tempPath = filePath + ".tmp"
  } else {
    tempPath = finalOutputPath
  }

  // 创建输出文件
  outFile, err := os.Create(tempPath)
  if err != nil {
    return fmt.Errorf("创建输出文件失败: %v", err)
  }

  // 根据文件格式保存压缩后的图片
  switch strings.ToLower(format) {
  case "jpeg", "jpg":
    err = jpeg.Encode(outFile, dst, &jpeg.Options{Quality: quality})
  case "png":
    err = png.Encode(outFile, dst)
  default:
    return fmt.Errorf("不支持的图片格式: %s", format)
  }
  if err != nil {
    return fmt.Errorf("保存压缩图片失败: %v", err)
  }
  outFile.Close()

  // 如果替换源文件，将临时文件重命名为源文件
  if replaceSource {
    if err := os.Rename(tempPath, filePath); err != nil {
      return fmt.Errorf("替换源文件失败: %v", err)
    }
  }

  return nil
}

```

另外还学到了别的东西：

**网站没有登录，怎么防止接口盗用呢？**

1、限制并发。你盗用了也没法大规模利用。这个在nginx层做就行

2、接口token签名，类似对称加密，掺入时间戳防重放，这里核心是保证秘钥和算法不泄露，其实前端没啥秘密可言，只能加大破解难度。

本来这里想用wasm，不过也比较重，不想影响加载速度（golang实现的wasm起步就是几mb，gzip压过也快1m了），就改成js混淆了，用的通用算法，效果还不错。

当然肯定挡不住大佬，不过参考第一点，大佬不一定看的上，看上也利用不了啥

3、服务器带宽很小怎么办

限制并发即可，反正是免费工具，用户一般不会期待啥，不过前端要提示当前正有其他用户使用中，请排队



## 如何使用

1.  **访问网站**: 在浏览器中打开 [https://epub.ysboke.cn/](https://epub.ysboke.cn/)。
2.  **上传文件**: 点击“Click or drag EPUB files here”区域，或直接将你的 EPUB 文件拖放到这里。你可以一次性选择多个文件。
3.  **排序**: 在文件队列中，你可以通过拖放来调整文件的顺序。
4.  **合并**: 点击“merge”按钮。
5.  **下载**: 合并完成后，点击“Download Merged File”即可下载合并后的 EPUB 文件。
