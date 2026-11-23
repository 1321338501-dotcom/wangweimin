/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash */

(function () {
  'use strict';

  var wwm_form = document.getElementById('wwmDbForm');
  var wwm_btn = document.getElementById('wwmDbBtn');
  var wwm_result = document.getElementById('wwmDbResult');
  var wwm_apiLink = document.getElementById('wwmDbApi');
  var wwm_base = location.origin === 'null' || location.protocol === 'file:' ? 'http://localhost:8617' : location.origin;
  wwm_apiLink.href = wwm_base + '/api/db-test';
  wwm_apiLink.textContent = wwm_base + '/api/db-test';

  wwm_form.addEventListener('submit', function (wwm_event) {
    wwm_event.preventDefault();

    var wwm_payload = {
      username: document.getElementById('wwmUser').value.trim() || 'root',
      password: document.getElementById('wwmPass').value
    };

    wwm_btn.disabled = true;
    wwm_result.className = 'wwm_result';
    wwm_result.textContent = '正在连接，请稍候…';

    wwm_fetchJSON(wwm_base + '/api/db-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wwm_payload)
    }).then(function (wwm_res) {
      if (wwm_res.code === 0) {
        wwm_result.className = 'wwm_result wwm_result--ok';
        wwm_result.textContent = '✅ ' + wwm_res.msg + ' · MySQL 版本 ' + wwm_res.data.wwm_version;
      } else {
        wwm_result.className = 'wwm_result wwm_result--err';
        wwm_result.textContent = '❌ ' + wwm_res.msg;
        console.error('[db-test] ' + wwm_res.msg);
      }
    }).catch(function (wwm_err) {
      wwm_result.className = 'wwm_result wwm_result--err';
      wwm_result.textContent = '❌ 请求失败：' + wwm_err.message;
      console.error('[db-test] ' + wwm_err.message);
    }).finally(function () {
      wwm_btn.disabled = false;
    });
  });
})();
