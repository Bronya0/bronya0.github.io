---
title: Solve Google AI Studio freezing
date: 2025-08-03T10:10
authors: bronya0
tags: 
  - AI Studio
---

Performance degradation in complex, single-page web applications like Google AI Studio is a known issue on Chromium-based browsers (Google Chrome, Microsoft Edge). Users may experience input lag and general unresponsiveness. This is often not a fault of the web application itself, but a consequence of how the browser renders page elements, specifically the scrollbar.
<!-- truncate -->
### **Technical Cause**

The root cause of this lag is often tied to the browser's rendering process, specifically an event called "layout reflow" or "layout thrashing".

*   **Classic Scrollbars:** Traditional scrollbars occupy a dedicated space (the "gutter") on the side of the content. When content is added or removed dynamically—as is common in AI chat interfaces—the appearance or disappearance of this scrollbar can force the browser to recalculate the layout of the entire page. This process, known as reflow, is CPU-intensive. On a complex page with many elements, repeated reflows can lead to significant performance bottlenecks, causing the user interface to feel sluggish or "janky".

*   **Overlay Scrollbars:** In contrast, overlay scrollbars (referred to as "Fluent overlay scrollbars" in Edge) do not occupy a permanent gutter. Instead, they are rendered as a floating layer on top of the content and are often semi-transparent. They typically only appear during active scrolling. Because they don't alter the content area's width, they do not trigger the expensive layout reflow process when they appear or disappear, thus preventing performance degradation.

By forcing the browser to use overlay scrollbars, you can prevent these reflows and improve the application's responsiveness.

### **Solution**

This fix requires enabling an experimental feature flag in your browser.

#### **Google Chrome / Chromium**

1.  Navigate to `chrome://flags/#overlay-scrollbars` in the address bar.
2.  Locate the **Overlay Scrollbars** setting.
3.  Change its value from "Default" to **Enabled**.
4.  Click the **Relaunch** button to apply the change.

#### **Microsoft Edge**

1.  Navigate to `edge://flags/#Fluent overlay scrollbars` in the address bar.
2.  Locate the **Fluent overlay scrollbars** setting.
3.  Change its value from "Default" to **Enabled**.
4.  Click the **Restart** button to apply the change.

After relaunching, the browser will use the more efficient overlay scrollbar type, which should resolve the observed lag in resource-intensive web applications.

**I also recommend a greasyfork script of mine for beautifying the aistudio page: [link](https://greasyfork.org/zh-CN/scripts/543479-google-aistudio-%E8%81%8A%E5%A4%A9%E7%95%8C%E9%9D%A2%E7%BE%8E%E5%8C%96)**

---

### **中文版**

## **解决 Chromium 浏览器中的 UI 卡顿问题**

在 Chromium 内核的浏览器（如 Google Chrome, Microsoft Edge）上，Google AI Studio 存在性能下降的已知问题。用户可能会遇到输入延迟和界面无响应的情况。这通常不是 Web 应用本身的问题，而是浏览器渲染页面元素（特别是滚动条）的方式所导致的。

### **技术原因分析**

这种卡顿的根本原因通常与浏览器的渲染流程有关，特别是一个被称为“布局重排”（Layout Reflow）或“布局抖动”（Layout Thrashing）的事件。

*   **经典滚动条:** 传统滚动条在内容旁边占据一个固定的空间（“滚动条凹槽”）。当内容动态增删时——这在 AI 聊天界面中非常普遍——滚动条的出现或消失会强制浏览器重新计算整个页面的布局。 这个“重排”过程会大量消耗 CPU 资源。 在一个包含许多元素的复杂页面上，反复的重排会导致严重的性能瓶颈，从而使用户界面感觉迟钝或“卡顿”。

*   **悬浮滚动条:** 相比之下，悬浮滚动条（在 Edge 中称为“Fluent overlay scrollbars”）不占据固定的凹槽。它们作为浮动层渲染在内容之上，通常是半透明的。 它们一般只在用户主动滚动时才出现。 由于其显隐不会改变内容区域的宽度，因此不会触发高成本的布局重排，从而避免了性能下降。

通过强制浏览器使用悬浮滚动条，可以有效避免这些重排，提升应用的响应速度。

### **解决方法**

此修复方案需要在浏览器中启用一个实验性功能。

#### **Google Chrome / Chromium**

1.  在地址栏中访问 `chrome://flags/#overlay-scrollbars`。
2.  找到 **Overlay Scrollbars** 设置项。
3.  将其值从“Default”修改为 **Enabled**。
4.  点击 **Relaunch** 按钮以应用更改。

#### **Microsoft Edge**

1.  在地址栏中访问 `edge://flags/#Fluent overlay scrollbars`。
2.  找到 **Fluent overlay scrollbars** 设置项。
3.  将其值从“Default”修改为 **Enabled**。
4.  点击 **Restart** 按钮以应用更改。

重启后，浏览器将使用性能更高的悬浮滚动条，这应能解决在资源密集型 Web 应用中观察到的卡顿问题。

**另外推荐一个我的美化aistudio页面的 greasyfork 脚本：[link](https://greasyfork.org/zh-CN/scripts/543479-google-aistudio-%E8%81%8A%E5%A4%A9%E7%95%8C%E9%9D%A2%E7%BE%8E%E5%8C%96)**