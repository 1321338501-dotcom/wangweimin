/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash */
'use strict';

// 知识库 RAG 控制器：上传解析 → 分块 → 向量化入库 → 检索 → 问答
const path = require('path');
const mammoth = require('mammoth');
const WordExtractor = require('word-extractor');
const AdmZip = require('adm-zip');
const pdfParse = require('pdf-parse');

const {
  wwm_listDocs, wwm_createDoc, wwm_addChunks, wwm_deleteDoc, wwm_getAllChunks
} = require('../models/wwm_kb');

const WWM_ALLOWED = ['txt', 'md', 'csv', 'json', 'pdf', 'doc', 'docx', 'ppt', 'pptx'];

function wwm_sfBase() {
  return (process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1').replace(/\/+$/, '');
}
function wwm_sfKey() {
  return process.env.SILICONFLOW_API_KEY || '';
}

// 修复中文文件名在 multipart 里被按 latin1 解码导致乱码的问题
function wwm_fixName(wwm_name) {
  try {
    const wwm_fixed = Buffer.from(wwm_name, 'latin1').toString('utf8');
    return wwm_fixed.indexOf('\uFFFD') === -1 ? wwm_fixed : wwm_name;
  } catch (wwm_err) {
    return wwm_name;
  }
}

// 从 pptx 的 slide XML 中提取 <a:t> 文本
function wwm_pptxText(wwm_buffer) {
  const wwm_zip = new AdmZip(wwm_buffer);
  const wwm_entries = wwm_zip.getEntries().filter(function (wwm_e) {
    return /^ppt\/slides\/slide\d+\.xml$/.test(wwm_e.entryName);
  });
  wwm_entries.sort(function (wwm_a, wwm_b) {
    const wwm_na = parseInt(wwm_a.entryName.replace(/\D/g, ''), 10) || 0;
    const wwm_nb = parseInt(wwm_b.entryName.replace(/\D/g, ''), 10) || 0;
    return wwm_na - wwm_nb;
  });
  const wwm_lines = [];
  wwm_entries.forEach(function (wwm_e) {
    const wwm_xml = wwm_zip.readAsText(wwm_e);
    const wwm_re = /<a:t>([\s\S]*?)<\/a:t>/g;
    let wwm_m;
    const wwm_slideLines = [];
    while ((wwm_m = wwm_re.exec(wwm_xml)) !== null) {
      wwm_slideLines.push(wwm_m[1]);
    }
    if (wwm_slideLines.length) {
      wwm_lines.push('【' + wwm_e.entryName.replace('ppt/slides/', '').replace('.xml', '') + '】\n' + wwm_slideLines.join(''));
    }
  });
  return wwm_lines.join('\n\n')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// 老式 .ppt 二进制文件：尽力而为地抽取可读文本（UTF-16LE 与单字节两路扫描）
function wwm_legacyPptText(wwm_buffer) {
  const wwm_pattern = /[\u4e00-\u9fa5A-Za-z0-9，。！？、：；（）《》“”‘’%·\-—\s]{6,}/g;
  function wwm_collect(wwm_str) {
    const wwm_out = [];
    let wwm_m;
    while ((wwm_m = wwm_pattern.exec(wwm_str)) !== null) {
      const wwm_s = wwm_m[0].replace(/\s+/g, ' ').trim();
      if (/[\u4e00-\u9fa5]{2,}/.test(wwm_s)) { wwm_out.push(wwm_s); }
    }
    return wwm_out;
  }
  const wwm_a = wwm_collect(wwm_buffer.toString('utf16le'));
  const wwm_b = wwm_collect(wwm_buffer.toString('latin1'));
  const wwm_seen = {};
  const wwm_all = [];
  wwm_a.concat(wwm_b).forEach(function (wwm_s) {
    if (!wwm_seen[wwm_s]) { wwm_seen[wwm_s] = 1; wwm_all.push(wwm_s); }
  });
  return wwm_all.join('\n');
}

// 按扩展名解析出纯文本
async function wwm_extractText(wwm_buffer, wwm_ext) {
  if (wwm_ext === 'txt' || wwm_ext === 'md' || wwm_ext === 'csv' || wwm_ext === 'json') {
    return wwm_buffer.toString('utf8');
  }
  if (wwm_ext === 'docx') {
    const wwm_r = await mammoth.extractRawText({ buffer: wwm_buffer });
    return wwm_r.value || '';
  }
  if (wwm_ext === 'doc') {
    const wwm_doc = await new WordExtractor().extract(wwm_buffer);
    return wwm_doc.getBody() || '';
  }
  if (wwm_ext === 'pdf') {
    const wwm_r = await pdfParse(wwm_buffer);
    return wwm_r.text || '';
  }
  if (wwm_ext === 'pptx') {
    return wwm_pptxText(wwm_buffer);
  }
  if (wwm_ext === 'ppt') {
    return wwm_legacyPptText(wwm_buffer);
  }
  return '';
}

// 分块：按段落累积到约 500 字，块间保留 60 字重叠，便于上下文衔接
function wwm_splitChunks(wwm_text) {
  const wwm_clean = String(wwm_text || '')
    .replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  if (!wwm_clean) { return []; }

  const WWM_SIZE = 500;
  const WWM_OVERLAP = 60;
  const wwm_paras = wwm_clean.split(/\n+/).filter(function (wwm_p) { return wwm_p.trim(); });
  const wwm_chunks = [];
  let wwm_buf = '';

  for (let wwm_i = 0; wwm_i < wwm_paras.length; wwm_i++) {
    const wwm_p = wwm_paras[wwm_i].trim();
    if ((wwm_buf + '\n' + wwm_p).length > WWM_SIZE && wwm_buf) {
      wwm_chunks.push(wwm_buf.trim());
      wwm_buf = wwm_buf.slice(-WWM_OVERLAP) + '\n' + wwm_p;
    } else {
      wwm_buf = wwm_buf ? (wwm_buf + '\n' + wwm_p) : wwm_p;
    }
  }
  if (wwm_buf.trim()) { wwm_chunks.push(wwm_buf.trim()); }
  return wwm_chunks;
}

// 调用硅基流动向量接口，把文本转成向量（每批 8 条）
async function wwm_embed(wwm_texts) {
  if (!wwm_sfKey()) { throw new Error('未配置 SILICONFLOW_API_KEY，无法做向量化'); }
  const wwm_model = process.env.EMBEDDING_MODEL || 'BAAI/bge-m3';
  const wwm_vectors = [];
  const WWM_BATCH = 8;

  for (let wwm_i = 0; wwm_i < wwm_texts.length; wwm_i += WWM_BATCH) {
    const wwm_batch = wwm_texts.slice(wwm_i, wwm_i + WWM_BATCH);
    const wwm_payload = { model: wwm_model, input: wwm_batch };
    console.log('[向量→模型] ' + JSON.stringify({ model: wwm_model, inputCount: wwm_batch.length }));

    const wwm_resp = await fetch(wwm_sfBase() + '/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + wwm_sfKey() },
      body: JSON.stringify(wwm_payload)
    });
    if (!wwm_resp.ok) {
      const wwm_t = await wwm_resp.text();
      throw new Error('向量接口 HTTP ' + wwm_resp.status + '：' + wwm_t.slice(0, 200));
    }
    const wwm_json = await wwm_resp.json();
    const wwm_data = (wwm_json.data || []).slice().sort(function (wwm_a, wwm_b) {
      return (wwm_a.index || 0) - (wwm_b.index || 0);
    });
    console.log('[向量←模型] 返回 ' + wwm_data.length + ' 条向量，维度 ' + ((wwm_data[0] && wwm_data[0].embedding) || []).length);
    wwm_data.forEach(function (wwm_d) { wwm_vectors.push(wwm_d.embedding); });
  }
  return wwm_vectors;
}

// 余弦相似度
function wwm_cosine(wwm_a, wwm_b) {
  let wwm_dot = 0, wwm_na = 0, wwm_nb = 0;
  for (let wwm_i = 0; wwm_i < wwm_a.length; wwm_i++) {
    wwm_dot += wwm_a[wwm_i] * wwm_b[wwm_i];
    wwm_na += wwm_a[wwm_i] * wwm_a[wwm_i];
    wwm_nb += wwm_b[wwm_i] * wwm_b[wwm_i];
  }
  if (!wwm_na || !wwm_nb) { return 0; }
  return wwm_dot / (Math.sqrt(wwm_na) * Math.sqrt(wwm_nb));
}

// POST /api/kb/upload —— 上传并解析知识库文件
async function wwm_kbUpload(wwm_req, wwm_res) {
  if (!wwm_req.file) {
    return wwm_res.json({ code: 1, msg: '未收到文件，请选择要上传的知识库文件', data: null });
  }
  const wwm_name = wwm_fixName(wwm_req.file.originalname);
  const wwm_ext = path.extname(wwm_name).toLowerCase().replace('.', '');
  if (WWM_ALLOWED.indexOf(wwm_ext) === -1) {
    return wwm_res.json({ code: 1, msg: '不支持的文件类型：.' + wwm_ext + '（支持 ' + WWM_ALLOWED.join(' / ') + '）', data: null });
  }

  try {
    const wwm_text = await wwm_extractText(wwm_req.file.buffer, wwm_ext);
    if (!wwm_text || !wwm_text.trim()) {
      return wwm_res.json({ code: 1, msg: '未能从该文件中解析出文本（文件可能是扫描件或纯图片）', data: null });
    }

    let wwm_chunks = wwm_splitChunks(wwm_text);
    const WWM_MAX_CHUNKS = 60;
    if (wwm_chunks.length > WWM_MAX_CHUNKS) { wwm_chunks = wwm_chunks.slice(0, WWM_MAX_CHUNKS); }

    const wwm_vectors = await wwm_embed(wwm_chunks);
    const wwm_docId = await wwm_createDoc({
      wwm_filename: wwm_name,
      wwm_filetype: wwm_ext,
      wwm_filesize: wwm_req.file.size
    });
    await wwm_addChunks(wwm_docId, wwm_chunks.map(function (wwm_c, wwm_i) {
      return { wwm_content: wwm_c, wwm_embedding: wwm_vectors[wwm_i] };
    }));

    console.log('[知识库] 已入库 ' + wwm_name + '，分块 ' + wwm_chunks.length + ' 个');
    wwm_res.json({
      code: 0,
      msg: '上传成功',
      data: {
        wwm_doc_id: wwm_docId,
        wwm_filename: wwm_name,
        wwm_filetype: wwm_ext,
        wwm_chars: wwm_text.length,
        wwm_chunks: wwm_chunks.length
      }
    });
  } catch (wwm_err) {
    console.error('[kb-upload]', wwm_err.message);
    wwm_res.json({ code: 1, msg: '知识库文件处理失败：' + wwm_err.message, data: null });
  }
}

// GET /api/kb/docs —— 知识库文档列表
async function wwm_kbList(wwm_req, wwm_res) {
  try {
    const wwm_rows = await wwm_listDocs();
    wwm_res.json({ code: 0, msg: 'ok', data: { wwm_total: wwm_rows.length, wwm_list: wwm_rows } });
  } catch (wwm_err) {
    console.error('[kb-list]', wwm_err.message);
    wwm_res.json({ code: 1, msg: '读取知识库列表失败：' + wwm_err.message, data: null });
  }
}

// DELETE /api/kb/docs/:id —— 删除文档及其向量
async function wwm_kbDelete(wwm_req, wwm_res) {
  const wwm_id = parseInt(wwm_req.params.id, 10);
  if (!wwm_id) { return wwm_res.json({ code: 1, msg: '文档 id 不合法', data: null }); }
  try {
    const wwm_n = await wwm_deleteDoc(wwm_id);
    wwm_res.json({ code: 0, msg: wwm_n ? '已删除' : '文档不存在', data: { wwm_deleted: wwm_n } });
  } catch (wwm_err) {
    console.error('[kb-delete]', wwm_err.message);
    wwm_res.json({ code: 1, msg: '删除失败：' + wwm_err.message, data: null });
  }
}

// POST /api/kb/ask —— 基于知识库检索后问答
async function wwm_kbAsk(wwm_req, wwm_res) {
  const wwm_question = String((wwm_req.body && wwm_req.body.question) || '').trim();
  const wwm_topK = Math.min(Math.max(parseInt(wwm_req.body && wwm_req.body.topK, 10) || 4, 1), 8);
  if (!wwm_question) { return wwm_res.json({ code: 1, msg: '问题不能为空', data: null }); }
  if (!wwm_sfKey()) { return wwm_res.json({ code: 1, msg: '未配置 SILICONFLOW_API_KEY', data: null }); }

  try {
    const wwm_chunks = await wwm_getAllChunks();
    if (!wwm_chunks.length) {
      return wwm_res.json({ code: 1, msg: '知识库为空，请先上传知识库文件', data: null });
    }

    const wwm_qVec = (await wwm_embed([wwm_question]))[0];
    const wwm_scored = wwm_chunks.map(function (wwm_c) {
      let wwm_v = [];
      try { wwm_v = JSON.parse(wwm_c.embedding || '[]'); } catch (wwm_e) { wwm_v = []; }
      const wwm_score = wwm_v.length === wwm_qVec.length ? wwm_cosine(wwm_qVec, wwm_v) : -1;
      return { wwm_chunk: wwm_c, wwm_score: wwm_score };
    }).sort(function (wwm_a, wwm_b) { return wwm_b.wwm_score - wwm_a.wwm_score; }).slice(0, wwm_topK);

    const wwm_context = wwm_scored.map(function (wwm_s, wwm_i) {
      return '【片段' + (wwm_i + 1) + ' · 来自《' + (wwm_s.wwm_chunk.filename || '未知') + '》】\n' + wwm_s.wwm_chunk.content;
    }).join('\n\n');

    const wwm_payload = {
      model: process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4-Flash',
      messages: [
        {
          role: 'system',
          content: '你是知识库客服。只能依据「参考资料」回答问题，资料里没有的信息必须回答"资料中没有相关内容"，严禁编造。回答用中文，简洁准确。'
        },
        { role: 'user', content: '参考资料：\n' + wwm_context + '\n\n问题：' + wwm_question }
      ],
      temperature: 0.2,
      max_tokens: 800,
      stream: false
    };

    // 按要求：控制台输出发送给大模型的数据
    console.log('===== [知识库问答 → 发送给大模型] =====');
    console.log(JSON.stringify(wwm_payload, null, 2));

    const wwm_resp = await fetch(wwm_sfBase() + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + wwm_sfKey() },
      body: JSON.stringify(wwm_payload)
    });
    const wwm_text = await wwm_resp.text();
    if (!wwm_resp.ok) {
      console.error('[kb-ask] HTTP ' + wwm_resp.status + ' ' + wwm_text.slice(0, 300));
      return wwm_res.json({ code: wwm_resp.status, msg: '大模型返回错误（HTTP ' + wwm_resp.status + '）', data: null });
    }

    const wwm_json = JSON.parse(wwm_text);
    const wwm_answer = (wwm_json.choices && wwm_json.choices[0] && wwm_json.choices[0].message)
      ? wwm_json.choices[0].message.content : '';

    // 按要求：控制台输出接收自大模型的数据
    console.log('===== [知识库问答 ← 接收自大模型] =====');
    console.log(JSON.stringify(wwm_json, null, 2));

    const wwm_sources = [];
    const wwm_seen = {};
    wwm_scored.forEach(function (wwm_s) {
      const wwm_key = wwm_s.wwm_chunk.filename + '#' + wwm_s.wwm_chunk.id;
      if (wwm_seen[wwm_key]) { return; }
      wwm_seen[wwm_key] = 1;
      wwm_sources.push({
        wwm_doc: wwm_s.wwm_chunk.filename,
        wwm_chunk_id: wwm_s.wwm_chunk.id,
        wwm_score: Number(wwm_s.wwm_score.toFixed(4)),
        wwm_preview: String(wwm_s.wwm_chunk.content).slice(0, 80)
      });
    });

    wwm_res.json({
      code: 0,
      msg: 'ok',
      data: { wwm_answer: wwm_answer, wwm_sources: wwm_sources, wwm_model: wwm_payload.model }
    });
  } catch (wwm_err) {
    console.error('[kb-ask]', wwm_err.message);
    wwm_res.json({ code: 1, msg: '知识库问答失败：' + wwm_err.message, data: null });
  }
}

module.exports = { wwm_kbUpload, wwm_kbList, wwm_kbDelete, wwm_kbAsk };
