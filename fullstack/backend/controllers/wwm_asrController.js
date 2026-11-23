/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash */
'use strict';

// 语音识别：把上传的音频以 multipart/form-data 转发给七牛的 ASR 接口
function wwm_asrBase() {
  return (process.env.ASR_BASE_URL || 'https://api.qnaigc.com/v1').replace(/\/+$/, '');
}

async function wwm_asr(wwm_req, wwm_res) {
  if (!wwm_req.file) {
    return wwm_res.json({ code: 1, msg: '未收到音频文件，请先选择或录制语音', data: null });
  }
  const wwm_key = process.env.QINIU_API_KEY || '';
  if (!wwm_key) {
    return wwm_res.json({ code: 1, msg: '未配置 QINIU_API_KEY', data: null });
  }

  const wwm_model = process.env.ASR_MODEL || 'qwen-audio-3.0-asr-flash';
  const wwm_url = wwm_asrBase() + '/audio/transcriptions';
  const wwm_name = wwm_req.file.originalname || 'audio.mp3';
  const wwm_mime = wwm_req.file.mimetype || 'audio/mpeg';

  // 控制台输出发送给大模型的数据
  console.log('===== [语音识别 → 发送给大模型] =====');
  console.log(JSON.stringify({
    url: wwm_url,
    model: wwm_model,
    filename: wwm_name,
    mime: wwm_mime,
    size: wwm_req.file.size
  }, null, 2));

  try {
    const wwm_form = new FormData();
    wwm_form.append('file', new Blob([wwm_req.file.buffer], { type: wwm_mime }), wwm_name);
    wwm_form.append('model', wwm_model);

    const wwm_resp = await fetch(wwm_url, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + wwm_key },
      body: wwm_form
    });
    const wwm_text = await wwm_resp.text();

    // 控制台输出接收自大模型的数据
    console.log('===== [语音识别 ← 接收自大模型] =====');
    console.log('HTTP ' + wwm_resp.status);
    console.log(wwm_text.slice(0, 2000));

    if (!wwm_resp.ok) {
      return wwm_res.json({
        code: wwm_resp.status,
        msg: '语音识别失败（HTTP ' + wwm_resp.status + '）：' + wwm_text.slice(0, 300),
        data: null
      });
    }

    let wwm_json = null;
    try { wwm_json = JSON.parse(wwm_text); } catch (wwm_e) { wwm_json = null; }
    const wwm_result = wwm_json
      ? (wwm_json.text || wwm_json.result || (wwm_json.data && (wwm_json.data.text || wwm_json.data.result)) || '')
      : wwm_text;

    wwm_res.json({
      code: 0,
      msg: 'ok',
      data: {
        wwm_text: String(wwm_result || '').trim(),
        wwm_model: wwm_model,
        wwm_raw: wwm_json
      }
    });
  } catch (wwm_err) {
    console.error('[asr]', wwm_err.message);
    wwm_res.json({ code: 1, msg: '语音识别失败：' + wwm_err.message, data: null });
  }
}

module.exports = { wwm_asr };
