/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash */

// 语音识别页面：上传音频或录音 → 调用 /api/asr → 展示识别文字
(function () {
  'use strict';

  var wwm_base = location.origin === 'null' || location.protocol === 'file:' ? 'http://localhost:8617' : location.origin;

  var wwm_fileInput = document.getElementById('wwmAsrFile');
  var wwm_btn = document.getElementById('wwmAsrBtn');
  var wwm_recBtn = document.getElementById('wwmAsrRecBtn');
  var wwm_status = document.getElementById('wwmAsrStatus');
  var wwm_audio = document.getElementById('wwmAsrAudio');
  var wwm_answer = document.getElementById('wwmAsrAnswer');
  var wwm_apiLink = document.getElementById('wwmAsrApi');

  wwm_apiLink.href = wwm_base + '/api/asr';
  wwm_apiLink.textContent = wwm_base + '/api/asr';

  var wwm_recorder = null;
  var wwm_recChunks = [];

  function wwm_setStatus(wwm_text, wwm_loading) {
    wwm_status.innerHTML = wwm_text || '';
    wwm_status.className = 'wwm_chat__status' + (wwm_loading ? ' is-loading' : '');
  }

  // 把音频 Blob 发给后端识别
  function wwm_sendAudio(wwm_blob, wwm_filename) {
    var wwm_form = new FormData();
    wwm_form.append('audio', wwm_blob, wwm_filename);

    wwm_btn.disabled = true;
    wwm_recBtn.disabled = true;
    wwm_setStatus('正在识别语音，请稍候…', true);

    wwm_fetchJSON(wwm_base + '/api/asr', { method: 'POST', body: wwm_form }).then(function (wwm_res) {
      if (wwm_res.code !== 0) { throw new Error(wwm_res.msg); }
      wwm_answer.style.display = 'block';
      wwm_answer.textContent = wwm_res.data.wwm_text || '（没有识别出文字）';
      wwm_setStatus('识别完成 · 模型 ' + wwm_res.data.wwm_model, false);
    }).catch(function (wwm_err) {
      console.error('[asr] 识别失败：' + wwm_err.message);
      wwm_setStatus('识别失败：' + wwm_err.message, false);
    }).then(function () {
      wwm_btn.disabled = false;
      wwm_recBtn.disabled = false;
    });
  }

  // 选中音频后本地播放
  wwm_fileInput.addEventListener('change', function () {
    var wwm_file = wwm_fileInput.files[0];
    if (!wwm_file) { return; }
    wwm_audio.src = URL.createObjectURL(wwm_file);
    wwm_audio.style.display = 'block';
    wwm_setStatus('已选择「' + wwm_file.name + '」，可以点击识别', false);
  });

  wwm_btn.addEventListener('click', function () {
    var wwm_file = wwm_fileInput.files[0];
    if (!wwm_file) {
      wwm_setStatus('请先选择音频文件，或使用「开始录音」', false);
      return;
    }
    wwm_sendAudio(wwm_file, wwm_file.name);
  });

  // 录音：点击开始，再点一次停止并自动识别
  wwm_recBtn.addEventListener('click', function () {
    if (wwm_recorder && wwm_recorder.state === 'recording') {
      wwm_recorder.stop();
      return;
    }
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      wwm_setStatus('当前浏览器不支持录音，请改用上传音频', false);
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (wwm_stream) {
      wwm_recChunks = [];
      wwm_recorder = new MediaRecorder(wwm_stream);

      wwm_recorder.ondataavailable = function (wwm_e) {
        if (wwm_e.data && wwm_e.data.size > 0) { wwm_recChunks.push(wwm_e.data); }
      };
      wwm_recorder.onstop = function () {
        wwm_stream.getTracks().forEach(function (wwm_t) { wwm_t.stop(); });
        var wwm_blob = new Blob(wwm_recChunks, { type: 'audio/webm' });
        wwm_audio.src = URL.createObjectURL(wwm_blob);
        wwm_audio.style.display = 'block';
        wwm_recBtn.textContent = '开始录音';
        wwm_sendAudio(wwm_blob, 'wwm_record.webm');
      };

      wwm_recorder.start();
      wwm_recBtn.textContent = '停止录音';
      wwm_setStatus('<span class="wwm_rec_dot"></span>正在录音，再次点击按钮结束', true);
    }).catch(function (wwm_err) {
      console.error('[asr] 录音失败：' + wwm_err.message);
      wwm_setStatus('无法使用麦克风：' + wwm_err.message, false);
    });
  });
})();
