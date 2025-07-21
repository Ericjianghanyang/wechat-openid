const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

const wechatRoutes = require('./routes/wechat');
const authRoutes = require('./routes/auth');

const app = express();

// 安全中間件
app.use(helmet());
app.use(cors({
  origin: process.env.BASE_URL || 'https://openid.meditechmacao.com',
  credentials: true
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 100 // 限制每個IP 15分鐘內最多100個請求
});
app.use(limiter);

// 解析JSON和URL編碼
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 靜態文件服務
app.use(express.static(path.join(__dirname, '../public')));

// API 路由
app.use('/api/wechat', wechatRoutes);
app.use('/api/auth', authRoutes);

// 主頁路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 微信授權頁面
app.get('/wechat-auth', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/wechat-auth.html'));
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服務器內部錯誤',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404處理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '頁面未找到'
  });
});

// Vercel 需要導出 app
module.exports = app; 