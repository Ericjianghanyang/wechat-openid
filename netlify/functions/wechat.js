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

// 生成微信授權URL
async function generateAuthUrl(event) {
  try {
    const { redirect_uri, scope = 'snsapi_userinfo', state = '' } = event.queryStringParameters || {};
    
    if (!redirect_uri) {
      return {
        statusCode: 400,
        headers: handleCORS(event),
        body: JSON.stringify({
          success: false,
          message: '缺少redirect_uri參數'
        })
      };
    }

    const authUrl = `${WECHAT_CONFIG.baseUrl}/connect/oauth2/authorize?` +
      `appid=${WECHAT_CONFIG.appId}&` +
      `redirect_uri=${encodeURIComponent(redirect_uri)}&` +
      `response_type=code&` +
      `scope=${scope}&` +
      `state=${state}#wechat_redirect`;

    return {
      statusCode: 200,
      headers: handleCORS(event),
      body: JSON.stringify({
        success: true,
        data: {
          authUrl
        }
      })
    };
  } catch (error) {
    console.error('生成授權URL錯誤:', error);
    return {
      statusCode: 500,
      headers: handleCORS(event),
      body: JSON.stringify({
        success: false,
        message: '生成授權URL失敗'
      })
    };
  }
}

// 使用code獲取access_token和openid
async function getAccessToken(event) {
  try {
    const { code } = event.queryStringParameters || {};
    
    if (!code) {
      return {
        statusCode: 400,
        headers: handleCORS(event),
        body: JSON.stringify({
          success: false,
          message: '缺少code參數'
        })
      };
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
      return {
        statusCode: 400,
        headers: handleCORS(event),
        body: JSON.stringify({
          success: false,
          message: '獲取access_token失敗',
          error: data
        })
      };
    }

    return {
      statusCode: 200,
      headers: handleCORS(event),
      body: JSON.stringify({
        success: true,
        data: {
          access_token: data.access_token,
          openid: data.openid,
          expires_in: data.expires_in,
          refresh_token: data.refresh_token,
          scope: data.scope
        }
      })
    };
  } catch (error) {
    console.error('獲取access_token錯誤:', error);
    return {
      statusCode: 500,
      headers: handleCORS(event),
      body: JSON.stringify({
        success: false,
        message: '獲取access_token失敗'
      })
    };
  }
}

// 使用access_token和openid獲取用戶信息
async function getUserInfo(event) {
  try {
    const { access_token, openid } = event.queryStringParameters || {};
    
    if (!access_token || !openid) {
      return {
        statusCode: 400,
        headers: handleCORS(event),
        body: JSON.stringify({
          success: false,
          message: '缺少access_token或openid參數'
        })
      };
    }

    const url = `${WECHAT_CONFIG.baseUrl}/sns/userinfo`;
    const params = {
      access_token: access_token,
      openid: openid,
      lang: 'zh_CN'
    };

    const response = await axios.get(url, { params });
    const data = response.data;

    if (data.errcode) {
      return {
        statusCode: 400,
        headers: handleCORS(event),
        body: JSON.stringify({
          success: false,
          message: '獲取用戶信息失敗',
          error: data
        })
      };
    }

    return {
      statusCode: 200,
      headers: handleCORS(event),
      body: JSON.stringify({
        success: true,
        data: {
          openid: data.openid,
          nickname: data.nickname,
          sex: data.sex,
          province: data.province,
          city: data.city,
          country: data.country,
          headimgurl: data.headimgurl,
          privilege: data.privilege,
          unionid: data.unionid
        }
      })
    };
  } catch (error) {
    console.error('獲取用戶信息錯誤:', error);
    return {
      statusCode: 500,
      headers: handleCORS(event),
      body: JSON.stringify({
        success: false,
        message: '獲取用戶信息失敗'
      })
    };
  }
}

// 主處理函數
exports.handler = async (event, context) => {
  try {
    const path = event.path.replace('/.netlify/functions/wechat', '');
    
    switch (path) {
      case '/auth-url':
        return await generateAuthUrl(event);
      case '/access-token':
        return await getAccessToken(event);
      case '/user-info':
        return await getUserInfo(event);
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