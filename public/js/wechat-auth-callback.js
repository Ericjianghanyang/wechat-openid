// 微信授權回調處理
class WechatAuthCallback {
    constructor() {
        this.init();
    }

    init() {
        // 檢查URL參數
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
            this.handleError(error);
            return;
        }

        if (code) {
            this.handleAuthCallback(code, state);
        } else {
            this.showError('缺少授權碼');
        }
    }

    // 處理授權回調
    async handleAuthCallback(code, state) {
        try {
            this.updateLoadingMessage('正在獲取用戶信息...');
            
            // 調用後端API處理授權
            const response = await fetch(`/.netlify/functions/auth/wechat-callback?code=${code}&state=${state || ''}`);
            const data = await response.json();

            if (data.success) {
                this.handleSuccess(data.data);
            } else {
                this.handleError(data.message || '授權失敗');
            }
        } catch (error) {
            console.error('處理授權回調失敗:', error);
            this.handleError('網絡錯誤，請重試');
        }
    }

    // 處理成功
    handleSuccess(userData) {
        // 隱藏加載狀態
        this.hideLoading();
        
        // 顯示成功信息
        this.showSuccess();
        
        // 保存用戶信息到本地存儲
        this.saveUserData(userData);
        
        // 顯示用戶信息
        this.displayUserInfo(userData);
        
        // 3秒後跳轉到主頁
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
    }

    // 處理錯誤
    handleError(message) {
        this.hideLoading();
        this.showError(message);
    }

    // 更新加載消息
    updateLoadingMessage(message) {
        const authMessage = document.getElementById('authMessage');
        if (authMessage) {
            authMessage.textContent = message;
        }
    }

    // 隱藏加載狀態
    hideLoading() {
        const loadingDiv = document.querySelector('.auth-loading');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
    }

    // 顯示成功信息
    showSuccess() {
        const successDiv = document.getElementById('successMessage');
        if (successDiv) {
            successDiv.style.display = 'block';
        }
    }

    // 顯示錯誤信息
    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    // 保存用戶數據
    saveUserData(userData) {
        try {
            localStorage.setItem('wechat_user_info', JSON.stringify(userData));
            
            const tokens = {
                accessToken: userData.access_token,
                openid: userData.openid,
                refreshToken: userData.refresh_token,
                expiresIn: userData.expires_in,
                timestamp: Date.now()
            };
            localStorage.setItem('wechat_tokens', JSON.stringify(tokens));
        } catch (error) {
            console.error('保存用戶數據失敗:', error);
        }
    }

    // 顯示用戶信息
    displayUserInfo(userData) {
        const userInfoDisplay = document.getElementById('userInfoDisplay');
        if (userInfoDisplay) {
            userInfoDisplay.innerHTML = `
                <div style="margin-top: 15px;">
                    <p><strong>暱稱：</strong>${userData.nickname || '未知'}</p>
                    <p><strong>性別：</strong>${this.getSexText(userData.sex)}</p>
                    <p><strong>地區：</strong>${this.getLocationText(userData)}</p>
                    <p><strong>OpenID：</strong><span style="font-family: monospace; color: #e74c3c;">${userData.openid}</span></p>
                </div>
            `;
        }
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
    getLocationText(userData) {
        const parts = [];
        if (userData.country) parts.push(userData.country);
        if (userData.province) parts.push(userData.province);
        if (userData.city) parts.push(userData.city);
        return parts.length > 0 ? parts.join(' ') : '未知';
    }
}

// 全局函數
function retryAuth() {
    // 重新開始授權流程
    window.location.href = '/';
}

function goHome() {
    // 返回首頁
    window.location.href = '/';
}

// 頁面加載完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    new WechatAuthCallback();
}); 