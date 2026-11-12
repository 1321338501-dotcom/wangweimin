const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const wwm_port = 3004;

// 允许跨域：页面用 file:// 或其他端口打开也能请求本接口
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 静态文件服务：把项目根目录暴露出去，可通过 http://localhost:3004/poems.html 访问页面
app.use(express.static(path.join(__dirname, '..')));

// 读取 db.json
const dataPath = path.join(__dirname, 'db.json');
function readDb() {
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

// 接口 1：返回 poems 数组
app.get('/api/poems', (req, res) => {
  const db = readDb();
  res.json(db.poems || []);
});

// 接口 2：返回 authors 作者列表（任务二）
app.get('/api/authors', (req, res) => {
  const db = readDb();
  res.json(db.authors || []);
});

app.listen(wwm_port, () => {
  console.log(`数据服务器已启动：http://localhost:${wwm_port}/api/poems`);
  console.log(`作者接口：http://localhost:${wwm_port}/api/authors`);
});
