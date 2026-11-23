/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash */
'use strict';

const { wwm_pool, wwm_testConnection } = require('../db');

// GET /api/health
async function wwm_health(wwm_req, wwm_res) {
  let wwm_db = 'disconnected';
  try {
    await wwm_pool.query('SELECT 1');
    wwm_db = 'connected';
  } catch (wwm_err) {
    console.error('[health]', wwm_err.message);
  }
  wwm_res.json({
    code: 0,
    msg: 'ok',
    data: {
      wwm_name: '王伟民',
      wwm_student_id: '24001010617',
      wwm_port: Number(process.env.PORT) || 8617,
      wwm_node: process.version,
      wwm_database: wwm_db,
      wwm_time: new Date().toISOString()
    }
  });
}

// POST /api/db-test
async function wwm_dbTest(wwm_req, wwm_res) {
  const wwm_body = wwm_req.body || {};
  const wwm_user = wwm_body.username || 'root';
  const wwm_password = typeof wwm_body.password === 'string' ? wwm_body.password : '';
  try {
    const wwm_info = await wwm_testConnection(wwm_user, wwm_password);
    wwm_res.json({ code: 0, msg: '数据库连接成功', data: wwm_info });
  } catch (wwm_err) {
    console.error('[db-test]', wwm_err.message);
    wwm_res.json({ code: 1, msg: '数据库连接失败：' + wwm_err.message, data: null });
  }
}

module.exports = { wwm_health, wwm_dbTest };
