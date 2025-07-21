// 微信授權處理類
class WechatAuth {
    constructor() {
        this.userInfo = null;
        this.accessToken = null;
        this.openid = null;
        this.refreshToken = null;
        this.expiresIn = null;
        this.init();
    }

    // 初始化
    init() {
        this.loadUserInfo();
        this.updateUI();
    }

    // 開始微信授權
    async startAuth() {
        try {
            this.setLoading(true);
            
            // 生成授權URL
            const redirectUri = encodeURIComponent(`${window.location.origin}/wechat-auth`);
            const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?` +
                `appid=${this.getAppId()}&` +
                `redirect_uri=${redirectUri}&` +
                `response_type=code&` +
                `scope=snsapi_userinfo&` +
                `state=${this.generateState()}#wechat_redirect`;

            // 跳轉到微信授權頁面
            window.location.href = authUrl;
        } catch (error) {
            console.error('開始授權失敗:', error);
            this.showError('開始授權失敗: ' + error.message);
            this.setLoading(false);
        }
    }

    // 處理授權回調
    async handleCallback(code, state) {
        try {
            this.setLoading(true);
            
            // 使用code獲取access_token和openid
            const tokenResponse = await this.getAccessToken(code);
            if (!tokenResponse.success) {
                throw new Error(tokenResponse.message);
            }

            const { access_token, openid, expires_in, refresh_token } = tokenResponse.data;
            
            // 使用access_token和openid獲取用戶信息
            const userResponse = await this.getUserInfo(access_token, openid);
            if (!userResponse.success) {
                throw new Error(userResponse.message);
            }

            // 保存用戶信息
            this.userInfo = userResponse.data;
            this.accessToken = access_token;
            this.openid = openid;
            this.refreshToken = refresh_token;
            this.expiresIn = expires_in;

            // 保存到本地存儲
            this.saveUserInfo();

            // 更新UI
            this.updateUI();
            this.setLoading(false);

            return true;
        } catch (error) {
            console.error('處理授權回調失敗:', error);
            this.showError('授權失敗: ' + error.message);
            this.setLoading(false);
            return false;
        }
    }

