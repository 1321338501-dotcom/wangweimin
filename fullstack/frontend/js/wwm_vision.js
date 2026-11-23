/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash */

// 图像识别页面：选图 → 预览 → 上传 → 展示模型描述
(function () {
  'use strict';

  var wwm_base = location.origin === 'null' || location.protocol === 'file:' ? 'http://localhost:8617' : location.origin;

  var wwm_fileInput = document.getElementById('wwmVisionFile');
  var wwm_btn = document.getElementById('wwmVisionBtn');
  var wwm_status = document.getElementById('wwmVisionStatus');
  var wwm_preview = document.getElementById('wwmVisionPreview');
  var wwm_img = document.getElementById('wwmVisionImg');
  var wwm_answer = document.getElementById('wwmVisionAnswer');
  var wwm_apiLink = document.getElementById('wwmVisionApi');

  wwm_apiLink.href = wwm_base + '/api/vision';
  wwm_apiLink.textContent = wwm_base + '/api/vision';

  function wwm_setStatus(wwm_text, wwm_loading) {
    wwm_status.textContent = wwm_text || '';
    wwm_status.className = 'wwm_chat__status' + (wwm_loading ? ' is-loading' : '');
  }

  // 选中文件后本地预览
  wwm_fileInput.addEventListener('change', function () {
    var wwm_file = wwm_fileInput.files[0];
    if (!wwm_file) { return; }
    var wwm_url = URL.createObjectURL(wwm_file);
    wwm_img.src = wwm_url;
    wwm_preview.style.display = 'block';
    wwm_answer.style.display = 'none';
    wwm_setStatus('已选择「' + wwm_file.name + '」，点击「开始识别」', false);
  });

  // 上传并识别
  function wwm_recognize() {
    var wwm_file = wwm_fileInput.files[0];
    if (!wwm_file) {
      wwm_setStatus('请先选择一张图片', false);
      return;
    }
    var wwm_form = new FormData();
    wwm_form.append('image', wwm_file);

    wwm_btn.disabled = true;
    wwm_setStatus('正在识别，请稍候…', true);

    wwm_fetchJSON(wwm_base + '/api/vision', { method: 'POST', body: wwm_form }).then(function (wwm_res) {
      if (wwm_res.code !== 0) { throw new Error(wwm_res.msg); }
      wwm_answer.style.display = 'block';
      wwm_answer.textContent = wwm_res.data.wwm_description;
      var wwm_usage = wwm_res.data.wwm_usage;
      wwm_setStatus('识别完成 · 模型 ' + wwm_res.data.wwm_model +
        (wwm_usage ? ' · 消耗 ' + wwm_usage.total_tokens + ' tokens' : ''), false);
    }).catch(function (wwm_err) {
      console.error('[vision] 识别失败：' + wwm_err.message);
      wwm_setStatus('识别失败：' + wwm_err.message, false);
    }).then(function () {
      wwm_btn.disabled = false;
    });
  }

  wwm_btn.addEventListener('click', wwm_recognize);
})();
