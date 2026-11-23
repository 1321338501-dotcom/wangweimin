/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash */
'use strict';

// 大模型聊天控制器：Key 只在后端读取，前端永远拿不到
// 硅基流动与七牛都兼容 OpenAI 的 /chat/completions 格式，换平台只改 baseURL / model / apiKey

// 读取某个平台的配置（apiKey 为空表示该平台未配置）
function wwm_getProvider(wwm_name) {
  var wwm_map = {
    siliconflow: {
      wwm_label: '硅基流动',
      wwm_baseURL: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1',
      wwm_model: process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4-Flash',
      wwm_apiKey: process.env.SILICONFLOW_API_KEY || ''
    },
    qiniu: {
      wwm_label: '七牛云',
      wwm_baseURL: process.env.QINIU_BASE_URL || 'https://api.qnaigc.com/v1',
      wwm_model: process.env.QINIU_MODEL || 'qiniu/conatus-free',
      wwm_apiKey: process.env.QINIU_API_KEY || ''
    }
  };
  return wwm_map[wwm_name] || null;
}

// 把上游返回的 HTTP 状态码翻译成能看懂的提示
function wwm_translateError(wwm_status, wwm_text) {
  if (wwm_status === 401) {
    return 'Key 无效：请检查 backend/.env 里对应平台的 API Key 是否复制完整、有没有多余空格';
  }
  if (wwm_status === 402) {
    return '余额不足：请到平台领取免费额度或认证奖励券';
  }
  if (wwm_status === 404) {
    return '模型名或接口地址错误：请核对 model 与 baseURL（注意结尾的 /v1）';
  }
  if (wwm_status === 429) {
    return '请求过于频繁，已触发限流，请稍后再试';
  }
  return '大模型接口返回错误（HTTP ' + wwm_status + '）：' + String(wwm_text || '').slice(0, 200);
}

// GET /api/chat/config —— 返回可用平台列表（不含 Key，供前端下拉框使用）
function wwm_chatConfig(wwm_req, wwm_res) {
  var wwm_names = ['siliconflow', 'qiniu'];
  var wwm_list = [];
  for (var wwm_i = 0; wwm_i < wwm_names.length; wwm_i++) {
    var wwm_cfg = wwm_getProvider(wwm_names[wwm_i]);
    wwm_list.push({
      wwm_key: wwm_names[wwm_i],
      wwm_label: wwm_cfg.wwm_label,
      wwm_model: wwm_cfg.wwm_model,
      wwm_available: Boolean(wwm_cfg.wwm_apiKey)
    });
  }
  wwm_res.json({ code: 0, msg: 'ok', data: { wwm_list: wwm_list } });
}

// POST /api/chat —— 收前端的 messages，带 Key 转发给模型，把回答原样返回
async function wwm_chat(wwm_req, wwm_res) {
  var wwm_body = wwm_req.body || {};
  var wwm_messages = wwm_body.messages;
  var wwm_providerName = wwm_body.provider || 'siliconflow';

  // 参数校验：messages 必须是非空数组
  if (!Array.isArray(wwm_messages) || wwm_messages.length === 0) {
    return wwm_res.json({ code: 1, msg: '参数错误：messages 必须是非空数组', data: null });
  }

  var wwm_cfg = wwm_getProvider(wwm_providerName);
  if (!wwm_cfg) {
    return wwm_res.json({ code: 1, msg: '未知平台：' + wwm_providerName, data: null });
  }
  if (!wwm_cfg.wwm_apiKey) {
    return wwm_res.json({
      code: 1,
      msg: '平台「' + wwm_cfg.wwm_label + '」尚未配置 API Key，请在 backend/.env 中填写后重启服务',
      data: null
    });
  }

  // 拼装发给模型的对话：有 system 人设就放在最前面
  var wwm_payloadMessages = [];
  if (wwm_body.system && String(wwm_body.system).trim()) {
    wwm_payloadMessages.push({ role: 'system', content: String(wwm_body.system) });
  }
  for (var wwm_i = 0; wwm_i < wwm_messages.length; wwm_i++) {
    var wwm_m = wwm_messages[wwm_i] || {};
    if (!wwm_m.role || typeof wwm_m.content !== 'string') {
      return wwm_res.json({ code: 1, msg: '参数错误：messages 每项需包含 role 与 content', data: null });
    }
    wwm_payloadMessages.push({ role: wwm_m.role, content: wwm_m.content });
  }

  // 温度与最大输出长度：temperature 越高越发散，max_tokens 太小会"话说到一半断掉"
  var wwm_temperature = typeof wwm_body.temperature === 'number' ? wwm_body.temperature : 0.7;
  var wwm_maxTokens = Number(wwm_body.max_tokens) > 0 ? Number(wwm_body.max_tokens) : 1024;

  // 超时控制：60 秒还没返回就中断，避免页面一直"正在思考"
  var wwm_controller = new AbortController();
  var wwm_timer = setTimeout(function () { wwm_controller.abort(); }, 60000);

  try {
    var wwm_url = wwm_cfg.wwm_baseURL.replace(/\/+$/, '') + '/chat/completions';
    var wwm_resp = await fetch(wwm_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + wwm_cfg.wwm_apiKey
      },
      body: JSON.stringify({
        model: wwm_cfg.wwm_model,
        messages: wwm_payloadMessages,
        temperature: wwm_temperature,
        max_tokens: wwm_maxTokens,
        stream: false
      }),
      signal: wwm_controller.signal
    });

    if (!wwm_resp.ok) {
      var wwm_text = await wwm_resp.text();
      var wwm_msg = wwm_translateError(wwm_resp.status, wwm_text);
      console.error('[chat] HTTP ' + wwm_resp.status + ' ' + wwm_text);
      return wwm_res.json({ code: wwm_resp.status, msg: wwm_msg, data: null });
    }

    var wwm_json = await wwm_resp.json();
    var wwm_reply = '';
    if (wwm_json.choices && wwm_json.choices[0] && wwm_json.choices[0].message) {
      wwm_reply = wwm_json.choices[0].message.content || '';
    }
    if (!wwm_reply) {
      return wwm_res.json({ code: 1, msg: '模型返回内容为空，请重试', data: null });
    }

    wwm_res.json({
      code: 0,
      msg: 'ok',
      data: {
        wwm_reply: wwm_reply,
        wwm_provider: wwm_providerName,
        wwm_model: wwm_cfg.wwm_model,
        wwm_usage: wwm_json.usage || null
      }
    });
  } catch (wwm_err) {
    var wwm_reason = wwm_err.name === 'AbortError' ? '请求超时（60 秒），请检查网络后重试' : wwm_err.message;
    console.error('[chat]', wwm_reason);
    wwm_res.json({ code: 500, msg: '调用大模型失败：' + wwm_reason, data: null });
  } finally {
    clearTimeout(wwm_timer);
  }
}

module.exports = { wwm_chat, wwm_chatConfig };
