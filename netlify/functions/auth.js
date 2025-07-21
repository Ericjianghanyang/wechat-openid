const axios = require('axios');

// 微信API配置
const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APPID,
  secret: process.env.WECHAT_SECRET,
  baseUrl: 'https://api.weixin.qq.com'
};

// 處理 CORS
function handleCORS(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  return headers;
}

// 完整的授權流程處理
async function handleWechatCallback(event) {
  try {
    const { code, state } = event.queryStringParameters || {};
    
    if (!code) {
      return {
        statusCode: 400,
        headers: handleCORS(event),
        body: JSON.stringify({
          success: false,
          message: '缺少授權碼'
        })
      };
    }

    // 第一步：使用code獲取access_token和openid
    const tokenUrl = `${WECHAT_CONFIG.baseUrl}/sns/oauth2/access_token`;
    const tokenParams = {
      appid: WECHAT_CONFIG.appId,
      secret: WECHAT_CONFIG.secret,
      code: code,
      grant_type: 'authorization_code'
    };

    const tokenResponse = await axios.get(tokenUrl, { params: tokenParams });
    const tokenData = tokenResponse.data;

    if (tokenData.errcode) {
      return {
        statusCode: 400,
        headers: handleCORS(event),
        body: JSON.stringify({
          success: false,
          message: '獲取access_token失敗',
          error: tokenData
        })
      };
    }

    const { access_token, openid, expires_in, refresh_token } = tokenData;

    // 第二步：使用access_token和openid獲取用戶信息
    const userUrl = `${WECHAT_CONFIG.baseUrl}/sns/userinfo`;
    const userParams = {
      access_token: access_token,
      openid: openid,
      lang: 'zh_CN'
    };

    const userResponse = await axios.get(userUrl, { params: userParams });
    const userData = userResponse.data;

    if (userData.errcode) {
      return {
        statusCode: 400,
        headers: handleCORS(event),
        body: JSON.stringify({
          success: false,
          message: '獲取用戶信息失敗',
          error: userData
        })
      };
    }

    // 返回完整的用戶信息
    return {
      statusCode: 200,
      headers: handleCORS(event),
      body: JSON.stringify({
        success: true,
        data: {
          openid: userData.openid,
          nickname: userData.nickname,
          sex: userData.sex,
          province: userData.province,
          city: userData.city,
          country: userData.country,
          headimgurl: userData.headimgurl,
          privilege: userData.privilege,
          unionid: userData.unionid,
          access_token: access_token,
          expires_in: expires_in,
          refresh_token: refresh_token
        }
      })
    };

  } catch (error) {
    console.error('微信授權回調錯誤:', error);
    return {
      statusCode: 500,
      headers: handleCORS(event),
      body: JSON.stringify({
        success: false,
        message: '授權處理失敗'
      })
    };
  }
}

// 主處理函數
exports.handler = async (event, context) => {
  try {
    const path = event.path.replace('/.netlify/functions/auth', '');
    
    switch (path) {
      case '/wechat-callback':
        return await handleWechatCallback(event);
      default:
        return {
          statusCode: 404,
          headers: handleCORS(event),
          body: JSON.stringify({
            success: false,
            message: 'API路徑不存在'
          })
        };
    }
  } catch (error) {
    console.error('函數執行錯誤:', error);
    return {
      statusCode: 500,
      headers: handleCORS(event),
      body: JSON.stringify({
        success: false,
        message: '服務器內部錯誤'
      })
    };
  }
}; 