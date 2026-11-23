/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash */
'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');

// 业务连接池：凭据来自 backend/.env，不写死在代码里
const wwm_pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wwm_fullstack',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

// 页面传什么用户名密码就测什么，用于 database.html
async function wwm_testConnection(wwm_user, wwm_password) {
  const wwm_conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: wwm_user,
    password: wwm_password
  });
  try {
    const [wwm_rows] = await wwm_conn.query('SELECT VERSION() AS wwm_version');
    return { wwm_version: wwm_rows[0].wwm_version };
  } finally {
    await wwm_conn.end();
  }
}

module.exports = { wwm_pool, wwm_testConnection };
