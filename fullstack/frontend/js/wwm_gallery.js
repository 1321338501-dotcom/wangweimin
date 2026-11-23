/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash */

(function () {
  'use strict';

  var wwm_grid = document.getElementById('wwmGallery');
  var wwm_count = document.getElementById('wwmGalleryCount');
  var wwm_apiLink = document.getElementById('wwmGalleryApi');
  var wwm_base = location.origin === 'null' || location.protocol === 'file:' ? 'http://localhost:8617' : location.origin;
  wwm_apiLink.href = wwm_base + '/api/gallery';
  wwm_apiLink.textContent = wwm_base + '/api/gallery';

  wwm_fetchJSON(wwm_base + '/api/gallery').then(function (wwm_res) {
    if (wwm_res.code !== 0) { throw new Error(wwm_res.msg); }
    var wwm_data = wwm_res.data.list || [];

    wwm_count.className = 'wwm_panel__sub';
    wwm_count.textContent = '共 ' + wwm_res.data.total + ' 条图文（控制台已输出完整返回数据）';

    for (var wwm_i = 0; wwm_i < wwm_data.length; wwm_i++) {
      var wwm_item = wwm_data[wwm_i];

      var wwm_card = document.createElement('article');
      wwm_card.className = 'wwm_gallery__card';
      wwm_card.innerHTML =
        '<div class="wwm_gallery__media"><img alt=""></div>' +
        '<div class="wwm_gallery__body"><h3></h3><p></p><span class="wwm_gallery__cat"></span></div>';

      var wwm_img = wwm_card.querySelector('img');
      wwm_img.setAttribute('src', wwm_item.img_url);
      wwm_img.setAttribute('alt', wwm_item.title);
      wwm_bindImageFallback(wwm_img);

      wwm_card.querySelector('h3').textContent = wwm_item.title;
      wwm_card.querySelector('p').textContent = wwm_item.description;
      wwm_card.querySelector('.wwm_gallery__cat').textContent = wwm_item.category;

      wwm_grid.appendChild(wwm_card);
    }
  }).catch(function (wwm_err) {
    console.error('[gallery] ' + wwm_err.message);
    wwm_count.className = 'wwm_result wwm_result--err';
    wwm_count.textContent = '图文加载失败：' + wwm_err.message;
  });
})();
