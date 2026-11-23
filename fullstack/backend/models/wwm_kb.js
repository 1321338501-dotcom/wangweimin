/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash */
'use strict';

const { wwm_pool } = require('../db');

// 知识库文档列表（按上传时间倒序）
async function wwm_listDocs() {
  const [wwm_rows] = await wwm_pool.query(
    'SELECT id, filename, filetype, filesize, chunk_count, create_time FROM wwm_kb_doc ORDER BY create_time DESC'
  );
  return wwm_rows;
}

// 新增一条文档记录，返回自增 id
async function wwm_createDoc(wwm_data) {
  const [wwm_res] = await wwm_pool.query(
    'INSERT INTO wwm_kb_doc (filename, filetype, filesize, chunk_count, create_time) VALUES (?, ?, ?, ?, NOW())',
    [wwm_data.wwm_filename, wwm_data.wwm_filetype, wwm_data.wwm_filesize, 0]
  );
  return wwm_res.insertId;
}

// 批量写入分块及其向量
async function wwm_addChunks(wwm_docId, wwm_chunks) {
  if (!wwm_chunks.length) { return; }
  const wwm_now = new Date();
  const wwm_values = wwm_chunks.map(function (wwm_c, wwm_i) {
    return [wwm_docId, wwm_i, wwm_c.wwm_content, JSON.stringify(wwm_c.wwm_embedding || []), wwm_now];
  });
  await wwm_pool.query(
    'INSERT INTO wwm_kb_chunk (doc_id, chunk_index, content, embedding, create_time) VALUES ?',
    [wwm_values]
  );
  await wwm_pool.query('UPDATE wwm_kb_doc SET chunk_count = ? WHERE id = ?', [wwm_chunks.length, wwm_docId]);
}

// 删除文档及其全部向量
async function wwm_deleteDoc(wwm_docId) {
  await wwm_pool.query('DELETE FROM wwm_kb_chunk WHERE doc_id = ?', [wwm_docId]);
  const [wwm_res] = await wwm_pool.query('DELETE FROM wwm_kb_doc WHERE id = ?', [wwm_docId]);
  return wwm_res.affectedRows;
}

// 取出全部分块（带来源文件名），用于相似度检索
async function wwm_getAllChunks() {
  const [wwm_rows] = await wwm_pool.query(
    'SELECT c.id, c.doc_id, c.chunk_index, c.content, c.embedding, d.filename ' +
    'FROM wwm_kb_chunk c LEFT JOIN wwm_kb_doc d ON d.id = c.doc_id'
  );
  return wwm_rows;
}

module.exports = { wwm_listDocs, wwm_createDoc, wwm_addChunks, wwm_deleteDoc, wwm_getAllChunks };
