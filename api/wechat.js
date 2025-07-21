const express = require('express');
const axios = require('axios');
const router = express.Router();

// 微信API配置
const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APPID,
  secret: process.env.WECHAT_SECRET,
  baseUrl: 'https://api.weixin.qq.com'
};

// 生成微信授權URL
router.get('/auth-url', (req, res) => {
  try {
    const { redirect_uri, scope = 'snsapi_userinfo', state = '' } = req.query;
    
    if (!redirect_uri) {
      return res.status(400).json({
        success: false,
        message: '缺少redirect_uri參數'
      });
    }

    if (!WECHAT_CONFIG.appId) {
      return res.status(400).json({
        success: false,
        message: 'AppID未配置',
        error: 'WECHAT_APPID environment variable is not set'
      });
    }

    const authUrl = `${WECHAT_CONFIG.baseUrl}/connect/oauth2/authorize?` +
      `appid=${WECHAT_CONFIG.appId}&` +
      `redirect_uri=${encodeURIComponent(redirect_uri)}&` +
      `response_type=code&` +
      `scope=${scope}&` +
      `state=${state}#wechat_redirect`;

    res.json({
      success: true,
      data: {
        authUrl
      }
    });
  } catch (error) {
    console.error('生成授權URL錯誤:', error);
    res.status(500).json({
      success: false,
      message: '生成授權URL失敗'
    });
  }
});

// 使用code獲取access_token和openid
router.get('/access-token', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: '缺少code參數'
      });
    }

    if (!WECHAT_CONFIG.appId || !WECHAT_CONFIG.secret) {
      return res.status(400).json({
        success: false,
        message: '微信配置不完整'
      });
    }

    const url = `${WECHAT_CONFIG.baseUrl}/sns/oauth2/access_token`;
    const params = {
      appid: WECHAT_CONFIG.appId,
      secret: WECHAT_CONFIG.secret,
      code: code,
      grant_type: 'authorization_code'
    };

    const response = await axios.get(url, { params });
    const data = response.data;

    if (data.errcode) {
      return res.status(400).json({
        success: false,
        message: '獲取access_token失敗',
        error: data
      });
    }

    res.json({
      success: true,
      data: {
        access_token: data.access_token,
        openid: data.openid,
        expires_in: data.expires_in,
        refresh_token: data.refresh_token,
        scope: data.scope
      }
    });
  } catch (error) {
    console.error('獲取access_token錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取access_token失敗'
    });
  }
});

// 調試路由 - 檢查環境變量
router.get('/debug', (req, res) => {
  res.json({
    WECHAT_APPID: process.env.WECHAT_APPID ? '已設置' : '未設置',
    WECHAT_SECRET: process.env.WECHAT_SECRET ? '已設置' : '未設置',
    BASE_URL: process.env.BASE_URL || '未設置',
    NODE_ENV: process.env.NODE_ENV || '未設置'
  });
});

module.exports = router; 