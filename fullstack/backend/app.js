/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash */
'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const wwm_routes = require('./routes/wwm_routes');

const wwm_app = express();
const wwm_PORT = Number(process.env.PORT) || 8617;

// 课程作业：开放全部跨域访问
wwm_app.use(cors());
wwm_app.use(express.json());
wwm_app.use(express.urlencoded({ extended: false }));

// 所有接口统一 /api/ 前缀
wwm_app.use('/api', wwm_routes);

// 托管前端静态资源
wwm_app.use(express.static(path.join(__dirname, '..', 'frontend')));

// 接口 404
wwm_app.use('/api', function (wwm_req, wwm_res) {
  wwm_res.status(404).json({ code: 404, msg: '接口不存在：' + wwm_req.originalUrl, data: null });
});

// 统一错误处理
wwm_app.use(function (wwm_err, wwm_req, wwm_res, wwm_next) {
  console.error('[ERROR]', wwm_err.message);
  wwm_res.status(500).json({ code: 500, msg: '服务器内部错误：' + wwm_err.message, data: null });
});

wwm_app.listen(wwm_PORT, function () {
  console.log('Server running at http://localhost:' + wwm_PORT);
  console.log('健康检查：http://localhost:' + wwm_PORT + '/api/health');
});
