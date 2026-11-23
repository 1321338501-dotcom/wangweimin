# 提示词记录 · wangweimin_prompt.md

> 每次向 AI 发出开发指令后追加记录：时间 | 提示词全文 | 大模型名称。禁止覆盖。

---

## 2026-11-19 19:40 | DeepSeek-V4.1-Flash

```
在当前项目根目录创建 AGENTS.md，写入以下规则。

## 项目结构与技术栈
- 前端：frontend/ 目录
  - 原生 HTML、CSS、JavaScript，禁止使用任何第三方库、框架、CDN 链接
  - 目录结构：frontend/ 下建 css/、js/、fonts/、images/ 子目录；fonts/ 存放 iconfont 图标文件（如果有）
- 后端：backend/ 目录，Node.js + Express，RESTful+MVC 风格，所有接口以 /api/ 为前缀，端口固定为 8617（学号 24001010617 后三位为 617）。
- 使用 express.static 托管 frontend/ 静态资源目录。
- 后端通过 cors 中间件开放全部跨域访问，本配置仅用于课程作业。
- 后端依赖安装：预先将 npm 源切换为国内镜像：npm config set registry https://registry.npmmirror.com
- 后端依赖安装：npm i 包名
- 数据库：MySQL（用户名 root、密码：****）
- 数据库凭据写入 backend/.env（变量名：DB_USER、DB_PASSWORD、DB_HOST、DB_NAME），不得出现在代码或 AGENTS.md 中；.env 同时加入 .gitignore
- 根据后端的要求自行建立和修改数据库表，每张表建立后，插入至少 8 条有真实业务意义的测试数据

## 命名与注释
- CSS 类名、JS 变量名、JS 函数名、数据库表名（及字段相关命名）一律以 wwm_ 开头
- 每个文件头部包含注释块：姓名：王伟民 | 学号：24001010617 | 时间：yyyy-mm-dd | 大模型：{本次使用的大模型名称}

## 记录文件（一律追加写入，禁止覆盖已有内容）
- wangweimin_prompt.md（项目根目录）：每次向 AI 发出开发指令后，追加记录：时间 | 提示词全文 | 大模型名称
- backend/wwm_interface.md：每次创建或修改接口后，追加：接口路径 | HTTP 方法 | 请求参数（含示例）| 响应格式（含 JSON 示例）| 修改时间
- backend/wwm_database.md：每次建表、改表或插入数据后，按执行顺序追加对应 SQL 语句（含测试数据的 INSERT），要求仅凭此文件即可在新机器上完整重建数据库
- 统一 JSON 响应格式：{ "code": 0, "msg": "提示信息", "data": {...} }，code=0 表示成功，非 0 表示失败

## 前端约定
- 服务器返回的数据和错误信息输出到浏览器控制台（console.log / console.error）；
- 新建 HTML 页面后，在 frontend/index.html 中追加超链接入口；文件名包含 detail 的页面除外
```

---

## 2026-11-19 19:45 | DeepSeek-V4.1-Flash

```
请初始化本项目：
1、git init + .gitignore（排除 node_modules、.env）+ 首次提交
2、按 AGENTS.md 规则创建前后端目录骨架、安装依赖、
3、创建前端首页 index.html，包括姓名王伟民、学号24001010617、项目名称、项目类别（自选、模仿），所有完成的 html 页面的超链接。有 canvas 背景动画。主体是页面链接导航。页面美观。
4、创建 readme.md，在根目录下，包括学号、姓名。
```

---

## 2026-11-19 19:50 | DeepSeek-V4.1-Flash

```
创建运行后台的 bat 文件，放在项目根目录：
1、自动切换到 backend 目录再启动（用 %~dp0，双击时不受当前路径影响）；
2、使用 chcp 65001 避免中文日志乱码；
3、启动命令与 package.json 中的脚本保持一致；
4、结尾加 pause，出错时窗口不关闭。
```

---

## 2026-11-19 19:55 | DeepSeek-V4.1-Flash

```
在 frontend/ 下创建 database.html：
1、页面有用户名、密码两个输入框，默认用户名 root，密码默认 7166，一个"测试连接"按钮；
2、点击后调用后端接口 /api/db-test，把用户名密码发给后端；
3、后端用 mysql2 尝试连接 MySQL，成功返回 { code:0, msg:"数据库连接成功", data:{ 数据库版本 } }，失败返回 code 非 0 和错误信息；
4、前端把结果显示在页面上：成功用绿色，失败用红色，同时在控制台输出；
5、数据库凭据从 backend/.env 读取，不要写死在代码里；
6、完成后在 frontend/index.html 加上本页面的超链接入口。
```

---

## 2026-11-19 20:00 | DeepSeek-V4.1-Flash

