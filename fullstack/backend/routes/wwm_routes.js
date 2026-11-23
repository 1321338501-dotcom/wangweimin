/* 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash */
'use strict';

const express = require('express');
const wwm_router = express.Router();

const { wwm_health, wwm_dbTest } = require('../controllers/wwm_dbController');
const { wwm_newsList } = require('../controllers/wwm_newsController');
const { wwm_galleryList } = require('../controllers/wwm_galleryController');
const { wwm_chat, wwm_chatConfig } = require('../controllers/wwm_chatController');
const { wwm_kbUpload, wwm_kbList, wwm_kbDelete, wwm_kbAsk } = require('../controllers/wwm_kbController');
const { wwm_vision } = require('../controllers/wwm_visionController');
const { wwm_asr } = require('../controllers/wwm_asrController');
const { wwm_upload } = require('../utils/wwm_upload');

wwm_router.get('/health', wwm_health);
wwm_router.post('/db-test', wwm_dbTest);
wwm_router.get('/news', wwm_newsList);
wwm_router.get('/gallery', wwm_galleryList);
wwm_router.get('/chat/config', wwm_chatConfig);
wwm_router.post('/chat', wwm_chat);

// 知识库 RAG
wwm_router.post('/kb/upload', wwm_upload.single('file'), wwm_kbUpload);
wwm_router.get('/kb/docs', wwm_kbList);
wwm_router.delete('/kb/docs/:id', wwm_kbDelete);
wwm_router.post('/kb/ask', wwm_kbAsk);

// 图像识别 / 语音识别
wwm_router.post('/vision', wwm_upload.single('image'), wwm_vision);
wwm_router.post('/asr', wwm_upload.single('audio'), wwm_asr);

module.exports = wwm_router;
