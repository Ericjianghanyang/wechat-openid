const express = require('express');
const cors = require('cors');
const wechatRoutes = require('./wechat');

const app = express();

// 中間件
app.use(cors({
  origin: process.env.BASE_URL || 'https://openid.meditechmacao.com',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/wechat', wechatRoutes);

// 調試路由
app.get('/api/debug', (req, res) => {
  res.json({
    message: 'API 服務正常運行',
    timestamp: new Date().toISOString(),
    env: {
      WECHAT_APPID: process.env.WECHAT_APPID ? '已設置' : '未設置',
      WECHAT_SECRET: process.env.WECHAT_SECRET ? '已設置' : '未設置',
      BASE_URL: process.env.BASE_URL || '未設置'
    }
  });
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服務器內部錯誤'
  });
});

module.exports = app; 