# 接口记录 · wwm_interface.md

> 每次创建或修改接口后追加记录，禁止覆盖。统一响应格式 `{ code, msg, data }`，`code=0` 表示成功。

---

## 2026-11-19 20:10 · GET /api/health

- **路径**：`GET /api/health`
- **请求参数**：无
- **响应示例**：

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "wwm_name": "王伟民",
    "wwm_student_id": "24001010617",
    "wwm_port": 8617,
    "wwm_node": "v24.20.0",
    "wwm_database": "connected",
    "wwm_time": "2026-11-19T12:10:00.000Z"
  }
}
```

- **说明**：服务健康检查，顺带检测数据库连接状态（connected / disconnected）。

---

## 2026-11-19 20:10 · POST /api/db-test

- **路径**：`POST /api/db-test`
- **请求参数**（JSON）：

```json
{ "username": "root", "password": "******" }
```

- **成功响应**：

```json
{ "code": 0, "msg": "数据库连接成功", "data": { "wwm_version": "8.0.46" } }
```

- **失败响应**（HTTP 200，业务 code 非 0）：

```json
{ "code": 1, "msg": "数据库连接失败：Access denied for user 'root'@'localhost'", "data": null }
```

- **说明**：使用页面传来的用户名密码通过 mysql2 直连 MySQL，仅用于课程作业的连接测试。

---

## 2026-11-19 20:10 · GET /api/news

- **路径**：`GET /api/news`
- **请求参数**：无
- **响应示例**：

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "total": 8,
    "list": [
      {
        "id": 1,
        "title": "国产大模型集体降价，推理成本一年下降约 70%",
        "summary": "多家厂商下调 API 价格，长文本与多模态调用成本同步走低。",
        "content": "价格战背后是推理芯片、量化和批处理调度三项工程优化同时落地。",
        "source": "36氪",
        "cover_img": "images/news-1.jpg",
        "publish_time": "2026-11-18T01:20:00.000Z"
      }
    ]
  }
}
```

- **说明**：读取 MySQL 表 `wwm_news`，按 `publish_time` 倒序返回全部记录。

---

## 2026-11-19 20:10 · GET /api/gallery

- **路径**：`GET /api/gallery`
- **请求参数**：无
- **响应示例**：

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "total": 8,
    "list": [
      {
        "id": 1,
        "title": "校园晨光",
        "description": "清晨的教学楼，阳光顺着长廊一路铺到门口。",
        "img_url": "images/gallery-1.jpg",
        "category": "校园",
        "create_time": "2026-11-18T00:10:00.000Z"
      }
    ]
  }
}
```

- **说明**：读取 MySQL 表 `wwm_gallery`，按 `create_time` 倒序返回全部图文数据。

---

## 2026-11-23 13:40 · GET /api/chat/config

- **路径**：`GET /api/chat/config`
- **请求参数**：无
- **响应示例**：

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "wwm_list": [
      { "wwm_key": "siliconflow", "wwm_label": "硅基流动", "wwm_model": "deepseek-ai/DeepSeek-V4-Flash", "wwm_available": true },
      { "wwm_key": "qiniu", "wwm_label": "七牛云", "wwm_model": "qiniu/conatus-free", "wwm_available": false }
    ]
  }
}
```

- **说明**：返回可用的大模型平台列表，供前端下拉框渲染。`wwm_available=false` 表示该平台在 `backend/.env` 中未配置 API Key。**任何情况下都不返回 Key 本身。**

---

## 2026-11-23 13:40 · POST /api/chat

- **路径**：`POST /api/chat`
- **请求参数**（JSON）：

```json
{
  "provider": "siliconflow",
  "system": "你是「中华美食街」的在线客服小美……",
  "messages": [
    { "role": "user", "content": "你们几点开门？" }
  ],
  "temperature": 0.7,
  "max_tokens": 1024
}
```

- **参数说明**：
  - `provider`：`siliconflow` 或 `qiniu`，默认 `siliconflow`
  - `system`：可选，人设提示词，由后端放在 messages 最前面
  - `messages`：必填，非空数组，只放 user / assistant 的多轮历史
  - `temperature`：可选，默认 0.7
  - `max_tokens`：可选，默认 1024

- **成功响应**：

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "wwm_reply": "亲，我们每天上午10点开门，晚上9点打烊哦~",
    "wwm_provider": "siliconflow",
    "wwm_model": "deepseek-ai/DeepSeek-V4-Flash",
    "wwm_usage": { "prompt_tokens": 52, "completion_tokens": 121, "total_tokens": 173 }
  }
}
```

- **失败响应**（HTTP 200，业务 code 非 0）：

```json
{ "code": 1, "msg": "平台「七牛云」尚未配置 API Key，请在 backend/.env 中填写后重启服务", "data": null }
```

- **上游错误映射**：401 → Key 无效；402 → 余额不足；404 → 模型名或 baseURL 错误；429 → 请求过于频繁；超时 60 秒 → 请求超时。
- **说明**：Key 只在后端读取，前端无法获取。两个平台都兼容 OpenAI 的 `/chat/completions` 格式，切换平台只需改 `baseURL`、`model`、`apiKey` 三个值。

---

## 2026-11-23 14:07 · POST /api/kb/upload

- **路径**：`POST /api/kb/upload`
- **Content-Type**：`multipart/form-data`，字段名 `file`
- **请求示例**：`curl -F "file=@backend/kb_samples/wwm_kb_01_门店服务手册.txt" http://localhost:8617/api/kb/upload`
- **支持格式**：txt / md / csv / json / pdf / doc / docx / ppt / pptx，单文件 ≤ 25MB，单文档最多 60 个分块
- **成功响应**：

