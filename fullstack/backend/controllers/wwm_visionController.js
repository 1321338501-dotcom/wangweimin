/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash */
'use strict';

// 图像识别：把上传的图片转成 base64 data URI，交给硅基流动的视觉模型描述
function wwm_sfBase() {
  return (process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1').replace(/\/+$/, '');
}

async function wwm_vision(wwm_req, wwm_res) {
  if (!wwm_req.file) {
    return wwm_res.json({ code: 1, msg: '未收到图片，请选择要识别的图片', data: null });
  }
  const wwm_key = process.env.SILICONFLOW_API_KEY || '';
  if (!wwm_key) {
    return wwm_res.json({ code: 1, msg: '未配置 SILICONFLOW_API_KEY', data: null });
  }

  const wwm_model = process.env.VISION_MODEL || 'Qwen/Qwen2.5-VL-72B-Instruct';
  const wwm_mime = wwm_req.file.mimetype || 'image/png';
  const wwm_prompt = String((wwm_req.body && wwm_req.body.prompt) || '请用中文详细描述这张图片的内容，包括主体、场景、颜色、以及图片中出现的文字。');
  const wwm_dataUri = 'data:' + wwm_mime + ';base64,' + wwm_req.file.buffer.toString('base64');

  const wwm_payload = {
    model: wwm_model,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: wwm_prompt },
          { type: 'image_url', image_url: { url: wwm_dataUri } }
        ]
      }
    ],
    max_tokens: 800,
    stream: false
  };

  // 控制台输出发送给大模型的数据（base64 太长，只打印长度，不打印全文）
  console.log('===== [图像识别 → 发送给大模型] =====');
  console.log(JSON.stringify({
    model: wwm_model,
    prompt: wwm_prompt,
    image_mime: wwm_mime,
    image_size: wwm_req.file.size,
    image_base64_length: wwm_req.file.buffer.toString('base64').length
  }, null, 2));

  try {
    const wwm_resp = await fetch(wwm_sfBase() + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + wwm_key },
      body: JSON.stringify(wwm_payload)
    });
    const wwm_text = await wwm_resp.text();
    if (!wwm_resp.ok) {
      console.error('[vision] HTTP ' + wwm_resp.status + ' ' + wwm_text.slice(0, 300));
      return wwm_res.json({ code: wwm_resp.status, msg: '图像识别失败（HTTP ' + wwm_resp.status + '）：' + wwm_text.slice(0, 200), data: null });
    }

    const wwm_json = JSON.parse(wwm_text);
    const wwm_desc = (wwm_json.choices && wwm_json.choices[0] && wwm_json.choices[0].message)
      ? wwm_json.choices[0].message.content : '';

    console.log('===== [图像识别 ← 接收自大模型] =====');
    console.log(JSON.stringify(wwm_json, null, 2));

    wwm_res.json({
      code: 0,
      msg: 'ok',
      data: {
        wwm_description: wwm_desc,
        wwm_model: wwm_model,
        wwm_usage: wwm_json.usage || null
      }
    });
  } catch (wwm_err) {
    console.error('[vision]', wwm_err.message);
    wwm_res.json({ code: 1, msg: '图像识别失败：' + wwm_err.message, data: null });
  }
}

module.exports = { wwm_vision };