    // 獲取access_token
    async getAccessToken(code) {
        try {
            const response = await fetch(`/.netlify/functions/wechat/access-token?code=${code}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('獲取access_token失敗:', error);
            return {
                success: false,
                message: '獲取access_token失敗'
            };
        }
    }

    // 獲取用戶信息
    async getUserInfo(accessToken, openid) {
        try {
            const response = await fetch(`/.netlify/functions/wechat/user-info?access_token=${accessToken}&openid=${openid}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('獲取用戶信息失敗:', error);
            return {
                success: false,
                message: '獲取用戶信息失敗'
            };
        }
    }

    // 檢查token有效性
    async checkToken() {
        if (!this.accessToken || !this.openid) {
            return {
                success: false,
                message: '沒有有效的token'
            };
        }

        try {
            const response = await fetch(`/.netlify/functions/wechat/check-token?access_token=${this.accessToken}&openid=${this.openid}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('檢查token失敗:', error);
            return {
                success: false,
                message: '檢查token失敗'
            };
        }
    }

    // 刷新token
    async refreshAccessToken() {
        if (!this.refreshToken) {
            return {
                success: false,
                message: '沒有refresh_token'
            };
        }

        try {
            const response = await fetch(`/.netlify/functions/wechat/refresh-token?refresh_token=${this.refreshToken}`);
            const data = await response.json();
            
            if (data.success) {
                this.accessToken = data.data.access_token;
                this.refreshToken = data.data.refresh_token;
                this.expiresIn = data.data.expires_in;
                this.saveUserInfo();
            }
            
            return data;
        } catch (error) {
            console.error('刷新token失敗:', error);
            return {
                success: false,
                message: '刷新token失敗'
            };
        }
    }

    // 登出
    logout() {
        this.userInfo = null;
        this.accessToken = null;
        this.openid = null;
        this.refreshToken = null;
        this.expiresIn = null;
        
        // 清除本地存儲
        localStorage.removeItem('wechat_user_info');
        localStorage.removeItem('wechat_tokens');
        
        this.updateUI();
        this.showSuccess('已成功登出');
    }

    // 保存用戶信息到本地存儲
    saveUserInfo() {
        if (this.userInfo) {
            localStorage.setItem('wechat_user_info', JSON.stringify(this.userInfo));
        }
        
        if (this.accessToken) {
            const tokens = {
                accessToken: this.accessToken,
                openid: this.openid,
                refreshToken: this.refreshToken,
                expiresIn: this.expiresIn,
                timestamp: Date.now()
            };
            localStorage.setItem('wechat_tokens', JSON.stringify(tokens));
        }
    }

    // 從本地存儲加載用戶信息
    loadUserInfo() {
        try {
            const userInfoStr = localStorage.getItem('wechat_user_info');
            const tokensStr = localStorage.getItem('wechat_tokens');
            
            if (userInfoStr) {
                this.userInfo = JSON.parse(userInfoStr);
            }
            
            if (tokensStr) {
                const tokens = JSON.parse(tokensStr);
                this.accessToken = tokens.accessToken;
                this.openid = tokens.openid;
                this.refreshToken = tokens.refreshToken;
                this.expiresIn = tokens.expiresIn;
                
                // 檢查token是否過期
                const now = Date.now();
                const tokenAge = now - tokens.timestamp;
                const tokenExpiresIn = tokens.expiresIn * 1000; // 轉換為毫秒
                
                if (tokenAge > tokenExpiresIn) {
                    // Token已過期，嘗試刷新
                    this.refreshAccessToken();
                }
            }
        } catch (error) {
            console.error('加載用戶信息失敗:', error);
        }
    }

    // 更新UI
    updateUI() {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        const authBtn = document.getElementById('authBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const userSection = document.getElementById('userSection');

        if (this.userInfo && this.accessToken) {
            // 已授權
            statusIndicator.className = 'status-indicator authenticated';
            statusText.textContent = '已授權';
            authBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            userSection.style.display = 'block';
            
            // 更新用戶信息顯示
            this.updateUserInfoDisplay();
        } else {
            // 未授權
            statusIndicator.className = 'status-indicator';
            statusText.textContent = '未授權';
            authBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
            userSection.style.display = 'none';
        }
    }

    // 更新用戶信息顯示
    updateUserInfoDisplay() {
        if (!this.userInfo) return;

        const userAvatar = document.getElementById('userAvatar');
        const userNickname = document.getElementById('userNickname');
        const userSex = document.getElementById('userSex');
        const userLocation = document.getElementById('userLocation');
        const userOpenid = document.getElementById('userOpenid');
        const userUnionid = document.getElementById('userUnionid');

        if (userAvatar) userAvatar.src = this.userInfo.headimgurl || '';
        if (userNickname) userNickname.textContent = this.userInfo.nickname || '未知';
        if (userSex) userSex.textContent = this.getSexText(this.userInfo.sex);
        if (userLocation) userLocation.textContent = this.getLocationText(this.userInfo);
        if (userOpenid) userOpenid.textContent = this.userInfo.openid || '';
        if (userUnionid) userUnionid.textContent = this.userInfo.unionid || '無';
    }

    // 獲取性別文本
    getSexText(sex) {
        switch (sex) {
            case 1: return '男';
            case 2: return '女';
            default: return '未知';
        }
    }

    // 獲取地區文本
    getLocationText(userInfo) {
        const parts = [];
        if (userInfo.country) parts.push(userInfo.country);
        if (userInfo.province) parts.push(userInfo.province);
        if (userInfo.city) parts.push(userInfo.city);
        return parts.length > 0 ? parts.join(' ') : '未知';
    }

    // 設置加載狀態
    setLoading(loading) {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        const authBtn = document.getElementById('authBtn');

        if (loading) {
            statusIndicator.className = 'status-indicator loading';
            statusText.textContent = '授權中...';
            authBtn.disabled = true;
        } else {
            statusIndicator.className = 'status-indicator';
            statusText.textContent = this.userInfo ? '已授權' : '未授權';
            authBtn.disabled = false;
        }
    }

    // 顯示成功消息
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    // 顯示錯誤消息
    showError(message) {
        this.showMessage(message, 'error');
    }

    // 顯示信息消息
    showInfo(message) {
        this.showMessage(message, 'info');
    }

    // 顯示消息
    showMessage(message, type = 'info') {
        // 創建消息元素
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // 插入到頁面頂部
        const container = document.querySelector('.container');
        container.insertBefore(messageDiv, container.firstChild);

        // 3秒後自動移除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    // 生成隨機state
    generateState() {
        return Math.random().toString(36).substring(2, 15);
    }

    // 獲取AppID（這裡需要根據實際情況配置）
    getAppId() {
        // 在實際應用中，這個值應該從服務器端獲取或配置
        return 'your_wechat_appid_here';
    }

    // 獲取當前用戶信息
    getCurrentUser() {
        return this.userInfo;
    }

    // 獲取當前token信息
    getCurrentTokens() {
        return {
            accessToken: this.accessToken,
            openid: this.openid,
            refreshToken: this.refreshToken,
            expiresIn: this.expiresIn
        };
    }
}

// 創建全局實例
window.wechatAuth = new WechatAuth();

// 全局函數
function startWechatAuth() {
    window.wechatAuth.startAuth();
}

function logout() {
    window.wechatAuth.logout();
}

async function getUserInfo() {
    const result = await window.wechatAuth.getUserInfo(
        window.wechatAuth.accessToken,
        window.wechatAuth.openid
    );
    
    const resultDiv = document.getElementById('getUserInfoResult');
    resultDiv.textContent = JSON.stringify(result, null, 2);
}

async function checkToken() {
    const result = await window.wechatAuth.checkToken();
    
    const resultDiv = document.getElementById('checkTokenResult');
    resultDiv.textContent = JSON.stringify(result, null, 2);
}

async function refreshToken() {
    const result = await window.wechatAuth.refreshAccessToken();
    
    const resultDiv = document.getElementById('refreshTokenResult');
    resultDiv.textContent = JSON.stringify(result, null, 2);
}

// 更新調試信息
function updateDebugInfo() {
    const debugInfo = document.getElementById('debugInfo');
    if (debugInfo) {
        const info = {
            userInfo: window.wechatAuth.getCurrentUser(),
            tokens: window.wechatAuth.getCurrentTokens(),
            timestamp: new Date().toISOString()
        };
        debugInfo.textContent = JSON.stringify(info, null, 2);
    }
}

// 定期更新調試信息
setInterval(updateDebugInfo, 5000);
updateDebugInfo(); 