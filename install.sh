#!/usr/bin/env bash
set -e

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║     B站视频字幕提取 + AI 总结 - 一键安装      ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ERR=0

# ── 检查 Node.js ──
echo "[1/5] 检查 Node.js..."
if command -v node &>/dev/null; then
    echo "  ✓ Node.js $(node -v)"
else
    echo "  [错误] 未找到 Node.js，请先安装: https://nodejs.org"
    ERR=1
fi

# ── 安装前端依赖 ──
echo ""
echo "[2/5] 安装前端依赖..."
cd "$SCRIPT_DIR/project"
if [ -d "node_modules" ]; then
    echo "  ✓ 前端依赖已安装"
else
    npm install && echo "  ✓ 前端依赖安装完成" || { echo "  [错误] 前端依赖安装失败"; ERR=1; }
fi
cd "$SCRIPT_DIR"

# ── 安装后端依赖 ──
echo ""
echo "[3/5] 安装后端依赖..."
cd "$SCRIPT_DIR/server"
if [ -d "node_modules" ]; then
    echo "  ✓ 后端依赖已安装"
else
    npm install && echo "  ✓ 后端依赖安装完成" || { echo "  [错误] 后端依赖安装失败"; ERR=1; }
fi
cd "$SCRIPT_DIR"

# ── 安装 yt-dlp ──
echo ""
echo "[4/5] 安装 yt-dlp..."
if command -v yt-dlp &>/dev/null; then
    echo "  ✓ yt-dlp $(yt-dlp --version) 已安装"
elif command -v pip3 &>/dev/null; then
    pip3 install yt-dlp && echo "  ✓ yt-dlp 安装完成" || { echo "  [错误] yt-dlp 安装失败"; ERR=1; }
elif command -v pip &>/dev/null; then
    pip install yt-dlp && echo "  ✓ yt-dlp 安装完成" || { echo "  [错误] yt-dlp 安装失败"; ERR=1; }
elif command -v brew &>/dev/null; then
    brew install yt-dlp && echo "  ✓ yt-dlp 安装完成 (brew)" || { echo "  [错误] yt-dlp 安装失败"; ERR=1; }
else
    echo "  [错误] 请手动安装 yt-dlp: pip install yt-dlp"
    ERR=1
fi

# ── 安装 ffmpeg ──
echo ""
echo "[5/5] 安装 ffmpeg..."
if command -v ffmpeg &>/dev/null; then
    echo "  ✓ ffmpeg 已安装"
elif command -v brew &>/dev/null; then
    brew install ffmpeg && echo "  ✓ ffmpeg 安装完成 (brew)" || { echo "  [错误] ffmpeg 安装失败"; ERR=1; }
elif command -v apt-get &>/dev/null; then
    sudo apt-get install -y ffmpeg && echo "  ✓ ffmpeg 安装完成 (apt)" || { echo "  [错误] ffmpeg 安装失败"; ERR=1; }
else
    echo "  [错误] 请手动安装 ffmpeg: https://ffmpeg.org/download.html"
    ERR=1
fi

echo ""
echo "══════════════════════════════════════════════"
if [ "$ERR" -eq 0 ]; then
    echo "  ✓ 环境安装完成！"
    echo ""
    echo "  启动方式:"
    echo "    终端1: cd server && npm run dev"
    echo "    终端2: cd project && npm run dev"
    echo ""
    echo "  然后打开 http://localhost:5173 开始使用"
else
    echo "  ⚠ 部分组件安装失败，请检查上方错误信息"
fi
echo "══════════════════════════════════════════════"
echo ""