```
完成科技新闻列表页面：
1、在 MySQL 中建表 wwm_news，字段包含：id、title、summary、content、source、publish_time、cover_img；
2、插入至少 8 条真实的科技新闻测试数据；
3、后端提供 GET /api/news 接口，返回全部新闻（按发布时间倒序），统一 JSON 格式 { code, msg, data }；
4、新建 frontend/news.html，页面顶部显示当前调用的接口地址，下方以列表展示新闻标题、摘要、来源、时间；
5、数据用 fetch 获取，控制台输出返回数据；
6、把建表与插入数据的 SQL 追加写入 backend/wwm_database.md，接口信息追加写入 backend/wwm_interface.md，本次提示词追加写入 wangweimin_prompt.md；
7、在 frontend/index.html 增加入口链接。
```

---

## 2026-11-19 20:05 | DeepSeek-V4.1-Flash

```
完成图文列表页面：
1、在 MySQL 中新建表 wwm_gallery，字段：id、title、description、img_url、category、create_time，插入至少 8 条测试数据；
2、后端提供 GET /api/gallery 接口，返回全部图文数据；
3、新建 frontend/gallery.html，页面顶部显示接口地址，下方用网格布局展示"上图下文"卡片：图片、标题、描述；
4、图片加载失败时显示占位色块，不要出现破图图标；
5、页面适配手机宽度；
6、记录写入 backend/wwm_database.md、backend/wwm_interface.md 和 wangweimin_prompt.md，并在首页加入口。
```

---

## 2026-11-19 20:10 | DeepSeek-V4.1-Flash

```
https://spontaneous-valkyrie-4e4229.netlify.app/fullstack-init-lesson 仔细看里面的要求 把所有wangyao改为wangweimin 所有wy改为wwm 我的学号是24001010617 密码是7166 姓名是王伟民
```

---

## 2026-11-19 21:10 | DeepSeek-V4.1-Flash

```
好的，按这个方案改（database.html 密码框默认填入 wwm123）
```

---

## 2026-11-19 21:20 | DeepSeek-V4.1-Flash

```
我swiper
```

---

## 2026-11-23 13:30 | DeepSeek-V4.1-Flash

```
https://spontaneous-valkyrie-4e4229.netlify.app/llm-app-lesson 仔细看里面的要求 需要什么东西跟我说
```

---

## 2026-11-23 13:40 | DeepSeek-V4.1-Flash

```
sk-****（硅基流动 API Key，已脱敏）
```

> 说明：本次按《大模型应用 · 全栈接入》课程要求，在既有全栈项目上新增
> `POST /api/chat`、`GET /api/chat/config` 两个接口，以及 chat.html（AI 聊天）与
> service.html（中华美食街在线客服）两个页面，Key 仅写入 backend/.env。

---

## 2026-11-23 13:55 | DeepSeek-V4.1-Flash

```
sk-****（七牛云 API Key，已脱敏）
```

> 说明：将七牛云 Key 填入 backend/.env 的 QINIU_API_KEY，重启后端后
> /api/chat/config 返回两个平台均可用，平台下拉热切换验证通过。

---

## 2026-11-23 14:05 | DeepSeek-V4.1-Flash

```
好的，开始测试任务二
```

> 说明：用客服 system 人设测试 5 个问题（3 个该答、2 个该拒），5/5 通过。

---

## 2026-11-23 14:15 | DeepSeek-V4.1-Flash

```
好的，按这个方案微调提示词
```

> 说明：在 service.html 的 system 提示词中补充「回答三类问题时不要附加拒绝话术」，
> 修复了正常问题结尾多一句引导留言的瑕疵，重测 5 个问题全部干净通过。

---

## 2026-11-23 14:25 | DeepSeek-V4.1-Flash

```
好的，把真实数据写进提示词
```

> 说明：把营业时间（10:00-22:00，节假日不休）、招牌菜（麻辣香锅/水煮鱼/糖醋里脊）、
> 配送范围（三环内、满 30 元起送、配送费 5 元）写进 system 提示词并强调不得编造，
> 解决同一问题多次回答不一致的幻觉问题，重测 7 个问题全部稳定一致。

---

## 2026-11-23 14:40 | DeepSeek-V4.1-Flash

```
完成知识库文件上传功能，构建2个知识库文件，完成基于知识库的问答，支持doc和docx，ppt，完成知识库管理（RAG）：基于本地文件（如 PDF/TXT）上传、解析，构建专属自动客服或问答系统，包括知识库文件上传模块。在控制台输出发送给大模型的数据和接受自大模型的数据。完成图像识别功能，上传图片，返回该图片的描述，使用已有的api-key和模型。实现一个语音识别的功能，使用七牛的Qwen-Audio-3.0-ASR-Flash模型，输入语音，输出文字。
```

> 说明：新增 RAG 知识库（上传/解析/分块/向量化/检索问答/删除）、图像识别、语音识别三块能力，
> 共 6 个接口 + 3 个页面；构建 2 个知识库文件；图像用 Qwen/Qwen3-VL-32B-Instruct，
> 语音用 qwen-audio-3.0-asr-flash（小写 id 才可用）。
