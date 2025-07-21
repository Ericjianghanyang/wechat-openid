# 微信公眾平台配置詳細步驟指南

## 📋 配置前準備

### 1. 微信公眾平台賬號
- 已註冊的微信公眾平台服務號
- 已通過企業認證（個人訂閱號無法使用網頁授權）
- 獲取到 AppID 和 AppSecret

### 2. 域名和服務器
- 已備案的域名（中國大陸要求）
- 支持 HTTPS 的服務器
- SSL 證書（微信要求必須使用 HTTPS）

## 🔧 第一步：微信公眾平台配置

### 1.1 配置網頁授權域名

1. **登錄微信公眾平台**
   - 訪問：https://mp.weixin.qq.com/
   - 使用您的公眾號賬號登錄

2. **進入基本配置**
   - 點擊左側菜單"設置與開發"
   - 選擇"基本配置"

3. **配置網頁授權域名**
   - 找到"網頁授權域名"設置項
   - 點擊"設置"按鈕
   - 添加您的域名（例如：`yourdomain.com`）
   - **重要**：不要包含 `http://` 或 `https://`，只填寫域名部分
   - **重要**：必須是備案域名，且支持 HTTPS

4. **驗證域名**
   - 微信會要求您在域名根目錄放置驗證文件
   - 下載驗證文件並上傳到您的服務器
   - 確保可以通過 `https://yourdomain.com/驗證文件名` 訪問

### 1.2 獲取 AppID 和 AppSecret

1. **查看 AppID**
   - 在"基本配置"頁面可以看到 AppID
   - 複製並保存這個 AppID

2. **獲取 AppSecret**
   - 點擊"AppSecret"旁邊的"重置"按鈕
   - 使用微信掃碼驗證身份
   - 複製新生成的 AppSecret
   - **重要**：AppSecret 只顯示一次，請妥善保存

### 1.3 創建自定義菜單

1. **進入自定義菜單**
   - 點擊左側菜單"自定義菜單"

2. **創建菜單項**
   - 點擊"添加菜單"
   - 菜單名稱：例如"我的網站"
   - 菜單類型：選擇"跳轉網頁"
   - 網頁地址：`https://yourdomain.com/wechat-auth`
   - 點擊"保存"

3. **發布菜單**
   - 點擊"發布"按鈕
   - 確認發布

## 🔧 第二步：項目配置

### 2.1 配置環境變量

編輯 `config/.env` 文件：

```env
# 微信公眾平台配置
WECHAT_APPID=您的實際AppID
WECHAT_SECRET=您的實際AppSecret

# 服務器配置
PORT=3000
NODE_ENV=production

# 網站域名配置
BASE_URL=https://yourdomain.com

# 安全配置
SESSION_SECRET=生成一個隨機字符串
```

### 2.2 生成隨機 Session Secret

```bash
# 在終端中執行以下命令生成隨機字符串
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🔧 第三步：服務器部署

### 3.1 準備服務器

1. **安裝 Node.js**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # CentOS/RHEL
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs
   ```

2. **安裝 PM2**
   ```bash
   npm install -g pm2
   ```

### 3.2 上傳和部署項目

1. **上傳代碼**
   ```bash
   # 使用 git
   git clone your-repository
   cd openid-new

   # 或直接上傳文件
   ```

2. **安裝依賴**
   ```bash
   npm install --production
   ```

3. **配置環境變量**
   ```bash
   cp config/env.example config/.env
   # 編輯 config/.env 文件
   ```

4. **啟動服務**
   ```bash
   # 使用 PM2 啟動
   pm2 start server/app.js --name "wechat-openid"
   
   # 設置開機自啟
   pm2 startup
   pm2 save
   ```

### 3.3 配置 Nginx（可選）

如果您使用 Nginx 作為反向代理：

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 第四步：測試流程

### 4.1 基本功能測試

1. **訪問主頁**
   - 打開瀏覽器訪問：`https://yourdomain.com`
   - 確認頁面正常顯示

2. **測試授權頁面**
   - 訪問：`https://yourdomain.com/wechat-auth`
   - 確認頁面正常顯示

3. **測試 API 接口**
   ```bash
   # 測試生成授權URL
   curl "https://yourdomain.com/api/wechat/auth-url?redirect_uri=https://yourdomain.com/wechat-auth"
   ```

### 4.2 微信環境測試

