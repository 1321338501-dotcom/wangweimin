/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash */

// 知识库页面：上传解析、文档列表、删除、基于知识库问答
(function () {
  'use strict';

  var wwm_base = location.origin === 'null' || location.protocol === 'file:' ? 'http://localhost:8617' : location.origin;

  var wwm_fileInput = document.getElementById('wwmKbFile');
  var wwm_uploadBtn = document.getElementById('wwmKbUploadBtn');
  var wwm_status = document.getElementById('wwmKbStatus');
  var wwm_docsBox = document.getElementById('wwmKbDocs');

  var wwm_question = document.getElementById('wwmKbQuestion');
  var wwm_askBtn = document.getElementById('wwmKbAskBtn');
  var wwm_askStatus = document.getElementById('wwmKbAskStatus');
  var wwm_answerBox = document.getElementById('wwmKbAnswer');
  var wwm_sourcesBox = document.getElementById('wwmKbSources');

  var wwm_uploadApi = document.getElementById('wwmKbUploadApi');
  var wwm_askApi = document.getElementById('wwmKbAskApi');
  wwm_uploadApi.href = wwm_base + '/api/kb/upload';
  wwm_uploadApi.textContent = wwm_base + '/api/kb/upload';
  wwm_askApi.href = wwm_base + '/api/kb/ask';
  wwm_askApi.textContent = wwm_base + '/api/kb/ask';

  function wwm_setStatus(wwm_el, wwm_text, wwm_loading) {
    wwm_el.textContent = wwm_text || '';
    wwm_el.className = 'wwm_chat__status' + (wwm_loading ? ' is-loading' : '');
  }

  function wwm_sizeText(wwm_bytes) {
    if (wwm_bytes < 1024) { return wwm_bytes + ' B'; }
    if (wwm_bytes < 1024 * 1024) { return (wwm_bytes / 1024).toFixed(1) + ' KB'; }
    return (wwm_bytes / 1024 / 1024).toFixed(2) + ' MB';
  }

  function wwm_timeText(wwm_value) {
    if (!wwm_value) { return '—'; }
    return String(wwm_value).replace('T', ' ').replace('.000Z', '').slice(0, 16);
  }

  // 加载文档列表
  function wwm_loadDocs() {
    wwm_fetchJSON(wwm_base + '/api/kb/docs').then(function (wwm_res) {
      if (wwm_res.code !== 0) { throw new Error(wwm_res.msg); }
      var wwm_list = (wwm_res.data && wwm_res.data.wwm_list) || [];
      if (!wwm_list.length) {
        wwm_docsBox.innerHTML = '<tr><td colspan="7" class="wwm_empty">知识库还是空的，先上传一个文件吧</td></tr>';
        return;
      }
      var wwm_html = '';
      wwm_list.forEach(function (wwm_d) {
        wwm_html +=
          '<tr>' +
            '<td>' + wwm_d.id + '</td>' +
            '<td>' + wwm_d.filename + '</td>' +
            '<td><code>' + wwm_d.filetype + '</code></td>' +
            '<td>' + wwm_sizeText(wwm_d.filesize) + '</td>' +
            '<td>' + wwm_d.chunk_count + '</td>' +
            '<td>' + wwm_timeText(wwm_d.create_time) + '</td>' +
            '<td><button class="wwm_mini_btn" data-id="' + wwm_d.id + '" type="button">删除</button></td>' +
          '</tr>';
      });
      wwm_docsBox.innerHTML = wwm_html;
    }).catch(function (wwm_err) {
      console.error('[kb] 文档列表加载失败：' + wwm_err.message);
      wwm_docsBox.innerHTML = '<tr><td colspan="7" class="wwm_empty">加载失败：' + wwm_err.message + '</td></tr>';
    });
  }

  // 上传文件
  function wwm_upload() {
    var wwm_file = wwm_fileInput.files[0];
    if (!wwm_file) {
      wwm_setStatus(wwm_status, '请先选择要上传的文件', false);
      return;
    }
    var wwm_form = new FormData();
    wwm_form.append('file', wwm_file);

    wwm_uploadBtn.disabled = true;
    wwm_setStatus(wwm_status, '正在解析并向量化「' + wwm_file.name + '」，请稍候…', true);

    wwm_fetchJSON(wwm_base + '/api/kb/upload', { method: 'POST', body: wwm_form }).then(function (wwm_res) {
      if (wwm_res.code !== 0) { throw new Error(wwm_res.msg); }
      var wwm_d = wwm_res.data;
      wwm_setStatus(wwm_status,
        '上传成功：' + wwm_d.wwm_filename + '，共 ' + wwm_d.wwm_chars + ' 字，切成 ' + wwm_d.wwm_chunks + ' 个分块', false);
      wwm_fileInput.value = '';
      wwm_loadDocs();
    }).catch(function (wwm_err) {
      console.error('[kb] 上传失败：' + wwm_err.message);
      wwm_setStatus(wwm_status, '上传失败：' + wwm_err.message, false);
    }).then(function () {
      wwm_uploadBtn.disabled = false;
    });
  }

  // 删除文档
  function wwm_deleteDoc(wwm_id) {
    wwm_fetchJSON(wwm_base + '/api/kb/docs/' + wwm_id, { method: 'DELETE' }).then(function (wwm_res) {
      if (wwm_res.code !== 0) { throw new Error(wwm_res.msg); }
      wwm_setStatus(wwm_status, '已删除文档 ' + wwm_id, false);
      wwm_loadDocs();
    }).catch(function (wwm_err) {
      console.error('[kb] 删除失败：' + wwm_err.message);
      wwm_setStatus(wwm_status, '删除失败：' + wwm_err.message, false);
    });
  }

  // 基于知识库提问
  function wwm_ask() {
    var wwm_q = wwm_question.value.trim();
    if (!wwm_q) {
      wwm_setStatus(wwm_askStatus, '请先输入问题', false);
      return;
    }
    wwm_askBtn.disabled = true;
    wwm_setStatus(wwm_askStatus, '正在检索知识库并生成回答…', true);
    wwm_answerBox.style.display = 'none';
    wwm_sourcesBox.innerHTML = '';

    wwm_fetchJSON(wwm_base + '/api/kb/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: wwm_q, topK: 4 })
    }).then(function (wwm_res) {
      if (wwm_res.code !== 0) { throw new Error(wwm_res.msg); }
      var wwm_d = wwm_res.data;
      wwm_answerBox.style.display = 'block';
      wwm_answerBox.textContent = wwm_d.wwm_answer;
      var wwm_html = '';
      (wwm_d.wwm_sources || []).forEach(function (wwm_s, wwm_i) {
        wwm_html += '<li><b>来源 ' + (wwm_i + 1) + '</b>：' + wwm_s.wwm_doc +
          '　相似度 ' + wwm_s.wwm_score + '<br>' + wwm_s.wwm_preview + '…</li>';
      });
      wwm_sourcesBox.innerHTML = wwm_html;
      wwm_setStatus(wwm_askStatus, '回答完成 · 模型 ' + wwm_d.wwm_model, false);
    }).catch(function (wwm_err) {
      console.error('[kb] 问答失败：' + wwm_err.message);
      wwm_setStatus(wwm_askStatus, '问答失败：' + wwm_err.message, false);
    }).then(function () {
      wwm_askBtn.disabled = false;
    });
  }

  wwm_uploadBtn.addEventListener('click', wwm_upload);
  wwm_askBtn.addEventListener('click', wwm_ask);

  wwm_docsBox.addEventListener('click', function (wwm_e) {
    var wwm_t = wwm_e.target;
    if (wwm_t.classList && wwm_t.classList.contains('wwm_mini_btn')) {
      var wwm_id = parseInt(wwm_t.getAttribute('data-id'), 10);
      if (wwm_id && window.confirm('确定删除该文档及其全部分块吗？')) { wwm_deleteDoc(wwm_id); }
    }
  });

  wwm_question.addEventListener('keydown', function (wwm_e) {
    if (wwm_e.key === 'Enter' && !wwm_e.shiftKey) {
      wwm_e.preventDefault();
      wwm_ask();
    }
  });

  wwm_loadDocs();
})();
