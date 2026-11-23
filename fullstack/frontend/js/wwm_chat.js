/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash */

// AI 聊天 / 在线客服 共用脚本
// chat.html 与 service.html 只有 data-system 人设不同，其余逻辑完全一致
(function () {
  'use strict';

  var wwm_root = document.getElementById('wwmChat');
  if (!wwm_root) { return; }

  var wwm_system = wwm_root.getAttribute('data-system') || '你是一个有用的助手。';
  var wwm_listBox = document.getElementById('wwmChatList');
  var wwm_input = document.getElementById('wwmChatInput');
  var wwm_sendBtn = document.getElementById('wwmChatSend');
  var wwm_resetBtn = document.getElementById('wwmChatReset');
  var wwm_providerSel = document.getElementById('wwmChatProvider');
  var wwm_status = document.getElementById('wwmChatStatus');
  var wwm_apiLink = document.getElementById('wwmChatApi');
  var wwm_base = location.origin === 'null' || location.protocol === 'file:' ? 'http://localhost:8617' : location.origin;

  var wwm_messages = [];  // 只存 user / assistant，多轮对话靠这份历史一起发给后端
  var wwm_busy = false;

  wwm_apiLink.href = wwm_base + '/api/chat';
  wwm_apiLink.textContent = wwm_base + '/api/chat';

  // 往消息区追加一条气泡；wwm_role 取 user / ai / err / tip
  function wwm_addBubble(wwm_role, wwm_text) {
    var wwm_div = document.createElement('div');
    wwm_div.className = 'wwm_chat__msg wwm_chat__msg--' + wwm_role;
    wwm_div.textContent = wwm_text;
    wwm_listBox.appendChild(wwm_div);
    wwm_listBox.scrollTop = wwm_listBox.scrollHeight;
  }

  function wwm_setStatus(wwm_text, wwm_loading) {
    wwm_status.textContent = wwm_text || '';
    wwm_status.className = 'wwm_chat__status' + (wwm_loading ? ' is-loading' : '');
  }

  // 读取可用平台，填充下拉框（未配置 Key 的平台标灰并禁用）
  function wwm_loadProviders() {
    wwm_fetchJSON(wwm_base + '/api/chat/config').then(function (wwm_res) {
      if (wwm_res.code !== 0) { throw new Error(wwm_res.msg); }
      var wwm_items = (wwm_res.data && wwm_res.data.wwm_list) || [];
      wwm_providerSel.innerHTML = '';
      for (var wwm_i = 0; wwm_i < wwm_items.length; wwm_i++) {
        var wwm_item = wwm_items[wwm_i];
        var wwm_opt = document.createElement('option');
        wwm_opt.value = wwm_item.wwm_key;
        wwm_opt.textContent = wwm_item.wwm_label + ' · ' + wwm_item.wwm_model +
          (wwm_item.wwm_available ? '' : '（未配置 Key）');
        wwm_opt.disabled = !wwm_item.wwm_available;
        wwm_providerSel.appendChild(wwm_opt);
      }
      // 默认选中第一个可用平台
      for (var wwm_j = 0; wwm_j < wwm_providerSel.options.length; wwm_j++) {
        if (!wwm_providerSel.options[wwm_j].disabled) {
          wwm_providerSel.selectedIndex = wwm_j;
          break;
        }
      }
    }).catch(function (wwm_err) {
      console.error('[chat] 读取平台配置失败：' + wwm_err.message);
      wwm_providerSel.innerHTML = '<option value="siliconflow">硅基流动</option>';
    });
  }

  // 发送一条消息：先显示用户气泡 → 显示"正在思考…" → 收到回答追加 AI 气泡
  function wwm_send() {
    if (wwm_busy) { return; }
    var wwm_text = wwm_input.value.trim();
    if (!wwm_text) { return; }

    wwm_addBubble('user', wwm_text);
    wwm_messages.push({ role: 'user', content: wwm_text });
    wwm_input.value = '';

    wwm_busy = true;
    wwm_sendBtn.disabled = true;
    wwm_setStatus('正在思考…', true);

    wwm_fetchJSON(wwm_base + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: wwm_messages,
        provider: wwm_providerSel.value,
        system: wwm_system,
        temperature: 0.7,
        max_tokens: 1024
      })
    }).then(function (wwm_res) {
      if (wwm_res.code !== 0) { throw new Error(wwm_res.msg); }
      var wwm_reply = wwm_res.data.wwm_reply;
      wwm_addBubble('ai', wwm_reply);
      // 把 AI 回答也放进历史，下一轮"我刚才问了什么"才答得上来
      wwm_messages.push({ role: 'assistant', content: wwm_reply });
      wwm_setStatus('回答完成 · 模型 ' + wwm_res.data.wwm_model, false);
    }).catch(function (wwm_err) {
      console.error('[chat] ' + wwm_err.message);
      wwm_addBubble('err', '出错了：' + wwm_err.message);
      // 失败时把刚才的用户消息撤回，避免历史里出现"没人回答"的半截对话
      wwm_messages.pop();
      wwm_setStatus('', false);
    }).then(function () {
      wwm_busy = false;
      wwm_sendBtn.disabled = false;
      wwm_input.focus();
    });
  }

  // 清空对话：历史与气泡一起重置
  function wwm_reset() {
    wwm_messages = [];
    wwm_listBox.innerHTML = '';
    wwm_addBubble('tip', '对话已清空，可以重新开始提问。');
    wwm_setStatus('', false);
    wwm_input.focus();
  }

  wwm_sendBtn.addEventListener('click', wwm_send);
  wwm_resetBtn.addEventListener('click', wwm_reset);

  // Enter 发送，Shift + Enter 换行
  wwm_input.addEventListener('keydown', function (wwm_e) {
    if (wwm_e.key === 'Enter' && !wwm_e.shiftKey) {
      wwm_e.preventDefault();
      wwm_send();
    }
  });

  wwm_addBubble('tip', '请输入你的问题，按 Enter 发送。');
  wwm_loadProviders();
})();
