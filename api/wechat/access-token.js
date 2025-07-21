const axios = require('axios');

// 微信API配置
const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APPID,
  secret: process.env.WECHAT_SECRET,
  baseUrl: 'https://api.weixin.qq.com'
};

module.exports = async (req, res) => {
  // 設置 CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.BASE_URL || 'https://openid.meditechmacao.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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
}; 