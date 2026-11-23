/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash */

(function () {
  'use strict';

  /* ===== canvas 背景粒子动画 ===== */
  var wwm_canvas = document.getElementById('wwm_canvas');
  var wwm_ctx = wwm_canvas.getContext('2d');
  var wwm_dots = [];
  var wwm_w = 0;
  var wwm_h = 0;

  function wwm_resize() {
    var wwm_dpr = window.devicePixelRatio || 1;
    wwm_w = window.innerWidth;
    wwm_h = window.innerHeight;
    wwm_canvas.width = wwm_w * wwm_dpr;
    wwm_canvas.height = wwm_h * wwm_dpr;
    wwm_canvas.style.width = wwm_w + 'px';
    wwm_canvas.style.height = wwm_h + 'px';
    wwm_ctx.setTransform(wwm_dpr, 0, 0, wwm_dpr, 0, 0);
  }

  function wwm_initDots() {
    var wwm_count = Math.min(90, Math.round(wwm_w * wwm_h / 16000));
    wwm_dots = [];
    for (var wwm_i = 0; wwm_i < wwm_count; wwm_i++) {
      wwm_dots.push({
        wwm_x: Math.random() * wwm_w,
        wwm_y: Math.random() * wwm_h,
        wwm_vx: (Math.random() - 0.5) * 0.45,
        wwm_vy: (Math.random() - 0.5) * 0.45,
        wwm_r: Math.random() * 1.6 + 1
      });
    }
  }

  function wwm_draw() {
    wwm_ctx.clearRect(0, 0, wwm_w, wwm_h);

    for (var wwm_i = 0; wwm_i < wwm_dots.length; wwm_i++) {
      var wwm_d = wwm_dots[wwm_i];
      wwm_d.wwm_x += wwm_d.wwm_vx;
      wwm_d.wwm_y += wwm_d.wwm_vy;

      if (wwm_d.wwm_x < 0 || wwm_d.wwm_x > wwm_w) { wwm_d.wwm_vx *= -1; }
      if (wwm_d.wwm_y < 0 || wwm_d.wwm_y > wwm_h) { wwm_d.wwm_vy *= -1; }

      wwm_ctx.beginPath();
      wwm_ctx.arc(wwm_d.wwm_x, wwm_d.wwm_y, wwm_d.wwm_r, 0, Math.PI * 2);
      wwm_ctx.fillStyle = 'rgba(20, 85, 217, 0.55)';
      wwm_ctx.fill();

      for (var wwm_j = wwm_i + 1; wwm_j < wwm_dots.length; wwm_j++) {
        var wwm_o = wwm_dots[wwm_j];
        var wwm_dx = wwm_d.wwm_x - wwm_o.wwm_x;
        var wwm_dy = wwm_d.wwm_y - wwm_o.wwm_y;
        var wwm_dist = Math.sqrt(wwm_dx * wwm_dx + wwm_dy * wwm_dy);
        if (wwm_dist < 120) {
          wwm_ctx.beginPath();
          wwm_ctx.moveTo(wwm_d.wwm_x, wwm_d.wwm_y);
          wwm_ctx.lineTo(wwm_o.wwm_x, wwm_o.wwm_y);
          wwm_ctx.strokeStyle = 'rgba(16, 37, 74, ' + (0.16 * (1 - wwm_dist / 120)) + ')';
          wwm_ctx.lineWidth = 1;
          wwm_ctx.stroke();
        }
      }
    }

    window.requestAnimationFrame(wwm_draw);
  }

  wwm_resize();
  wwm_initDots();
  wwm_draw();

  window.addEventListener('resize', function () {
    wwm_resize();
    wwm_initDots();
  });

  /* ===== 原生 Swiper 轮播图 ===== */
  (function wwm_initSwiper() {
    var wwm_swiperEl = document.getElementById('wwmSwiper');
    if (!wwm_swiperEl) { return; }

    var wwm_track = document.getElementById('wwmSwiperTrack');
    var wwm_dotsBox = document.getElementById('wwmSwiperDots');
    var wwm_btnPrev = document.getElementById('wwmSwiperPrev');
    var wwm_btnNext = document.getElementById('wwmSwiperNext');

    var wwm_index = 0;
    var wwm_total = 0;
    var wwm_timer = null;
    var wwm_interval = 3500;

    // fallback 数据（后端未启动时使用）
    var wwm_fallback = [
      { title: '校园晨光', description: '清晨的教学楼，阳光顺着长廊一路铺到门口。', img_url: 'images/gallery-1.jpg', category: '校园' },
      { title: '城市天际线', description: '黄昏时分的高楼与玻璃幕墙，倒映出一整条天空。', img_url: 'images/gallery-2.jpg', category: '建筑' },
      { title: '山间云海', description: '雨后山谷起雾，云层在脚下缓慢流动。', img_url: 'images/gallery-3.jpg', category: '自然' },
      { title: '街角咖啡', description: '一杯拿铁、一扇旧窗，藏着午后最安静的一小时。', img_url: 'images/gallery-4.jpg', category: '生活' },
      { title: '夜跑江畔', description: '江风、路灯与脚步声，是城市夜晚最轻的节奏。', img_url: 'images/gallery-5.jpg', category: '运动' },
      { title: '星河与帐篷', description: '远离城市灯光，银河悬在帐篷上方。', img_url: 'images/gallery-8.jpg', category: '夜色' }
    ];

    function wwm_render(wwm_list) {
      wwm_total = wwm_list.length;
      if (wwm_total === 0) { return; }

      var wwm_apiBase = location.origin === 'null' || location.protocol === 'file:' ? 'http://localhost:8617' : location.origin;

      // 渲染 slides
      var wwm_slidesHtml = '';
      for (var wwm_i = 0; wwm_i < wwm_total; wwm_i++) {
        var wwm_item = wwm_list[wwm_i];
        wwm_slidesHtml +=
          '<div class="wwm_swiper__slide">' +
            '<img src="' + (wwm_apiBase + '/' + wwm_item.img_url) + '" alt="' + wwm_item.title + '" loading="lazy" onerror="this.src=\'' + wwm_item.img_url + '\'">' +
            '<div class="wwm_swiper__caption">' +
              '<h3>' + wwm_item.title + '</h3>' +
              '<p>' + wwm_item.description + '</p>' +
              '<span class="wwm_swiper__cat">' + wwm_item.category + '</span>' +
            '</div>' +
          '</div>';
      }
      wwm_track.innerHTML = wwm_slidesHtml;

      // 渲染 dots
      var wwm_dotsHtml = '';
      for (var wwm_j = 0; wwm_j < wwm_total; wwm_j++) {
        wwm_dotsHtml += '<button class="wwm_swiper__dot' + (wwm_j === 0 ? ' is-active' : '') + '" data-idx="' + wwm_j + '" aria-label="切换到第 ' + (wwm_j + 1) + ' 张"></button>';
      }
      wwm_dotsBox.innerHTML = wwm_dotsHtml;

      wwm_bindEvents();
      wwm_startAuto();
    }

    function wwm_goTo(wwm_i) {
      if (wwm_total === 0) { return; }
      wwm_index = (wwm_i + wwm_total) % wwm_total;
      wwm_track.style.transform = 'translateX(-' + (wwm_index * 100) + '%)';

      // 更新 dots
      var wwm_dots = wwm_dotsBox.children;
      for (var wwm_k = 0; wwm_k < wwm_dots.length; wwm_k++) {
        wwm_dots[wwm_k].classList.toggle('is-active', wwm_k === wwm_index);
      }
    }

    function wwm_next() { wwm_goTo(wwm_index + 1); }
    function wwm_prev() { wwm_goTo(wwm_index - 1); }

    function wwm_startAuto() {
      wwm_stopAuto();
      wwm_timer = setInterval(wwm_next, wwm_interval);
    }
    function wwm_stopAuto() {
      if (wwm_timer) { clearInterval(wwm_timer); wwm_timer = null; }
    }

    function wwm_bindEvents() {
      wwm_btnNext.addEventListener('click', function () { wwm_next(); wwm_startAuto(); });
      wwm_btnPrev.addEventListener('click', function () { wwm_prev(); wwm_startAuto(); });

      // 事件委托：dots 点击
      wwm_dotsBox.addEventListener('click', function (wwm_e) {
        var wwm_t = wwm_e.target;
        if (wwm_t.classList && wwm_t.classList.contains('wwm_swiper__dot')) {
          wwm_goTo(parseInt(wwm_t.getAttribute('data-idx'), 10));
          wwm_startAuto();
        }
      });

      // 鼠标悬停暂停
      wwm_swiperEl.addEventListener('mouseenter', wwm_stopAuto);
      wwm_swiperEl.addEventListener('mouseleave', wwm_startAuto);

      // 触摸滑动（移动端）
      var wwm_startX = 0;
      var wwm_deltaX = 0;
      wwm_swiperEl.addEventListener('touchstart', function (wwm_e) {
        wwm_stopAuto();
        wwm_startX = wwm_e.touches[0].clientX;
        wwm_deltaX = 0;
      }, { passive: true });

      wwm_swiperEl.addEventListener('touchmove', function (wwm_e) {
        wwm_deltaX = wwm_e.touches[0].clientX - wwm_startX;
      }, { passive: true });

      wwm_swiperEl.addEventListener('touchend', function () {
        if (wwm_deltaX > 50) { wwm_prev(); }
        else if (wwm_deltaX < -50) { wwm_next(); }
        wwm_startAuto();
      });

      // 键盘左右箭头
      document.addEventListener('keydown', function (wwm_e) {
        if (wwm_e.key === 'ArrowLeft') { wwm_prev(); wwm_startAuto(); }
        else if (wwm_e.key === 'ArrowRight') { wwm_next(); wwm_startAuto(); }
      });
    }

    // 先尝试从后端加载，失败则用 fallback
    var wwm_apiBase = location.origin === 'null' || location.protocol === 'file:' ? 'http://localhost:8617' : location.origin;
    wwm_fetchJSON(wwm_apiBase + '/api/gallery').then(function (wwm_res) {
      if (wwm_res.code !== 0) { throw new Error(wwm_res.msg); }
      var wwm_list = (wwm_res.data && wwm_res.data.list) || [];
      wwm_render(wwm_list.length >= 2 ? wwm_list : wwm_fallback);
    }).catch(function () {
      console.warn('[swiper] 后端未启动，使用本地 fallback 数据');
      wwm_render(wwm_fallback);
    });
  })();

  /* ===== 服务状态检测 ===== */
  var wwm_healthBox = document.getElementById('wwmHealth');
  var wwm_healthLink = document.getElementById('wwmHealthLink');
  var wwm_apiBase = location.origin === 'null' || location.protocol === 'file:' ? 'http://localhost:8617' : location.origin;
  wwm_healthLink.href = wwm_apiBase + '/api/health';
  wwm_healthLink.textContent = wwm_apiBase + '/api/health';

  wwm_fetchJSON(wwm_apiBase + '/api/health').then(function (wwm_res) {
    if (wwm_res.code !== 0) { throw new Error(wwm_res.msg); }
    var wwm_d = wwm_res.data;
    wwm_healthBox.className = 'wwm_result wwm_result--ok';
    wwm_healthBox.textContent =
      '服务正常 · 端口 ' + wwm_d.wwm_port +
      ' · Node ' + wwm_d.wwm_node +
      ' · 数据库 ' + wwm_d.wwm_database +
      ' · ' + wwm_d.wwm_name + ' ' + wwm_d.wwm_student_id;
  }).catch(function (wwm_err) {
    console.error('[health] ' + wwm_err.message);
    wwm_healthBox.className = 'wwm_result wwm_result--err';
    wwm_healthBox.textContent = '服务未启动或接口异常：' + wwm_err.message + '（请双击根目录 start.bat）';
  });
})();
