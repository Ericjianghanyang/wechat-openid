# 部署和測試指南

## 第一步：環境準備

### 1. 安裝Node.js
確保您的系統已安裝Node.js（版本14或更高）：
```bash
node --version
npm --version
```

### 2. 安裝依賴
在項目根目錄執行：
```bash
npm install
```

## 第二步：配置環境變量

### 1. 複製環境變量文件
```bash
cp config/env.example config/.env
```

### 2. 編輯配置文件
編輯 `config/.env` 文件，填入您的微信公眾平台信息：
```env
# 微信公眾平台配置
WECHAT_APPID=your_actual_appid_here
WECHAT_SECRET=your_actual_secret_here

# 服務器配置
PORT=3000
NODE_ENV=development

# 網站域名配置
BASE_URL=https://yourdomain.com

# 安全配置
SESSION_SECRET=your_random_session_secret_here
```

## 第三步：本地開發測試

### 1. 啟動開發服務器
```bash
npm run dev
```

### 2. 訪問應用
打開瀏覽器訪問：`http://localhost:3000`

### 3. 測試功能
- 點擊"開始微信授權"按鈕
- 查看授權流程
- 測試API功能

## 第四步：生產環境部署

### 1. 準備服務器
確保您的服務器滿足以下要求：
- Node.js 14+
- HTTPS證書（微信要求）
- 域名備案（中國大陸）

### 2. 上傳代碼
將項目代碼上傳到服務器：
```bash
# 使用git
git clone your-repository
cd openid-new

# 或直接上傳文件
```

### 3. 安裝依賴
```bash
npm install --production
```

### 4. 配置環境變量
在服務器上配置生產環境變量：
```bash
cp config/env.example config/.env
# 編輯 .env 文件，填入生產環境配置
```

### 5. 啟動服務
```bash
npm start
```

### 6. 使用PM2管理進程（推薦）
```bash
# 安裝PM2
npm install -g pm2

# 啟動應用
pm2 start server/app.js --name "wechat-openid"

# 設置開機自啟
pm2 startup
pm2 save
```

## 第五步：微信公眾平台配置

### 1. 配置網頁授權域名
在微信公眾平台後台：
1. 進入"設置與開發" → "基本配置"
2. 在"網頁授權域名"中添加您的域名
3. 注意：必須是HTTPS協議

### 2. 配置自定義菜單
1. 進入"自定義菜單"
2. 創建菜單項，類型選擇"跳轉網頁"
3. URL設置為：`https://yourdomain.com/wechat-auth`

### 3. 測試菜單
1. 在微信中關注您的公眾號
2. 點擊自定義菜單
3. 查看是否正常跳轉和授權

## 第六步：測試流程

### 1. 基本功能測試
- [ ] 服務器正常啟動
- [ ] 主頁可以訪問
- [ ] 授權頁面可以訪問
- [ ] API接口正常響應

### 2. 微信授權測試
- [ ] 點擊授權按鈕跳轉到微信
- [ ] 用戶授權後正常回調
- [ ] 成功獲取用戶信息
- [ ] 用戶信息正確顯示

### 3. API功能測試
- [ ] 獲取用戶信息API
- [ ] 檢查Token有效性API
- [ ] 刷新Token API

### 4. 錯誤處理測試
- [ ] 網絡錯誤處理
- [ ] 授權失敗處理
- [ ] Token過期處理

## 第七步：常見問題解決

### 1. 授權失敗
**問題**：用戶點擊授權後提示失敗
**解決**：
- 檢查AppID和AppSecret是否正確
- 確認網頁授權域名配置正確
- 檢查redirect_uri是否與配置一致

### 2. 無法獲取用戶信息
**問題**：授權成功但無法獲取用戶信息
**解決**：
- 檢查scope是否設置為snsapi_userinfo
- 確認access_token是否有效
- 檢查網絡連接

### 3. 本地測試問題
**問題**：本地環境無法正常測試
**解決**：
- 使用ngrok等工具進行內網穿透
- 配置臨時域名進行測試
- 在微信公眾平台添加測試域名

### 4. HTTPS問題
**問題**：微信要求HTTPS但沒有證書
**解決**：
- 使用Let's Encrypt免費證書
- 使用雲服務商的SSL證書
- 開發階段可使用自簽名證書

## 第八步：安全注意事項

### 1. 保護敏感信息
- 不要在前端暴露AppSecret
- 使用環境變量存儲敏感信息
- 定期更換AppSecret

### 2. 防止CSRF攻擊
- 使用state參數防止CSRF
- 驗證授權來源
- 設置適當的CORS策略

### 3. 數據安全
- 加密存儲用戶信息
- 定期清理過期token
- 記錄授權日誌

## 第九步：監控和維護

### 1. 日誌監控
```bash
# 查看應用日誌
pm2 logs wechat-openid

# 查看錯誤日誌
pm2 logs wechat-openid --err
```

### 2. 性能監控
```bash
# 查看進程狀態
pm2 status

# 查看資源使用
pm2 monit
```

### 3. 定期維護
- 更新依賴包
- 檢查安全漏洞
- 備份重要數據
- 監控API調用次數

## 第十步：擴展功能

### 1. 添加數據庫
- 存儲用戶信息
- 記錄授權歷史
- 統計分析功能

### 2. 添加緩存
- Redis緩存token
- 減少API調用
- 提高響應速度

### 3. 添加更多功能
- 用戶管理
- 權限控制
- 消息推送
- 支付功能 