# CyberChef 中文版

[![](https://img.shields.io/github/v/release/shadowhunter1024/CyberChef-Chinese?label=%E4%B8%8B%E8%BD%BD%E6%9C%80%E6%96%B0%E7%89%88)](https://github.com/shadowhunter1024/CyberChef-Chinese/releases/latest)
[![](https://img.shields.io/badge/%E5%9C%A8%E7%BA%BF%E4%BD%BF%E7%94%A8-GitHub%20Pages-brightgreen)](https://shadowhunter1024.github.io/CyberChef-Chinese/)
[![](https://github.com/shadowhunter1024/CyberChef-Chinese/actions/workflows/zh-CN-release.yml/badge.svg?branch=zh-CN)](https://github.com/shadowhunter1024/CyberChef-Chinese/actions/workflows/zh-CN-release.yml)
[![](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/shadowhunter1024/CyberChef-Chinese/blob/zh-CN/LICENSE)

#### *网络瑞士军刀*

本仓库是 [GCHQ CyberChef](https://github.com/gchq/CyberChef) 的中文汉化版，界面、分类、全部操作的名称和说明都已翻译为中文，并持续跟进官方更新。[English README](https://github.com/shadowhunter1024/CyberChef-Chinese/blob/zh-CN/README.md)

## 在线使用

**中文在线版：<https://shadowhunter1024.github.io/CyberChef-Chinese/>**

打开即可使用。所有数据都在你的浏览器本地处理，不会上传到服务器。

## 下载离线版

**最新中文版离线包：<https://github.com/shadowhunter1024/CyberChef-Chinese/releases/latest>**

在 Release 页面下载 `CyberChef_v<版本号>_zh-CN.zip`，解压后双击其中的 `CyberChef_v<版本号>.html` 即可在浏览器中离线使用，不需要安装，也不需要联网。所有历史版本见 [Releases 列表](https://github.com/shadowhunter1024/CyberChef-Chinese/releases)。

- 页面右上角的“English / 中文”链接可以切换界面语言。
- 汉化只改变显示文字。配方、分享链接和收藏夹中使用的仍是英文操作名，因此与官方版本完全互通：中文版保存的配方可以在官方版中打开，反之亦然。
- 汉化的实现方式、目录结构和同步官方更新的方法见 [I18N.md](https://github.com/shadowhunter1024/CyberChef-Chinese/blob/zh-CN/I18N.md)。

## 简介

CyberChef 是一个简单、直观的 Web 应用，可以在浏览器中完成各种“网络”相关的操作。这些操作包括 XOR、Base64 等简单编码，AES、DES、Blowfish 等更复杂的加密，生成二进制和十六进制转储，数据的压缩和解压，计算哈希和校验和，解析 IPv6 和 X.509，转换字符编码，等等。

这个工具的目标是让技术和非技术分析人员都能以复杂的方式处理数据，而无需使用复杂的工具或算法。它由一名分析师利用 10% 的创新时间，历经数年构思、设计、构建并逐步完善。

## 目录

- [在线使用](#在线使用)
- [下载离线版](#下载离线版)
- [官方网站](#官方网站)
- [本地运行](#本地运行)
  - [使用 Docker](#使用-docker)
  - [从源码构建](#从源码构建)
- [使用方法](#使用方法)
- [功能特性](#功能特性)
- [深度链接](#深度链接)
- [浏览器支持](#浏览器支持)
- [Node.js 支持](#nodejs-支持)
- [安全](#安全)
- [参与贡献](#参与贡献)
- [许可证](#许可证)

## 官方网站

- 中文在线版：<https://shadowhunter1024.github.io/CyberChef-Chinese/>
- [CyberChef 官方网站（英文）](https://gchq.github.io/CyberChef)

## 本地运行

可以使用 Docker 运行（无需安装开发工具链），也可以用 Node.js 从源码构建。

### 使用 Docker

**前提条件**

- [Docker](https://www.docker.com/products/docker-desktop/)
  - Docker Desktop 必须已经打开并在运行

#### 方式一：自行构建 Docker 镜像（中文版）

1. 克隆本仓库并构建镜像
```bash
git clone https://github.com/shadowhunter1024/CyberChef-Chinese.git
cd CyberChef
docker build --tag cyberchef-zh --ulimit nofile=10000 .
```
2. 运行容器
```bash
docker run -it -p 8080:8080 cyberchef-zh
```
3. 在浏览器中访问 `http://localhost:8080`

#### 方式二：使用官方预构建镜像（英文版）

如果想跳过构建过程，可以使用官方预构建的镜像。注意它是官方英文版，不包含汉化：

```bash
docker run -it -p 8080:8080 ghcr.io/gchq/cyberchef:latest
```

同样在浏览器中访问 `http://localhost:8080`。

### 从源码构建

如果想开发 CyberChef，或者不使用 Docker 运行，可以直接用 Node.js 构建。

**前提条件**

- [Node.js](https://nodejs.org/) `v24`（参见 [Node.js 支持](#nodejs-支持)）

> [!NOTE]
> 可以使用 [nvm](https://github.com/nvm-sh/nvm) 管理 Node.js 版本，并使用[本项目](https://github.com/shadowhunter1024/CyberChef-Chinese/blob/zh-CN/.nvmrc)指定的开发版本，避免与机器上的其他项目冲突。

**准备**

```bash
git clone https://github.com/shadowhunter1024/CyberChef-Chinese.git
cd CyberChef
npm install
```

**常用命令**

| 命令 | 说明 |
| --- | --- |
| `npm start` | 启动带实时重载的开发服务器，地址为 `http://localhost:8080`。 |
| `npm run build` | 生成生产构建，输出到 `build/prod` 目录。 |
| `npm test` | 运行 Node.js 和操作测试。 |
| `npm run testui` | 运行浏览器（UI）测试。 |
| `npm run lint` | 按代码规范检查代码。 |
| `npm run newop` | 通过交互式脚本创建新操作的框架。 |
| `node scripts/i18n-check.mjs` | 检查汉化覆盖情况（本中文版新增）。 |

如果构建时遇到内存不足的错误，可以用 `npm run setheapsize` 增大 Node 的堆内存。

## 使用方法

CyberChef 有四个主要区域：

 1. 右上方的**输入**框，可以在这里粘贴、输入或拖入要处理的文本或文件。
 2. 右下方的**输出**框，处理结果会显示在这里。
 3. 最左侧的**操作**列表，按分类列出了 CyberChef 能执行的所有操作，也可以通过搜索查找（中英文名称都可以搜索）。
 4. 中间的**配方**区域，把要使用的操作拖到这里，并设置参数和选项。

可以用简单或复杂的方式组合任意多个操作。以下是一些示例（点击即可在中文在线版中打开）：

 - [解码 Base64 编码的字符串][2]
 - [将日期时间转换到不同时区][3]
 - [解析 Teredo IPv6 地址][4]
 - [从十六进制转储还原数据，然后解压][5]
 - [解密并反汇编 shellcode][6]
 - [将多个时间戳显示为完整日期][7]
 - [对不同类型的数据执行不同的操作][8]
 - [将输入的一部分用作操作的参数][9]
 - [执行 AES 解密，并从密文流开头提取 IV][10]
 - [用更简单的方式执行同样的 AES 解密][13]
 - [自动检测多层嵌套编码][12]


## 功能特性

 - 拖放
     - 可以把操作拖入或拖出配方列表，也可以调整顺序。
     - 最大约 2GB 的文件可以直接拖到输入框中，加载到浏览器里。
 - 自动烘焙
     - 每当修改输入或配方时，CyberChef 都会自动“烘焙”并立即生成输出。
     - 如果影响性能（例如输入非常大），可以关闭自动烘焙，改为手动执行。
 - 自动检测编码
     - CyberChef 使用[多种技术](https://github.com/gchq/CyberChef/wiki/Automatic-detection-of-encoded-data-using-CyberChef-Magic)自动检测数据使用了哪些编码。如果找到合适的操作来解读数据，会在输出栏中显示“Magic”图标，点击即可解码。
 - 断点
     - 可以在配方中的任意操作上设置断点，在执行该操作前暂停。
     - 也可以逐个操作单步执行配方，查看数据在每个阶段的样子。
 - 保存和加载配方
     - 如果你做出了一个以后还想再用的好配方，只需点击“保存配方”并保存到本地存储，下次打开 CyberChef 时它还在。
     - 也可以复制包含配方和输入的 URL，方便地分享给他人。
 - 搜索
     - 如果知道要用的操作名称或相关词语，在搜索框中输入，匹配的操作会立即显示出来。中文版同时支持中文和英文搜索。
 - 高亮
     - 在输入或输出中选中文本时，会显示偏移和长度，并在可能的情况下高亮输出或输入中对应的数据（示例：[在输入中选中单词“question”，看看它出现在输出的什么位置][11]）。
 - 保存为文件和从文件加载
     - 可以随时把输出保存为文件，也可以把文件拖放到输入框中加载。支持最大约 2GB 的文件（取决于浏览器），但对这么多数据运行某些操作可能会花费很长时间。
 - CyberChef 完全在客户端运行
     - 需要说明的是，你的配方配置和输入（文本或文件）都不会被发送到 CyberChef 的 Web 服务器，所有处理都在你自己电脑的浏览器中完成。
     - 中文在线版部署在 GitHub Pages 上，同样只是一组静态文件，不会收集任何数据。
     - 因此 CyberChef 可以下载到本地运行。可以通过[本仓库的 Releases](https://github.com/shadowhunter1024/CyberChef-Chinese/releases/latest) 下载完整的中文版离线包，放进虚拟机、分享给他人，或部署在封闭网络中。


## 深度链接

通过修改 CyberChef URL 的 hash 部分，可以改变页面打开时的初始设置。
格式为 `https://shadowhunter1024.github.io/CyberChef-Chinese/#recipe=Operation()&input=...`

支持的参数有 `recipe`、`input`（Base64 编码）和 `theme`。其中操作名使用英文，例如 `recipe=From_Base64('A-Za-z0-9%2B/%3D',true)`。把链接中的 `https://shadowhunter1024.github.io/CyberChef-Chinese/` 换成 `https://gchq.github.io/CyberChef/`，同一个配方就能在官方版中打开，反之亦然。


## 浏览器支持

CyberChef 支持以下浏览器：

 - Google Chrome 50+
 - Mozilla Firefox 38+


## Node.js 支持

CyberChef 完全支持 Node.js `v24`，并提前针对 Node.js `v26` 进行了测试，以便其成为活跃 LTS 版本时使用。更多信息请参阅 [“Node API” wiki 页面](https://github.com/gchq/CyberChef/wiki/Node-API)。汉化只影响 Web 界面，Node API 保持与官方一致。


## 安全

请参阅 [CyberChef 安全策略](https://github.com/shadowhunter1024/CyberChef-Chinese/blob/zh-CN/SECURITY.md)。


## 参与贡献

- **汉化相关**（译文错误、遗漏的界面文字等）：欢迎在[本仓库](https://github.com/shadowhunter1024/CyberChef-Chinese/issues)提交 issue 或 PR。添加和修改译文的方法见 [I18N.md](https://github.com/shadowhunter1024/CyberChef-Chinese/blob/zh-CN/I18N.md)。
- **CyberChef 功能本身**（新操作、错误修复等）：请提交到[官方仓库](https://github.com/gchq/CyberChef)。

为 CyberChef 贡献一个新操作非常简单，快速入门脚本会一步步引导你完成。只要会写基本的 JavaScript，就能编写 CyberChef 操作。安装说明、添加新操作和主题的指南、仓库结构、可用的数据类型以及编码规范都可以在 [“Contributing” wiki 页面](https://github.com/gchq/CyberChef/wiki/Contributing)中找到。

 - 把修改推送到你的 fork。
 - 向官方仓库提交 pull request。第一次提交时，PR 上的 CLA 助手会提示你签署 [GCHQ 贡献者许可协议](https://cla-assistant.io/gchq/CyberChef)，同时会询问你是否愿意让 GCHQ 就感谢礼品或 GCHQ 的工作机会与你联系。


## 许可证

CyberChef 基于 [Apache 2.0 许可证](https://www.apache.org/licenses/LICENSE-2.0)发布，受 [Crown Copyright（英国王室版权）](https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/)保护。本中文版沿用相同的许可证。


  [2]: https://shadowhunter1024.github.io/CyberChef-Chinese/#recipe=From_Base64('A-Za-z0-9%2B/%3D',true)&input=VTI4Z2JHOXVaeUJoYm1RZ2RHaGhibXR6SUdadmNpQmhiR3dnZEdobElHWnBjMmd1
  [3]: https://shadowhunter1024.github.io/CyberChef-Chinese/#recipe=Translate_DateTime_Format('Standard%20date%20and%20time','DD/MM/YYYY%20HH:mm:ss','UTC','dddd%20Do%20MMMM%20YYYY%20HH:mm:ss%20Z%20z','Australia/Queensland')&input=MTUvMDYvMjAxNSAyMDo0NTowMA
  [4]: https://shadowhunter1024.github.io/CyberChef-Chinese/#recipe=Parse_IPv6_address()&input=MjAwMTowMDAwOjQxMzY6ZTM3ODo4MDAwOjYzYmY6M2ZmZjpmZGQy
  [5]: https://shadowhunter1024.github.io/CyberChef-Chinese/#recipe=From_Hexdump()Gunzip()&input=MDAwMDAwMDAgIDFmIDhiIDA4IDAwIDEyIGJjIGYzIDU3IDAwIGZmIDBkIGM3IGMxIDA5IDAwIDIwICB8Li4uLi6881cu/y7HwS4uIHwKMDAwMDAwMTAgIDA4IDA1IGQwIDU1IGZlIDA0IDJkIGQzIDA0IDFmIGNhIDhjIDQ0IDIxIDViIGZmICB8Li7QVf4uLdMuLsouRCFb/3wKMDAwMDAwMjAgIDYwIGM3IGQ3IDAzIDE2IGJlIDQwIDFmIDc4IDRhIDNmIDA5IDg5IDBiIDlhIDdkICB8YMfXLi6%2BQC54Sj8uLi4ufXwKMDAwMDAwMzAgIDRlIGM4IDRlIDZkIDA1IDFlIDAxIDhiIDRjIDI0IDAwIDAwIDAwICAgICAgICAgICB8TshObS4uLi5MJC4uLnw
  [6]: https://shadowhunter1024.github.io/CyberChef-Chinese/#recipe=RC4(%7B'option':'UTF8','string':'secret'%7D,'Hex','Hex')Disassemble_x86('64','Full%20x86%20architecture',16,0,true,true)&input=MjFkZGQyNTQwMTYwZWU2NWZlMDc3NzEwM2YyYTM5ZmJlNWJjYjZhYTBhYWJkNDE0ZjkwYzZjYWY1MzEyNzU0YWY3NzRiNzZiM2JiY2QxOTNjYjNkZGZkYmM1YTI2NTMzYTY4NmI1OWI4ZmVkNGQzODBkNDc0NDIwMWFlYzIwNDA1MDcxMzhlMmZlMmIzOTUwNDQ2ZGIzMWQyYmM2MjliZTRkM2YyZWIwMDQzYzI5M2Q3YTVkMjk2MmMwMGZlNmRhMzAwNzJkOGM1YTZiNGZlN2Q4NTlhMDQwZWVhZjI5OTczMzYzMDJmNWEwZWMxOQ
  [7]: https://shadowhunter1024.github.io/CyberChef-Chinese/#recipe=Fork('%5C%5Cn','%5C%5Cn',false)From_UNIX_Timestamp('Seconds%20(s)')&input=OTc4MzQ2ODAwCjEwMTI2NTEyMDAKMTA0NjY5NjQwMAoxMDgxMDg3MjAwCjExMTUzMDUyMDAKMTE0OTYwOTYwMA
  [8]: https://shadowhunter1024.github.io/CyberChef-Chinese/#recipe=Fork('%5C%5Cn','%5C%5Cn',false)Conditional_Jump('1',false,'base64',10)To_Hex('Space')Return()Label('base64')To_Base64('A-Za-z0-9%2B/%3D')&input=U29tZSBkYXRhIHdpdGggYSAxIGluIGl0ClNvbWUgZGF0YSB3aXRoIGEgMiBpbiBpdA
  [9]: https://shadowhunter1024.github.io/CyberChef-Chinese/#recipe=Register('key%3D(%5B%5C%5Cda-f%5D*)',true,false)Find_/_Replace(%7B'option':'Regex','string':'.*data%3D(.*)'%7D,'$1',true,false,true)RC4(%7B'option':'Hex','string':'$R0'%7D,'Hex','Latin1')&input=aHR0cDovL21hbHdhcmV6LmJpei9iZWFjb24ucGhwP2tleT0wZTkzMmE1YyZkYXRhPThkYjdkNWViZTM4NjYzYTU0ZWNiYjMzNGUzZGIxMQ
  [10]: https://shadowhunter1024.github.io/CyberChef-Chinese/#recipe=Register('(.%7B32%7D)',true,false,false)Drop_bytes(0,32,false)AES_Decrypt(%7B'option':'Hex','string':'1748e7179bd56570d51fa4ba287cc3e5'%7D,%7B'option':'Hex','string':'$R0'%7D,16,'CTR','Hex','Raw',%7B'option':'Hex','string':''%7D,%7B'option':'Hex','string':''%7D,'Off')&input=NTFlMjAxZDQ2MzY5OGVmNWY3MTdmNzFmNWI0NzEyYWYyMGJlNjc0YjNiZmY1M2QzODU0NjM5NmVlNjFkYWFjNDkwOGUzMTljYTNmY2Y3MDg5YmZiNmIzOGVhOTllNzgxZDI2ZTU3N2JhOWRkNmYzMTFhMzk0MjBiODk3OGU5MzAxNGIwNDJkNDQ3MjZjYWVkZjU0MzZlYWY2NTI0MjljMGRmOTRiNTIxNjc2YzdjMmNlODEyMDk3YzI3NzI3M2M3YzcyY2Q4OWFlYzhkOWZiNGEyNzU4NmNjZjZhYTBhZWUyMjRjMzRiYTNiZmRmN2FlYjFkZGQ0Nzc2MjJiOTFlNzJjOWU3MDlhYjYwZjhkYWY3MzFlYzBjYzg1Y2UwZjc0NmZmMTU1NGE1YTNlYzI5MWNhNDBmOWU2MjlhODcyNTkyZDk4OGZkZDgzNDUzNGFiYTc5YzFhZDE2NzY3NjlhN2MwMTBiZjA0NzM5ZWNkYjY1ZDk1MzAyMzcxZDYyOWQ5ZTM3ZTdiNGEzNjFkYTQ2OGYxZWQ1MzU4OTIyZDJlYTc1MmRkMTFjMzY2ZjMwMTdiMTRhYTAxMWQyYWYwM2M0NGY5NTU3OTA5OGExNWUzY2Y5YjQ0ODZmOGZmZTljMjM5ZjM0ZGU3MTUxZjZjYTY1MDBmZTRiODUwYzNmMWMwMmU4MDFjYWYzYTI0NDY0NjE0ZTQyODAxNjE1YjhmZmFhMDdhYzgyNTE0OTNmZmRhN2RlNWRkZjMzNjg4ODBjMmI5NWIwMzBmNDFmOGYxNTA2NmFkZDA3MWE2NmNmNjBlNWY0NmYzYTIzMGQzOTdiNjUyOTYzYTIxYTUzZg
  [11]: https://shadowhunter1024.github.io/CyberChef-Chinese/#recipe=XOR(%7B'option':'Hex','string':'3a'%7D,'Standard',false)To_Hexdump(16,false,false)&input=VGhlIGFuc3dlciB0byB0aGUgdWx0aW1hdGUgcXVlc3Rpb24gb2YgbGlmZSwgdGhlIFVuaXZlcnNlLCBhbmQgZXZlcnl0aGluZyBpcyA0Mi4
  [12]: https://shadowhunter1024.github.io/CyberChef-Chinese/#recipe=Magic(3,false,false)&input=V1VhZ3dzaWFlNm1QOGdOdENDTFVGcENwQ0IyNlJtQkRvREQ4UGFjZEFtekF6QlZqa0syUXN0RlhhS2hwQzZpVVM3UkhxWHJKdEZpc29SU2dvSjR3aGptMWFybTg2NHFhTnE0UmNmVW1MSHJjc0FhWmM1VFhDWWlmTmRnUzgzZ0RlZWpHWDQ2Z2FpTXl1QlY2RXNrSHQxc2NnSjg4eDJ0TlNvdFFEd2JHWTFtbUNvYjJBUkdGdkNLWU5xaU45aXBNcTFaVTFtZ2tkYk51R2NiNzZhUnRZV2hDR1VjOGc5M1VKdWRoYjhodHNoZVpud1RwZ3FoeDgzU1ZKU1pYTVhVakpUMnptcEM3dVhXdHVtcW9rYmRTaTg4WXRrV0RBYzFUb291aDJvSDRENGRkbU5LSldVRHBNd21uZ1VtSzE0eHdtb21jY1BRRTloTTE3MkFQblNxd3hkS1ExNzJSa2NBc3lzbm1qNWdHdFJtVk5OaDJzMzU5d3I2bVMyUVJQ
  [13]: https://shadowhunter1024.github.io/CyberChef-Chinese/#recipe=AES_Decrypt(%7B'option':'Hex','string':'1748e7179bd56570d51fa4ba287cc3e5'%7D,%7B'option':'Hex','string':'$R0'%7D,16,'CTR','Hex','Raw',%7B'option':'Hex','string':''%7D,%7B'option':'Hex','string':''%7D,'From%20start')&input=NTFlMjAxZDQ2MzY5OGVmNWY3MTdmNzFmNWI0NzEyYWYyMGJlNjc0YjNiZmY1M2QzODU0NjM5NmVlNjFkYWFjNDkwOGUzMTljYTNmY2Y3MDg5YmZiNmIzOGVhOTllNzgxZDI2ZTU3N2JhOWRkNmYzMTFhMzk0MjBiODk3OGU5MzAxNGIwNDJkNDQ3MjZjYWVkZjU0MzZlYWY2NTI0MjljMGRmOTRiNTIxNjc2YzdjMmNlODEyMDk3YzI3NzI3M2M3YzcyY2Q4OWFlYzhkOWZiNGEyNzU4NmNjZjZhYTBhZWUyMjRjMzRiYTNiZmRmN2FlYjFkZGQ0Nzc2MjJiOTFlNzJjOWU3MDlhYjYwZjhkYWY3MzFlYzBjYzg1Y2UwZjc0NmZmMTU1NGE1YTNlYzI5MWNhNDBmOWU2MjlhODcyNTkyZDk4OGZkZDgzNDUzNGFiYTc5YzFhZDE2NzY3NjlhN2MwMTBiZjA0NzM5ZWNkYjY1ZDk1MzAyMzcxZDYyOWQ5ZTM3ZTdiNGEzNjFkYTQ2OGYxZWQ1MzU4OTIyZDJlYTc1MmRkMTFjMzY2ZjMwMTdiMTRhYTAxMWQyYWYwM2M0NGY5NTU3OTA5OGExNWUzY2Y5YjQ0ODZmOGZmZTljMjM5ZjM0ZGU3MTUxZjZjYTY1MDBmZTRiODUwYzNmMWMwMmU4MDFjYWYzYTI0NDY0NjE0ZTQyODAxNjE1YjhmZmFhMDdhYzgyNTE0OTNmZmRhN2RlNWRkZjMzNjg4ODBjMmI5NWIwMzBmNDFmOGYxNTA2NmFkZDA3MWE2NmNmNjBlNWY0NmYzYTIzMGQzOTdiNjUyOTYzYTIxYTUzZg
