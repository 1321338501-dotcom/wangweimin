/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash */
'use strict';

const { wwm_pool } = require('../db');

async function wwm_getAllGallery() {
  const [wwm_rows] = await wwm_pool.query(
    'SELECT id, title, description, img_url, category, create_time FROM wwm_gallery ORDER BY create_time DESC'
  );
  return wwm_rows;
}

module.exports = { wwm_getAllGallery };
