/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash */
'use strict';

// 统一的上传中间件：文件放内存，限制 25MB，知识库/图像/语音三处共用
const multer = require('multer');

const wwm_upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
});

module.exports = { wwm_upload };
