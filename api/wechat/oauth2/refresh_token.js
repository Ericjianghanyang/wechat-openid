const axios = require('axios');

// 微信配置
const WECHAT_CONFIG = {
  appid: process.env.WECHAT_APPID
};

module.exports = async (req, res) => {
  // 設置 CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.BASE_URL || 'https://openid.meditechmacao.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: '只支持 POST 請求'
    });
  }

  try {
    const { refresh_token } = req.body;

    console.log('收到刷新Token請求:', { refresh_token, appid: WECHAT_CONFIG.appid });

    // 驗證參數
    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: '缺少 refresh_token'
      });
    }

    if (!WECHAT_CONFIG.appid) {
      return res.status(500).json({
        success: false,
        message: '微信配置不完整'
      });
    }

    // 刷新授權 Token
    // 官方API：https://api.weixin.qq.com/sns/oauth2/refresh_token
    const refreshUrl = 'https://api.weixin.qq.com/sns/oauth2/refresh_token';
    const refreshParams = {
      appid: WECHAT_CONFIG.appid,
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    };

    console.log('請求刷新Token:', refreshUrl, refreshParams);

    const refreshResponse = await axios.get(refreshUrl, { params: refreshParams });
    const refreshData = refreshResponse.data;

    console.log('刷新Token響應:', refreshData);

    // 檢查是否有錯誤
    if (refreshData.errcode) {
      console.error('刷新Token失敗:', refreshData);
      return res.status(400).json({
        success: false,
        message: '刷新Token失敗',
        error: refreshData
      });
    }

    const { 
      access_token, 
      expires_in, 
      refresh_token: new_refresh_token, 
      openid, 
      scope 
    } = refreshData;

    res.json({
      success: true,
      message: 'Token刷新成功',
      data: {
        access_token: access_token,
        expires_in: expires_in,
        refresh_token: new_refresh_token,
        openid: openid,
        scope: scope
      }
    });

  } catch (error) {
    console.error('刷新Token失敗:', error);
    
    // 如果是 axios 錯誤，提供更詳細的信息
    if (error.response) {
      console.error('微信 API 響應錯誤:', error.response.data);
      return res.status(500).json({
        success: false,
        message: '微信 API 調用失敗',
        error: error.response.data
      });
    }

    res.status(500).json({
      success: false,
      message: '服務器內部錯誤',
      error: error.message
    });
  }
}; 