module.exports = async (req, res) => {
  // 設置 CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.BASE_URL || 'https://openid.meditechmacao.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: '只支持 GET 請求'
    });
  }

  try {
    // 檢查環境變量
    const envCheck = {
      WECHAT_APPID: process.env.WECHAT_APPID ? '已設置' : '未設置',
      WECHAT_SECRET: process.env.WECHAT_SECRET ? '已設置' : '未設置',
      BASE_URL: process.env.BASE_URL || '未設置',
      NODE_ENV: process.env.NODE_ENV || '未設置'
    };

    // 檢查 AppID 格式
    const appIdPattern = /^wx[a-f0-9]{16}$/;
    const isAppIdValid = process.env.WECHAT_APPID ? appIdPattern.test(process.env.WECHAT_APPID) : false;

    res.json({
      success: true,
      message: '環境變量檢查完成',
      data: {
        environment: envCheck,
        appIdValid: isAppIdValid,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('環境變量檢查失敗:', error);
    res.status(500).json({
      success: false,
      message: '環境變量檢查失敗',
      error: error.message
    });
  }
}; 