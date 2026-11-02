/* ============================================================
 * wy_tabs.js — 可复用 Tab 选项卡组件
 * 用法：在页面中为容器调用 wy_initTabs(selector)
 * 约定：
 *   - 选项卡按钮使用 data-wy-tab="标识"，默认选中项加 data-wy-active="true"
 *   - 内容面板使用 data-wy-panel="标识"，与按钮的 data-wy-tab 对应
 *   - 选中态类名为 wy_active
 * ============================================================ */
(function (global) {
  "use strict";

  /**
   * 初始化指定容器内的 Tab 选项卡
   * @param {string|HTMLElement} wy_target - 容器选择器或 DOM 元素
   */
  function wy_initTabs(wy_target) {
    var wy_container = typeof wy_target === "string"
      ? document.querySelector(wy_target)
      : wy_target;

    if (!wy_container) {
      console.warn("[wy_tabs] 未找到容器：", wy_target);
      return;
    }

    var wy_buttons = wy_container.querySelectorAll("[data-wy-tab]");
    var wy_panels = wy_container.querySelectorAll("[data-wy-panel]");

    if (wy_buttons.length === 0) {
      console.warn("[wy_tabs] 容器内未找到 data-wy-tab 按钮");
      return;
    }

    // 清除所有选项卡与面板的选中状态
    function wy_clearActive() {
      wy_buttons.forEach(function (wy_btn) {
        wy_btn.classList.remove("wy_active");
      });
      wy_panels.forEach(function (wy_panel) {
        wy_panel.classList.remove("wy_active");
      });
    }

    // 根据按钮的 data-wy-tab 值激活对应面板
    function wy_activate(wy_btn) {
      var wy_key = wy_btn.getAttribute("data-wy-tab");
      wy_clearActive();
      wy_btn.classList.add("wy_active");
      var wy_panel = wy_container.querySelector('[data-wy-panel="' + wy_key + '"]');
      if (wy_panel) {
        wy_panel.classList.add("wy_active");
      }
    }

    // 事件委托：监听容器内的点击，统一处理
    wy_container.addEventListener("click", function (wy_e) {
      var wy_btn = wy_e.target.closest("[data-wy-tab]");
      if (!wy_btn || !wy_container.contains(wy_btn)) return;
      wy_activate(wy_btn);
    });

    // 初始化：优先激活带 data-wy-active="true" 的按钮，否则激活第一个
    var wy_default = wy_container.querySelector('[data-wy-tab][data-wy-active="true"]');
    wy_activate(wy_default || wy_buttons[0]);
  }

  // 暴露到全局，供外部调用
  global.wy_initTabs = wy_initTabs;
})(window);
