/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash */
'use strict';

// 一键初始化数据库：建库、建表、写入测试数据
// 用法：node scripts/init-db.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

const wwm_DB = process.env.DB_NAME || 'wwm_fullstack';

const wwm_news = [
  ['国产大模型集体降价，推理成本一年下降约 70%', '多家厂商下调 API 价格，长文本与多模态调用成本同步走低。', '价格战背后是推理芯片、量化和批处理调度三项工程优化同时落地。', '36氪', 'images/news-1.jpg', '2026-11-18 09:20:00'],
  ['我国首条 8 英寸硅光芯片产线投产', '面向数据中心高速互联的硅光芯片实现规模量产。', '产线达产后可年产数万片晶圆，主要服务光模块与光计算场景。', '央视新闻', 'images/news-2.jpg', '2026-11-17 14:05:00'],
  ['量子计算原型机完成 200 比特纠错实验', '研究团队在超导体系上验证了表面码纠错的可行性。', '实验将逻辑比特错误率降低一个数量级，为可扩展量子计算提供路径。', '新华社', 'images/news-3.jpg', '2026-11-16 10:30:00'],
  ['鸿蒙生态设备总量突破 12 亿台', '手机、平板、车机与家电构成的多设备生态持续扩张。', '开发者数量同比增长明显，原生应用已覆盖办公、出行与智能家居。', 'IT之家', 'images/news-4.jpg', '2026-11-15 18:42:00'],
  ['AI 编程助手进入课堂，多所高职院校开设 Vibe Coding 课程', '从写提示词到验收结果，编程课开始教学生与 AI 协作。', '课程强调规则先行、小步验证，把"会问 AI"变成可复用的工程能力。', '中国教育报', 'images/news-5.jpg', '2026-11-14 08:15:00'],
  ['国内首个城市级自动驾驶出行网络全域开放', '主城区实现 Robotaxi 全时段运营，用户可一键叫车。', '运营方表示已完成百万公里级安全测试，并接入城市交通信号系统。', '深圳特区报', 'images/news-6.jpg', '2026-11-13 11:00:00'],
  ['6G 试验网完成首次外场测试，峰值速率达 100Gbps', '太赫兹频段与智能超表面技术完成联合验证。', '测试覆盖城区、高铁和低空场景，为 6G 标准研究提供实测数据。', '人民邮电报', 'images/news-7.jpg', '2026-11-12 16:25:00'],
  ['开源社区发布新一代前端构建工具，冷启动提速 5 倍', '基于原生 ES 模块与增量编译，开发服务器启动进入毫秒级。', '新工具兼容现有插件生态，已在多个中大型项目中试用。', 'InfoQ', 'images/news-8.jpg', '2026-11-11 09:50:00']
];

const wwm_gallery = [
  ['校园晨光', '清晨的教学楼，阳光顺着长廊一路铺到门口。', 'images/gallery-1.jpg', '校园', '2026-11-18 08:10:00'],
  ['城市天际线', '黄昏时分的高楼与玻璃幕墙，倒映出一整条天空。', 'images/gallery-2.jpg', '建筑', '2026-11-17 18:30:00'],
  ['山间云海', '雨后山谷起雾，云层在脚下缓慢流动。', 'images/gallery-3.jpg', '自然', '2026-11-16 07:45:00'],
  ['街角咖啡', '一杯拿铁、一扇旧窗，藏着午后最安静的一小时。', 'images/gallery-4.jpg', '生活', '2026-11-15 15:05:00'],
  ['夜跑江畔', '江风、路灯与脚步声，是城市夜晚最轻的节奏。', 'images/gallery-5.jpg', '运动', '2026-11-14 21:20:00'],
  ['实验室的一束光', '午后阳光穿过百叶窗，落在示波器的屏幕上。', 'images/gallery-6.jpg', '科技', '2026-11-13 14:10:00'],
  ['老街手艺人', '一双手、一把刻刀，把时间刻进木头的纹理里。', 'images/gallery-7.jpg', '人文', '2026-11-12 10:40:00'],
  ['星河与帐篷', '远离城市灯光，银河悬在帐篷上方。', 'images/gallery-8.jpg', '夜色', '2026-11-11 23:15:00']
];

async function wwm_main() {
  const wwm_conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    await wwm_conn.query(
      'CREATE DATABASE IF NOT EXISTS `' + wwm_DB + '` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
    );
    await wwm_conn.query('USE `' + wwm_DB + '`');

    await wwm_conn.query('DROP TABLE IF EXISTS wwm_news');
    await wwm_conn.query(
      'CREATE TABLE wwm_news (' +
      'id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT "主键",' +
      'title VARCHAR(200) NOT NULL COMMENT "新闻标题",' +
      'summary VARCHAR(500) NOT NULL DEFAULT "" COMMENT "摘要",' +
      'content TEXT COMMENT "正文",' +
      'source VARCHAR(100) NOT NULL DEFAULT "" COMMENT "来源",' +
      'cover_img VARCHAR(500) NOT NULL DEFAULT "" COMMENT "封面图",' +
      'publish_time DATETIME NOT NULL COMMENT "发布时间",' +
      'PRIMARY KEY (id),' +
      'KEY idx_publish_time (publish_time)' +
      ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );
    await wwm_conn.query(
      'INSERT INTO wwm_news (title, summary, content, source, cover_img, publish_time) VALUES ?',
      [wwm_news]
    );

    await wwm_conn.query('DROP TABLE IF EXISTS wwm_gallery');
    await wwm_conn.query(
      'CREATE TABLE wwm_gallery (' +
      'id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT "主键",' +
      'title VARCHAR(200) NOT NULL COMMENT "标题",' +
      'description VARCHAR(500) NOT NULL DEFAULT "" COMMENT "描述",' +
      'img_url VARCHAR(500) NOT NULL DEFAULT "" COMMENT "图片地址",' +
      'category VARCHAR(50) NOT NULL DEFAULT "" COMMENT "分类",' +
      'create_time DATETIME NOT NULL COMMENT "创建时间",' +
      'PRIMARY KEY (id),' +
      'KEY idx_create_time (create_time)' +
      ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );
    await wwm_conn.query(
      'INSERT INTO wwm_gallery (title, description, img_url, category, create_time) VALUES ?',
      [wwm_gallery]
    );

    const [wwm_n] = await wwm_conn.query('SELECT COUNT(*) AS wwm_total FROM wwm_news');
    const [wwm_g] = await wwm_conn.query('SELECT COUNT(*) AS wwm_total FROM wwm_gallery');
    console.log('数据库 ' + wwm_DB + ' 初始化完成：wwm_news ' + wwm_n[0].wwm_total + ' 条，wwm_gallery ' + wwm_g[0].wwm_total + ' 条');
  } finally {
    await wwm_conn.end();
  }
}

wwm_main().catch(function (wwm_err) {
  console.error('数据库初始化失败：' + wwm_err.message);
  process.exit(1);
});
