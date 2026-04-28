#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "╔══════════════════════════════════════════════╗"
echo "║      B站视频字幕提取 + AI 总结 v1.0          ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "  启动后端服务 (端口 1658)..."
echo "  启动前端页面 (端口 1659)..."
echo ""
echo "  打开浏览器访问: http://localhost:1659"
echo "  按 Ctrl+C 停止所有服务..."
echo ""

cleanup() {
    echo ""
    echo "正在停止服务..."
    kill $SERVER_PID $CLIENT_PID 2>/dev/null
    exit 0
}
trap cleanup INT TERM

cd "$SCRIPT_DIR/server"
npx tsx src/index.ts &
SERVER_PID=$!

cd "$SCRIPT_DIR/project"
npx vite --host &
CLIENT_PID=$!

sleep 3
open http://localhost:1659 2>/dev/null || xdg-open http://localhost:1659 2>/dev/null || echo "请手动打开 http://localhost:1659"

wait
