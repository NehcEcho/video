#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==============================================="
echo "  Project Cleanup"
echo "==============================================="
echo ""

echo "[1] Killing node processes on ports 1658/1659..."
lsof -ti:1658 | xargs kill -9 2>/dev/null && echo "  Killed port 1658" || echo "  Port 1658 free"
lsof -ti:1659 | xargs kill -9 2>/dev/null && echo "  Killed port 1659" || echo "  Port 1659 free"
echo "  Done."

echo ""
echo "[2] Cleaning temp files..."
if [ -d "$SCRIPT_DIR/server/temp" ]; then
    rm -rf "$SCRIPT_DIR/server/temp"
    echo "  server/temp deleted"
else
    echo "  server/temp not found"
fi

echo ""
echo "[3] Cleaning build output..."
if [ -d "$SCRIPT_DIR/project/dist" ]; then
    rm -rf "$SCRIPT_DIR/project/dist"
    echo "  project/dist deleted"
else
    echo "  project/dist not found"
fi

echo ""
echo "==============================================="
echo "  Cleanup complete."
echo "  Run start.sh to restart services."
echo "==============================================="
echo ""