```json
{
  "code": 0,
  "msg": "上传成功",
  "data": { "wwm_doc_id": 2, "wwm_filename": "wwm_kb_01_门店服务手册.txt", "wwm_filetype": "txt", "wwm_chars": 689, "wwm_chunks": 2 }
}
```

- **说明**：解析文本 → 按约 500 字分块（重叠 60 字）→ 调 `BAAI/bge-m3` 生成向量 → 写入 `wwm_kb_doc` 与 `wwm_kb_chunk`。

---

## 2026-11-23 14:07 · GET /api/kb/docs

- **路径**：`GET /api/kb/docs`
- **请求参数**：无
- **响应示例**：

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "wwm_total": 2,
    "wwm_list": [
      { "id": 2, "filename": "wwm_kb_01_门店服务手册.txt", "filetype": "txt", "filesize": 1706, "chunk_count": 2, "create_time": "2026-11-23T06:07:02.000Z" }
    ]
  }
}
```

- **说明**：按上传时间倒序返回知识库文档列表。

---

## 2026-11-23 14:07 · DELETE /api/kb/docs/:id

- **路径**：`DELETE /api/kb/docs/:id`
- **请求参数**：路径参数 `id`（文档主键）
- **响应示例**：

```json
{ "code": 0, "msg": "已删除", "data": { "wwm_deleted": 1 } }
```

- **说明**：同时删除该文档的全部分块（含向量）。

---

## 2026-11-23 14:07 · POST /api/kb/ask

- **路径**：`POST /api/kb/ask`
- **请求参数**（JSON）：

```json
{ "question": "配送费怎么算？", "topK": 4 }
```

- **响应示例**：

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "wwm_answer": "基础配送费为每单5元；订单满88元免配送费；超出5公里每公里加收1元；夜间21:00后加收3元。",
    "wwm_sources": [
      { "wwm_doc": "wwm_kb_02_配送与退换货政策.txt", "wwm_chunk_id": 4, "wwm_score": 0.7455, "wwm_preview": "中华美食街 · 配送与退换货政策..." }
    ],
    "wwm_model": "deepseek-ai/DeepSeek-V4-Flash"
  }
}
```

- **说明**：问题向量化 → 全部分块按余弦相似度排序取 topK → 拼进提示词 → 只依据资料作答（资料里没有则明确说明）。
- **控制台**：会完整打印「发送给大模型」的请求体与「接收自大模型」的响应 JSON。
- **失败响应**：知识库为空返回 `code:1, msg:"知识库为空，请先上传知识库文件"`。

---

## 2026-11-23 14:07 · POST /api/vision

- **路径**：`POST /api/vision`
- **Content-Type**：`multipart/form-data`，字段名 `image`
- **可选字段**：`prompt`（自定义提问，默认要求详细描述图片）
- **请求示例**：`curl -F "image=@frontend/images/gallery-1.jpg" http://localhost:8617/api/vision`
- **响应示例**：

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "wwm_description": "这张图片展示了一条空旷明亮的室内走廊……",
    "wwm_model": "Qwen/Qwen3-VL-32B-Instruct",
    "wwm_usage": { "prompt_tokens": 3672, "completion_tokens": 664, "total_tokens": 4336 }
  }
}
```

- **说明**：图片转 base64 data URI 交给硅基流动视觉模型，返回中文描述。控制台打印模型名、提示词、图片体积与 base64 长度（不打印 base64 原文）。

---

## 2026-11-23 14:07 · POST /api/asr

- **路径**：`POST /api/asr`
- **Content-Type**：`multipart/form-data`，字段名 `audio`
- **请求示例**：`curl -F "audio=@test.wav" http://localhost:8617/api/asr`
- **响应示例**：

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "wwm_text": "你好，这是一段语音识别功能的测试。中华美食街每天上午10点开门。",
    "wwm_model": "qwen-audio-3.0-asr-flash",
    "wwm_raw": { "text": "……", "usage": { "seconds": 8, "type": "duration" } }
  }
}
```

- **说明**：音频以 multipart 转发到七牛 `https://api.qnaigc.com/v1/audio/transcriptions`，模型 `qwen-audio-3.0-asr-flash`。控制台打印请求参数与原始响应。
