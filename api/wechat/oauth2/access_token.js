const axios = require('axios');

// 微信配置
const WECHAT_CONFIG = {
  appid: process.env.WECHAT_APPID,
  secret: process.env.WECHAT_SECRET
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
    const { code, state } = req.body;

    console.log('收到授權請求:', { code, state, appid: WECHAT_CONFIG.appid });

    // 驗證參數
    if (!code) {
      return res.status(400).json({
        success: false,
        message: '缺少授權碼 (code)'
      });
    }

    if (!WECHAT_CONFIG.appid || !WECHAT_CONFIG.secret) {
      return res.status(500).json({
        success: false,
        message: '微信配置不完整'
      });
    }

    // 第一步：通過 code 換取用戶授權 access_token
    // 官方API：https://api.weixin.qq.com/sns/oauth2/access_token
    const tokenUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token';
    const tokenParams = {
      appid: WECHAT_CONFIG.appid,
      secret: WECHAT_CONFIG.secret,
      code: code,
      grant_type: 'authorization_code'
    };

    console.log('請求 access_token:', tokenUrl, tokenParams);

    const tokenResponse = await axios.get(tokenUrl, { params: tokenParams });
    const tokenData = tokenResponse.data;

    console.log('access_token 響應:', tokenData);

    // 檢查是否有錯誤
    if (tokenData.errcode) {
      console.error('獲取 access_token 失敗:', tokenData);
      return res.status(400).json({
        success: false,
        message: '獲取 access_token 失敗',
        error: tokenData
      });
    }

    const { 
      access_token, 
      expires_in, 
      refresh_token, 
      openid, 
      scope, 
      is_snapshotuser,
      unionid 
    } = tokenData;

    // 第二步：如果 scope 是 snsapi_userinfo，則獲取用戶基本信息
    let userInfo = null;
    if (scope && scope.includes('snsapi_userinfo')) {
      try {
        console.log('開始獲取用戶基本信息...');
        
        // 官方API：https://api.weixin.qq.com/sns/userinfo
        const userInfoUrl = 'https://api.weixin.qq.com/sns/userinfo';
        const userInfoParams = {
          access_token: access_token,
          openid: openid,
          lang: 'zh_CN'
        };

        console.log('請求用戶信息:', userInfoUrl, userInfoParams);

        const userInfoResponse = await axios.get(userInfoUrl, { params: userInfoParams });
        userInfo = userInfoResponse.data;

        console.log('用戶信息響應:', userInfo);

        // 檢查是否有錯誤
        if (userInfo.errcode) {
          console.error('獲取用戶信息失敗:', userInfo);
          // 不返回錯誤，因為 access_token 已經獲取成功
          userInfo = null;
        }
      } catch (error) {
        console.error('獲取用戶信息異常:', error);
        // 不返回錯誤，因為 access_token 已經獲取成功
        userInfo = null;
      }
    }

    // 返回成功結果
    const result = {
      access_token: access_token,
      expires_in: expires_in,
      refresh_token: refresh_token,
      openid: openid,
      scope: scope,
      is_snapshotuser: is_snapshotuser,
      unionid: unionid
    };

    // 如果獲取到用戶信息，合併到結果中
    if (userInfo) {
      Object.assign(result, userInfo);
    }

    res.json({
      success: true,
      message: '授權成功',
      data: result
    });

  } catch (error) {
    console.error('處理授權請求失敗:', error);
    
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