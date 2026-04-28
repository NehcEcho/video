# B站视频字幕提取 + AI 总结

输入 B站 BV 号或链接，自动提取字幕（无字幕则 AI 语音转写），可选 AI 结构化总结。

## 前置依赖

- [Node.js](https://nodejs.org) >= 18
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) (B站视频信息获取)
- [ffmpeg](https://ffmpeg.org) (音频转码)
- [SiliconFlow API Key](https://cloud.siliconflow.cn/account/ak) (AI 转写/总结)

## 快速开始

```bash
# 1. 一键安装依赖 + yt-dlp + ffmpeg
双击 install.bat

# 2. 启动 (自动打开两个终端窗口 + 浏览器)
双击 start.bat

# 3. 打开 http://localhost:1659
#    右上角设置 → 填入 SiliconFlow API Key → 保存
#    输入 BV 号 → 开始使用
```

### 手动启动

```bash
# 终端 1 - 后端 (端口 1658)
cd server && npm run dev

# 终端 2 - 前端 (端口 1659)
cd project && npm run dev
```

## 工作流

```
输入 BV 号
  │
  ├─ 有字幕 → 直接提取 → 展示文字
  │
  └─ 无字幕 → 下载音频 → Qwen3-Omni 转写 → 展示文字
                    │
                    ▼
          用户点击「AI 视频总结」
                    │
          用自选模型生成结构化总结
          (核心观点 / 内容大纲 / 关键细节 / 一句话总结)
```

## 模型分工

| 环节 | 模型 | 说明 |
|------|------|------|
| 提取/转写 | Qwen3-Omni-30B-A3B-Thinking | 固定，支持文本+音频 |
| 分析/总结 | 用户自选 | 设置页可选预设或自定义 |

## 项目结构

```
video/
├── project/              # 前端 (React + Vite + Tailwind CSS)
│   └── src/
│       ├── app/          # 页面组件
│       │   └── components/
│       └── services/     # API 调用 + localStorage
├── server/               # 后端 (Express + TypeScript)
│   └── src/
│       ├── routes/       # API 路由
│       ├── services/     # B站API / ffmpeg / SiliconFlow
│       └── utils/
├── install.bat           # 一键安装脚本
└── start.bat             # 一键启动脚本
```

## API 端点

| 端点 | 方法 | 用途 |
|------|------|------|
| `/api/process` | POST | 提取视频信息 + 字幕/转写 |
| `/api/summarize` | POST | AI 视频总结 |
| `/api/info` | POST | 获取视频信息 |
| `/health` | GET | 健康检查 |
