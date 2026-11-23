/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash */

// 统一请求封装：返回 JSON 并输出到控制台
async function wwm_fetchJSON(wwm_url, wwm_options) {
  const wwm_res = await fetch(wwm_url, wwm_options);
  const wwm_data = await wwm_res.json();
  console.log('[接口] ' + wwm_url, wwm_data);
  return wwm_data;
}

// 图片加载失败时换成渐变占位，避免出现破图图标
function wwm_bindImageFallback(wwm_img) {
  wwm_img.addEventListener('error', function () {
    wwm_img.style.display = 'none';
    if (wwm_img.parentElement) {
      wwm_img.parentElement.classList.add('wwm_gallery__media--empty');
    }
    console.error('[图片加载失败] ' + wwm_img.getAttribute('src'));
  });
}
