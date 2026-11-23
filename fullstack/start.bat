@echo off
rem 姓名：王伟民 | 学号：24001010617 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
chcp 65001 >nul
title 全栈项目初始化实践 - 王伟民 24001010617
cd /d "%~dp0backend"
call node app.js
pause
