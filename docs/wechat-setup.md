# 微信公眾平台配置指南

## 第一步：微信公眾平台基礎配置

### 1. 註冊微信公眾平台
- 訪問 [微信公眾平台](https://mp.weixin.qq.com/)
- 註冊服務號（需要企業認證）
- 獲取 AppID 和 AppSecret

### 2. 配置服務器域名
在微信公眾平台後台：

1. **進入設置與開發 → 基本配置**
2. **配置JS接口安全域名**：
   - 添加您的網站域名（如：`https://yourdomain.com`）
   - 注意：必須是HTTPS協議
3. **配置網頁授權域名**：
   - 添加您的網站域名
   - 這是最重要的配置，用於獲取OpenID

### 3. 配置自定義菜單
1. **進入自定義菜單**
2. **創建菜單項**：
   ```json
   {
     "button": [
       {
         "type": "view",
         "name": "我的網站",
         "url": "https://yourdomain.com/wechat-auth"
       }
     ]
   }
   ```

## 第二步：網頁授權流程

### 授權流程說明
1. 用戶點擊自定義菜單
2. 跳轉到您的網站
3. 網站重定向到微信授權頁面
4. 用戶授權後，微信回調您的網站並帶上code參數
5. 使用code換取access_token和openid
6. 使用openid獲取用戶信息

### 授權URL格式
```
https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect
```

參數說明：
- `appid`: 您的微信公眾平台AppID
- `redirect_uri`: 授權後的回調地址（需要URL編碼）
- `response_type`: 固定值 "code"
- `scope`: 
  - `snsapi_base`: 靜默授權，只能獲取openid
  - `snsapi_userinfo`: 彈出授權頁面，可獲取用戶信息
- `state`: 自定義參數，用於防止CSRF攻擊

## 第三步：API接口說明

### 1. 獲取access_token
```
GET https://api.weixin.qq.com/sns/oauth2/access_token?appid=APPID&secret=SECRET&code=CODE&grant_type=authorization_code
```

### 2. 獲取用戶信息
```
GET https://api.weixin.qq.com/sns/userinfo?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN
```

## 注意事項
1. **域名必須是HTTPS**：微信要求所有網頁授權域名必須使用HTTPS協議
2. **域名備案**：在中國大陸，域名需要備案
3. **AppSecret安全**：AppSecret是敏感信息，不要在前端暴露
4. **授權範圍**：根據需求選擇合適的scope
5. **錯誤處理**：需要處理各種授權失敗的情況 