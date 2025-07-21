#!/bin/bash

# 微信OpenID集成項目快速設置腳本

echo "🚀 開始設置微信OpenID集成項目..."

# 檢查Node.js是否安裝
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安裝，請先安裝Node.js"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"

# 檢查npm是否安裝
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安裝，請先安裝npm"
    exit 1
fi

echo "✅ npm版本: $(npm --version)"

# 安裝依賴
echo "📦 安裝項目依賴..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依賴安裝失敗"
    exit 1
fi

echo "✅ 依賴安裝完成"

# 創建環境變量文件
if [ ! -f "config/.env" ]; then
    echo "📝 創建環境變量文件..."
    cp config/env.example config/.env
    echo "✅ 環境變量文件已創建: config/.env"
    echo "⚠️  請編輯 config/.env 文件，填入您的微信公眾平台配置"
else
    echo "✅ 環境變量文件已存在"
fi

# 創建必要的目錄
echo "📁 創建必要的目錄..."
mkdir -p logs
mkdir -p uploads

echo "✅ 目錄創建完成"

# 檢查端口是否被佔用
PORT=3000
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 $PORT 已被佔用，請檢查是否有其他服務在運行"
else
    echo "✅ 端口 $PORT 可用"
fi

echo ""
echo "🎉 設置完成！"
echo ""
echo "📋 下一步操作："
echo "1. 編輯 config/.env 文件，填入您的微信公眾平台配置"
echo "2. 運行 'npm run dev' 啟動開發服務器"
echo "3. 訪問 http://localhost:3000 查看應用"
echo ""
echo "📚 更多信息請查看："
echo "- docs/wechat-setup.md (微信公眾平台配置)"
echo "- docs/deployment-guide.md (部署指南)"
echo "- README.md (項目說明)"
echo ""
echo "🔧 常用命令："
echo "- npm run dev     # 啟動開發服務器"
echo "- npm start       # 啟動生產服務器"
echo "- npm test        # 運行測試"
echo "" 