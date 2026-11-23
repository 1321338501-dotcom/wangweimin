/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash */

(function () {
  'use strict';

  var wwm_list = document.getElementById('wwmNewsList');
  var wwm_count = document.getElementById('wwmNewsCount');
  var wwm_apiLink = document.getElementById('wwmNewsApi');
  var wwm_base = location.origin === 'null' || location.protocol === 'file:' ? 'http://localhost:8617' : location.origin;
  wwm_apiLink.href = wwm_base + '/api/news';
  wwm_apiLink.textContent = wwm_base + '/api/news';

  function wwm_formatTime(wwm_value) {
    if (!wwm_value) { return '—'; }
    return String(wwm_value).replace('T', ' ').replace('.000Z', '').slice(0, 16);
  }

  wwm_fetchJSON(wwm_base + '/api/news').then(function (wwm_res) {
    if (wwm_res.code !== 0) { throw new Error(wwm_res.msg); }
    var wwm_data = wwm_res.data.list || [];

    wwm_count.className = 'wwm_panel__sub';
    wwm_count.textContent = '共 ' + wwm_res.data.total + ' 条新闻（控制台已输出完整返回数据）';

    for (var wwm_i = 0; wwm_i < wwm_data.length; wwm_i++) {
      var wwm_item = wwm_data[wwm_i];
      var wwm_li = document.createElement('li');
      wwm_li.className = 'wwm_news__item';
      wwm_li.innerHTML =
        '<h3 class="wwm_news__title"></h3>' +
        '<p class="wwm_news__summary"></p>' +
        '<div class="wwm_news__meta"><span class="wwm_news__tag"></span><span class="wwm_news__source"></span><span class="wwm_news__time"></span></div>';
      wwm_li.querySelector('.wwm_news__title').textContent = wwm_item.title;
      wwm_li.querySelector('.wwm_news__summary').textContent = wwm_item.summary;
      wwm_li.querySelector('.wwm_news__tag').textContent = wwm_item.source;
      wwm_li.querySelector('.wwm_news__source').textContent = wwm_item.content || '';
      wwm_li.querySelector('.wwm_news__time').textContent = wwm_formatTime(wwm_item.publish_time);
      wwm_list.appendChild(wwm_li);
    }
  }).catch(function (wwm_err) {
    console.error('[news] ' + wwm_err.message);
    wwm_count.className = 'wwm_result wwm_result--err';
    wwm_count.textContent = '新闻加载失败：' + wwm_err.message;
  });
})();
