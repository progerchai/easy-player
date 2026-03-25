#!/bin/bash

echo "🎬 EasyPlayer React - 正在安装依赖..."
echo ""

# 设置淘宝镜像
npm config set registry https://registry.npmmirror.com

# 安装依赖
npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ 安装失败，请检查网络连接"
    exit 1
fi

echo ""
echo "✅ 依赖安装完成！"
echo ""
echo "🚀 启动开发模式..."
echo ""
echo "提示："
echo "  - 按 Ctrl+C 停止应用"
echo "  - 访问 http://localhost:5173 查看 Web 版本"
echo ""

npm run electron:dev
