/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash */
'use strict';

const { wwm_getAllNews } = require('../models/wwm_news');

async function wwm_newsList(wwm_req, wwm_res) {
  try {
    const wwm_list = await wwm_getAllNews();
    wwm_res.json({ code: 0, msg: 'ok', data: { total: wwm_list.length, list: wwm_list } });
  } catch (wwm_err) {
    console.error('[news]', wwm_err.message);
    wwm_res.status(500).json({ code: 500, msg: '新闻数据读取失败：' + wwm_err.message, data: null });
  }
}

module.exports = { wwm_newsList };
