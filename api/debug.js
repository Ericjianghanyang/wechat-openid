module.exports = (req, res) => {
  // 設置 CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.BASE_URL || 'https://openid.meditechmacao.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.json({
    message: 'API 服務正常運行',
    timestamp: new Date().toISOString(),
    env: {
      WECHAT_APPID: process.env.WECHAT_APPID ? '已設置' : '未設置',
      WECHAT_SECRET: process.env.WECHAT_SECRET ? '已設置' : '未設置',
      BASE_URL: process.env.BASE_URL || '未設置'
    }
  });
}; 