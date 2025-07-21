# Netlify 部署詳細指南

## 🚀 為什麼選擇 Netlify？

Netlify 是部署微信 OpenID 集成項目的理想選擇，因為：

- ✅ **免費 HTTPS**：自動提供 SSL 證書
- ✅ **自定義域名**：支持自定義域名
- ✅ **全球 CDN**：快速訪問
- ✅ **Serverless Functions**：支持後端 API
- ✅ **自動部署**：連接 Git 倉庫自動部署
- ✅ **環境變量**：安全存儲敏感信息

## 📋 部署前準備

### 1. 準備 Git 倉庫

如果您還沒有 Git 倉庫，請先創建：

```bash
# 初始化 Git 倉庫
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub/GitLab
git remote add origin https://github.com/yourusername/wechat-openid.git
git push -u origin main
```

### 2. 獲取微信公眾平台信息

- AppID
- AppSecret
- 網頁授權域名（將是您的 Netlify 域名）

## 🔧 第一步：註冊 Netlify 賬號

1. **訪問 Netlify**
   - 打開 https://netlify.com
   - 點擊 "Sign up"

2. **選擇註冊方式**
   - 推薦使用 GitHub 賬號登錄
   - 這樣可以直接連接您的代碼倉庫

## 🔧 第二步：部署項目

### 方法一：從 Git 倉庫部署（推薦）

1. **連接 Git 倉庫**
   - 在 Netlify 控制台點擊 "New site from Git"
   - 選擇您的 Git 提供商（GitHub/GitLab）
   - 選擇您的倉庫

2. **配置構建設置**
   ```
   Build command: npm run build
   Publish directory: public
   ```

3. **設置環境變量**
   - 點擊 "Environment variables"
   - 添加以下變量：
     ```
     WECHAT_APPID=您的AppID
     WECHAT_SECRET=您的AppSecret
     ```

4. **部署**
   - 點擊 "Deploy site"
   - 等待部署完成

### 方法二：手動上傳

1. **構建項目**
   ```bash
   npm run build
   ```

2. **上傳到 Netlify**
   - 在 Netlify 控制台點擊 "New site from Git"
   - 選擇 "Deploy manually"
   - 拖拽 `public` 文件夾到上傳區域

## 🔧 第三步：配置自定義域名

### 1. 獲取 Netlify 域名

部署完成後，您會得到一個類似這樣的域名：
```
https://amazing-name-123456.netlify.app
```

### 2. 設置自定義域名（可選）

1. **在 Netlify 控制台**
   - 進入您的站點設置
   - 點擊 "Domain settings"
   - 點擊 "Add custom domain"

2. **添加域名**
   - 輸入您的域名（例如：`yourdomain.com`）
   - 按照提示配置 DNS 記錄

## 🔧 第四步：配置微信公眾平台

### 1. 配置網頁授權域名

在微信公眾平台後台：

1. **進入基本配置**
   - 設置與開發 → 基本配置

2. **添加網頁授權域名**
   - 找到"網頁授權域名"
   - 添加您的 Netlify 域名
   - 例如：`yourdomain.com` 或 `amazing-name-123456.netlify.app`

### 2. 創建自定義菜單

1. **進入自定義菜單**
   - 點擊"自定義菜單"

2. **創建菜單項**
   ```
   菜單名稱：我的網站
   菜單類型：跳轉網頁
   網頁地址：https://yourdomain.com/wechat-auth
   ```

## 🔧 第五步：測試部署

### 1. 基本功能測試

1. **訪問主頁**
   - 打開您的 Netlify 域名
   - 確認頁面正常顯示

2. **測試授權頁面**
   - 訪問：`https://yourdomain.com/wechat-auth`
   - 確認頁面正常顯示

3. **測試 API 接口**
   ```bash
   # 測試生成授權URL
   curl "https://yourdomain.com/.netlify/functions/wechat/auth-url?redirect_uri=https://yourdomain.com/wechat-auth"
   ```

### 2. 微信環境測試

1. **在微信中測試**
   - 關注您的公眾號
   - 點擊自定義菜單
   - 查看是否正常跳轉

2. **完成授權流程**
   - 點擊授權按鈕
   - 完成微信授權
   - 查看獲取的用戶信息

## 🔧 第六步：環境變量配置

### 1. 在 Netlify 中設置環境變量

1. **進入站點設置**
   - 在 Netlify 控制台選擇您的站點
   - 點擊 "Site settings"

2. **添加環境變量**
   - 點擊 "Environment variables"
   - 添加以下變量：
     ```
     WECHAT_APPID=您的微信AppID
     WECHAT_SECRET=您的微信AppSecret
     ```

3. **重新部署**
   - 點擊 "Trigger deploy" → "Deploy site"

### 2. 驗證環境變量

部署完成後，您可以通過以下方式驗證：

1. **查看函數日誌**
   - 在 Netlify 控制台點擊 "Functions"
   - 查看函數執行日誌

2. **測試 API**
   - 訪問授權頁面
   - 查看瀏覽器開發者工具的網絡請求

## 🔧 第七步：監控和維護

### 1. 查看部署狀態

- **部署日誌**：在 Netlify 控制台查看部署過程
- **函數日誌**：查看 Serverless Functions 執行情況
- **訪問統計**：查看網站訪問數據

### 2. 自動部署

- **Git 推送**：每次推送到 Git 倉庫都會自動部署
- **分支部署**：可以設置不同分支的部署策略
- **預覽部署**：Pull Request 會創建預覽站點

## 🔧 第八步：故障排除

### 1. 常見問題

**問題**：函數執行失敗
**解決**：
- 檢查環境變量是否正確設置
- 查看函數日誌
- 確認依賴包是否正確安裝

**問題**：授權失敗
**解決**：
- 確認網頁授權域名配置正確
- 檢查 AppID 和 AppSecret
- 確認 redirect_uri 與配置一致

**問題**：CORS 錯誤
**解決**：
- 檢查函數中的 CORS 配置
- 確認請求來源是否正確

### 2. 調試技巧

1. **查看函數日誌**
   ```bash
   # 在 Netlify 控制台查看函數日誌
   Functions → 選擇函數 → Logs
   ```

2. **本地測試**
   ```bash
   # 安裝 Netlify CLI
   npm install -g netlify-cli

   # 本地運行函數
   netlify dev
   ```

3. **檢查環境變量**
   ```bash
   # 在函數中添加日誌
   console.log('Environment variables:', {
     appId: process.env.WECHAT_APPID,
     secret: process.env.WECHAT_SECRET ? '已設置' : '未設置'
   });
   ```

## ✅ 部署完成檢查清單

- [ ] Netlify 賬號註冊
- [ ] Git 倉庫連接
- [ ] 項目部署成功
- [ ] 環境變量配置
- [ ] 自定義域名設置（可選）
- [ ] 微信公眾平台配置
- [ ] 網頁授權域名添加
- [ ] 自定義菜單創建
- [ ] 基本功能測試
- [ ] 微信環境測試
- [ ] 授權流程測試

## 🎉 部署完成！

完成以上步驟後，您的微信 OpenID 集成項目就成功部署到 Netlify 了！

### 下一步：

1. **測試完整流程**
2. **監控使用情況**
3. **根據需求優化**
4. **添加更多功能**

### 獲取幫助：

- Netlify 文檔：https://docs.netlify.com/
- 微信公眾平台文檔：https://developers.weixin.qq.com/doc/
- 項目文檔：查看 `docs/` 目錄下的其他文檔 