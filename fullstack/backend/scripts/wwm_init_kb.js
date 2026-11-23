/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash */
'use strict';

// 只创建知识库相关表（不会动 wwm_news / wwm_gallery），可重复执行
// 用法：node scripts/wwm_init_kb.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

async function wwm_main() {
  const wwm_conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'wwm_fullstack'
  });
  try {
    await wwm_conn.query(
      'CREATE TABLE IF NOT EXISTS wwm_kb_doc (' +
      'id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT "主键",' +
      'filename VARCHAR(255) NOT NULL COMMENT "原始文件名",' +
      'filetype VARCHAR(20) NOT NULL DEFAULT "" COMMENT "扩展名",' +
      'filesize INT UNSIGNED NOT NULL DEFAULT 0 COMMENT "字节数",' +
      'chunk_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT "分块数量",' +
      'create_time DATETIME NOT NULL COMMENT "上传时间",' +
      'PRIMARY KEY (id),' +
      'KEY idx_kb_create_time (create_time)' +
      ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );
    await wwm_conn.query(
      'CREATE TABLE IF NOT EXISTS wwm_kb_chunk (' +
      'id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT "主键",' +
      'doc_id INT UNSIGNED NOT NULL COMMENT "所属文档 id",' +
      'chunk_index INT UNSIGNED NOT NULL DEFAULT 0 COMMENT "块序号",' +
      'content TEXT NOT NULL COMMENT "分块文本",' +
      'embedding MEDIUMTEXT COMMENT "向量 JSON",' +
      'create_time DATETIME NOT NULL COMMENT "创建时间",' +
      'PRIMARY KEY (id),' +
      'KEY idx_kb_doc (doc_id)' +
      ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );

    const [wwm_d] = await wwm_conn.query('SELECT COUNT(*) AS wwm_total FROM wwm_kb_doc');
    const [wwm_c] = await wwm_conn.query('SELECT COUNT(*) AS wwm_total FROM wwm_kb_chunk');
    console.log('知识库表就绪：wwm_kb_doc ' + wwm_d[0].wwm_total + ' 条，wwm_kb_chunk ' + wwm_c[0].wwm_total + ' 条');
  } finally {
    await wwm_conn.end();
  }
}

wwm_main().catch(function (wwm_err) {
  console.error('建表失败：' + wwm_err.message);
  process.exit(1);
});
