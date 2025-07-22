const axios = require('axios');

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
    const { access_token, openid } = req.body;

    console.log('收到Token驗證請求:', { access_token, openid });

    // 驗證參數
    if (!access_token) {
      return res.status(400).json({
        success: false,
        message: '缺少 access_token'
      });
    }

    if (!openid) {
      return res.status(400).json({
        success: false,
        message: '缺少 openid'
      });
    }

    // 檢驗 Token 有效性
    // 官方API：https://api.weixin.qq.com/sns/auth
    const authUrl = 'https://api.weixin.qq.com/sns/auth';
    const authParams = {
      access_token: access_token,
      openid: openid
    };

    console.log('請求驗證Token:', authUrl, authParams);

    const authResponse = await axios.get(authUrl, { params: authParams });
    const authData = authResponse.data;

    console.log('Token驗證響應:', authData);

    // 檢查結果
    if (authData.errcode === 0) {
      res.json({
        success: true,
        message: 'Token有效',
        data: authData
      });
    } else {
      res.json({
        success: false,
        message: 'Token無效',
        error: authData
      });
    }

  } catch (error) {
    console.error('驗證Token失敗:', error);
    
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