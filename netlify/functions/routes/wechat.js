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

// 使用access_token和openid獲取用戶信息
router.get('/user-info', async (req, res) => {
  try {
    const { access_token, openid } = req.query;
    
    if (!access_token || !openid) {
      return res.status(400).json({
        success: false,
        message: '缺少access_token或openid參數'
      });
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
      return res.status(400).json({
        success: false,
        message: '獲取用戶信息失敗',
        error: data
      });
    }

    res.json({
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
    });
  } catch (error) {
    console.error('獲取用戶信息錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取用戶信息失敗'
    });
  }
});

// 刷新access_token
router.get('/refresh-token', async (req, res) => {
  try {
    const { refresh_token } = req.query;
    
    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: '缺少refresh_token參數'
      });
    }

    const url = `${WECHAT_CONFIG.baseUrl}/sns/oauth2/refresh_token`;
    const params = {
      appid: WECHAT_CONFIG.appId,
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    };

    const response = await axios.get(url, { params });
    const data = response.data;

    if (data.errcode) {
      return res.status(400).json({
        success: false,
        message: '刷新access_token失敗',
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
    console.error('刷新access_token錯誤:', error);
    res.status(500).json({
      success: false,
      message: '刷新access_token失敗'
    });
  }
});

// 檢查access_token是否有效
router.get('/check-token', async (req, res) => {
  try {
    const { access_token, openid } = req.query;
    
    if (!access_token || !openid) {
      return res.status(400).json({
        success: false,
        message: '缺少access_token或openid參數'
      });
    }

    const url = `${WECHAT_CONFIG.baseUrl}/sns/auth`;
    const params = {
      access_token: access_token,
      openid: openid
    };

    const response = await axios.get(url, { params });
    const data = response.data;

    res.json({
      success: true,
      data: {
        isValid: data.errcode === 0,
        errcode: data.errcode,
        errmsg: data.errmsg
      }
    });
  } catch (error) {
    console.error('檢查token錯誤:', error);
    res.status(500).json({
      success: false,
      message: '檢查token失敗'
    });
  }
});

module.exports = router; 