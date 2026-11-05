﻿/* ============================================================
 * wwm_tabs.js — 可复用 Tab 选项卡组件
 * 用法：在页面中为容器调用 wwm_initTabs(selector)
 * 约定：
 *   - 选项卡按钮使用 data-wy-tab="标识"，默认选中项加 data-wy-active="true"
 *   - 内容面板使用 data-wy-panel="标识"，与按钮的 data-wy-tab 对应
 *   - 选中态类名为 wwm_active
 * ============================================================ */
(function (global) {
  "use strict";

  /**
   * 初始化指定容器内的 Tab 选项卡
   * @param {string|HTMLElement} wwm_target - 容器选择器或 DOM 元素
   */
  function wwm_initTabs(wwm_target) {
    var wwm_container = typeof wwm_target === "string"
      ? document.querySelector(wwm_target)
      : wwm_target;

    if (!wwm_container) {
      console.warn("[wwm_tabs] 未找到容器：", wwm_target);
      return;
    }

    var wwm_buttons = wwm_container.querySelectorAll("[data-wy-tab]");
    var wwm_panels = wwm_container.querySelectorAll("[data-wy-panel]");

    if (wwm_buttons.length === 0) {
      console.warn("[wwm_tabs] 容器内未找到 data-wy-tab 按钮");
      return;
    }

    // 清除所有选项卡与面板的选中状态
    function wwm_clearActive() {
      wwm_buttons.forEach(function (wwm_btn) {
        wwm_btn.classList.remove("wwm_active");
      });
      wwm_panels.forEach(function (wwm_panel) {
        wwm_panel.classList.remove("wwm_active");
      });
    }

    // 根据按钮的 data-wy-tab 值激活对应面板
    function wwm_activate(wwm_btn) {
      var wwm_key = wwm_btn.getAttribute("data-wy-tab");
      wwm_clearActive();
      wwm_btn.classList.add("wwm_active");
      var wwm_panel = wwm_container.querySelector('[data-wy-panel="' + wwm_key + '"]');
      if (wwm_panel) {
        wwm_panel.classList.add("wwm_active");
      }
    }

    // 事件委托：监听容器内的点击，统一处理
    wwm_container.addEventListener("click", function (wwm_e) {
      var wwm_btn = wwm_e.target.closest("[data-wy-tab]");
      if (!wwm_btn || !wwm_container.contains(wwm_btn)) return;
      wwm_activate(wwm_btn);
    });

    // 初始化：优先激活带 data-wy-active="true" 的按钮，否则激活第一个
    var wwm_default = wwm_container.querySelector('[data-wy-tab][data-wy-active="true"]');
    wwm_activate(wwm_default || wwm_buttons[0]);
  }

  // 暴露到全局，供外部调用
  global.wwm_initTabs = wwm_initTabs;
})(window);
