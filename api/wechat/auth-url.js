const axios = require('axios');

// 微信API配置
const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APPID,
  secret: process.env.WECHAT_SECRET,
  baseUrl: 'https://api.weixin.qq.com'
};

module.exports = (req, res) => {
  // 設置 CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.BASE_URL || 'https://openid.meditechmacao.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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
}; 