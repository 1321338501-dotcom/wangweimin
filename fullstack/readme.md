# 全栈项目初始化实践

- 学号：24001010617
- 姓名：王伟民
- 项目类别：模仿（全栈项目初始化课堂案例）
- 技术栈：原生 HTML / CSS / JavaScript + Node.js + Express + MySQL

## 目录结构

```
fullstack-project/
├─ AGENTS.md                 项目规则（AI 必读）
├─ readme.md                 项目说明
├─ start.bat                 一键启动后端服务
├─ wangweimin_prompt.md      提示词记录（追加写入）
├─ frontend/                 前端静态资源（原生 HTML/CSS/JS）
│  ├─ index.html             首页（canvas 粒子动画 + 页面导航）
│  ├─ database.html          数据库连接测试
│  ├─ news.html              科技新闻列表
│  ├─ gallery.html           图文列表
│  ├─ css/  js/  images/  fonts/
└─ backend/                  后端（Node.js + Express，端口 8617）
   ├─ app.js                 服务入口
   ├─ db.js                  MySQL 连接池
   ├─ routes/                路由
   ├─ controllers/           控制器
   ├─ models/                数据模型
   ├─ scripts/init-db.js     建库建表 + 测试数据
   ├─ wwm_interface.md       接口记录（追加写入）
   └─ wwm_database.md        数据库记录（追加写入）
```

## 启动方式

1. 双击根目录 `start.bat`（或进入 `backend/` 执行 `node app.js`）
2. 浏览器访问 `http://localhost:8617`

## 数据库

- 数据库名：`wwm_fullstack`
- 表：`wwm_news`（科技新闻）、`wwm_gallery`（图文列表）
- 凭据放在 `backend/.env`，该文件不提交到 git