1. **在微信中測試**
   - 關注您的公眾號
   - 點擊自定義菜單
   - 查看是否正常跳轉

2. **授權流程測試**
   - 點擊授權按鈕
   - 確認跳轉到微信授權頁面
   - 完成授權後查看回調

## 🔧 第五步：授權流程詳解

### 5.1 完整授權流程

```
1. 用戶點擊自定義菜單
   ↓
2. 跳轉到您的網站 (https://yourdomain.com/wechat-auth)
   ↓
3. 網站重定向到微信授權頁面
   URL: https://open.weixin.qq.com/connect/oauth2/authorize?appid=YOUR_APPID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect
   ↓
4. 用戶在微信中授權
   ↓
5. 微信重定向回您的網站，帶上 code 參數
   URL: https://yourdomain.com/wechat-auth?code=CODE&state=STATE
   ↓
6. 您的網站使用 code 獲取 access_token 和 openid
   API: https://api.weixin.qq.com/sns/oauth2/access_token
   ↓
7. 使用 access_token 和 openid 獲取用戶信息
   API: https://api.weixin.qq.com/sns/userinfo
   ↓
8. 顯示用戶信息
```

### 5.2 授權範圍說明

- **snsapi_base**：靜默授權，只能獲取 openid，用戶無感知
- **snsapi_userinfo**：彈出授權頁面，可獲取用戶基本信息，需要用戶手動同意

### 5.3 重要參數說明

- **appid**：您的微信公眾平台 AppID
- **redirect_uri**：授權後的回調地址，必須與配置的域名一致
- **response_type**：固定值 "code"
- **scope**：授權範圍
- **state**：自定義參數，用於防止 CSRF 攻擊

## 🔧 第六步：常見問題解決

### 6.1 授權失敗

**問題**：用戶點擊授權後提示失敗
**解決方案**：
1. 檢查 AppID 和 AppSecret 是否正確
2. 確認網頁授權域名配置正確
3. 檢查 redirect_uri 是否與配置一致
4. 確認域名已備案且支持 HTTPS

### 6.2 無法獲取用戶信息

**問題**：授權成功但無法獲取用戶信息
**解決方案**：
1. 檢查 scope 是否設置為 snsapi_userinfo
2. 確認 access_token 是否有效
3. 檢查網絡連接
4. 查看服務器日誌

### 6.3 本地測試問題

**問題**：本地環境無法正常測試
**解決方案**：
1. 使用 ngrok 等工具進行內網穿透
2. 配置臨時域名進行測試
3. 在微信公眾平台添加測試域名

### 6.4 HTTPS 問題

**問題**：微信要求 HTTPS 但沒有證書
**解決方案**：
1. 使用 Let's Encrypt 免費證書
2. 使用雲服務商的 SSL 證書
3. 開發階段可使用自簽名證書

## 🔧 第七步：安全注意事項

### 7.1 保護敏感信息

- 不要在前端暴露 AppSecret
- 使用環境變量存儲敏感信息
- 定期更換 AppSecret

### 7.2 防止 CSRF 攻擊

- 使用 state 參數防止 CSRF
- 驗證授權來源
- 設置適當的 CORS 策略

### 7.3 數據安全

- 加密存儲用戶信息
- 定期清理過期 token
- 記錄授權日誌

## 🔧 第八步：監控和維護

### 8.1 日誌監控

```bash
# 查看應用日誌
pm2 logs wechat-openid

# 查看錯誤日誌
pm2 logs wechat-openid --err
```

### 8.2 性能監控

```bash
# 查看進程狀態
pm2 status

# 查看資源使用
pm2 monit
```

### 8.3 定期維護

- 更新依賴包
- 檢查安全漏洞
- 備份重要數據
- 監控 API 調用次數

## ✅ 配置完成檢查清單

- [ ] 微信公眾平台服務號註冊完成
- [ ] 企業認證通過
- [ ] AppID 和 AppSecret 獲取
- [ ] 網頁授權域名配置
- [ ] 域名備案完成
- [ ] HTTPS 證書配置
- [ ] 自定義菜單創建
- [ ] 環境變量配置
- [ ] 服務器部署完成
- [ ] 基本功能測試
- [ ] 微信環境測試
- [ ] 授權流程測試

完成以上步驟後，您的微信 OpenID 集成就配置完成了！ 