const express = require('express');
const axios = require('axios');
const router = express.Router();

// 微信API配置
const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APPID,
  secret: process.env.WECHAT_SECRET,
  baseUrl: 'https://api.weixin.qq.com'
};

// 完整的授權流程處理
router.get('/wechat-callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: '缺少授權碼'
      });
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
      return res.status(400).json({
        success: false,
        message: '獲取access_token失敗',
        error: tokenData
      });
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
      return res.status(400).json({
        success: false,
        message: '獲取用戶信息失敗',
        error: userData
      });
    }

    // 返回完整的用戶信息
    res.json({
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
    });

  } catch (error) {
    console.error('微信授權回調錯誤:', error);
    res.status(500).json({
      success: false,
      message: '授權處理失敗'
    });
  }
});

// 檢查用戶是否已授權
router.get('/check-auth', (req, res) => {
  // 這裡可以檢查session或token來判斷用戶是否已授權
  // 實際應用中，您可能需要使用session或JWT來管理用戶狀態
  
  res.json({
    success: true,
    data: {
      isAuthenticated: false,
      message: '請先進行微信授權'
    }
  });
});

// 登出
router.post('/logout', (req, res) => {
  // 清除用戶session或token
  res.json({
    success: true,
    message: '登出成功'
  });
});

// 獲取當前用戶信息（需要先授權）
router.get('/current-user', (req, res) => {
  // 這裡應該從session或token中獲取當前用戶信息
  // 實際應用中，您需要實現用戶狀態管理
  
  res.json({
    success: false,
    message: '請先進行微信授權'
  });
});

module.exports = router; 