const axios = require('axios');

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
    const { access_token, openid } = req.query;
    
    if (!access_token || !openid) {
      return res.status(400).json({
        success: false,
        message: '缺少access_token或openid參數'
      });
    }

    const url = 'https://api.weixin.qq.com/sns/userinfo';
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
}; 