/**
 * ============================================================
 * 可复用选项卡组件 tabs.js
 * ------------------------------------------------------------
 * 用法：
 *   1. HTML 中按约定结构书写：
 *        <div class="wwm-tabs">
 *          <div class="wwm-tabs__nav">
 *            <button class="wwm-tab wwm-active" data-wwm-target="面板id">标题</button>
 *            ...
 *          </div>
 *          <div class="wwm-tab-panel wwm-active" id="面板id">内容</div>
 *          ...
 *        </div>
 *      （默认选中的选项卡与面板各加 wwm-active）
 *   2. 页面引入本文件后会自动初始化所有 .wwm-tabs；
 *      也可手动调用 window.wwmInitTabs(".自定义容器") 复用。
 * ============================================================
 */
(function () {
  "use strict";

  /**
   * 初始化一组选项卡（组内互不影响，可复用于任意多组）
   * @param {HTMLElement} wwm_root 选项卡容器（.wwm-tabs）
   */
  function wwmInitOne(wwm_root) {
    var wwm_nav = wwm_root.querySelector(".wwm-tabs__nav");
    if (!wwm_nav) return;

    /* 事件监听：把 click 委托到导航容器上 */
    wwm_nav.addEventListener("click", function (wwm_ev) {
      var wwm_tab = wwm_ev.target.closest(".wwm-tab");
      if (!wwm_tab || !wwm_root.contains(wwm_tab)) return;

      /* 1. 清除本组内所有选项卡、所有面板的选中状态 */
      var wwm_tabs = wwm_root.querySelectorAll(".wwm-tab");
      var wwm_panels = wwm_root.querySelectorAll(".wwm-tab-panel");
      wwm_tabs.forEach(function (wwm_t) { wwm_t.classList.remove("wwm-active"); });
      wwm_panels.forEach(function (wwm_p) { wwm_p.classList.remove("wwm-active"); });

      /* 2. 再设置当前点击元素的选中状态 */
      wwm_tab.classList.add("wwm-active");
      var wwm_panel = wwm_root.querySelector("#" + wwm_tab.getAttribute("data-wwm-target"));
      if (wwm_panel) wwm_panel.classList.add("wwm-active");
    });
  }

  /**
   * 批量初始化：默认初始化页面所有 .wwm-tabs，可传入选择器复用
   * @param {string} [wwm_selector] 选项卡容器选择器，默认 ".wwm-tabs"
   */
  function wwmInitTabs(wwm_selector) {
    var wwm_list = document.querySelectorAll(wwm_selector || ".wwm-tabs");
    wwm_list.forEach(function (wwm_root) { wwmInitOne(wwm_root); });
  }

  /* 暴露到全局，便于其他页面/场景复用 */
  window.wwmInitTabs = wwmInitTabs;

  /* 自动初始化（脚本在 head 引入时也能正常工作） */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { wwmInitTabs(); });
  } else {
    wwmInitTabs();
  }
})();
