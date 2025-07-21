// 主應用邏輯
class App {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkEnvironment();
        this.updateDebugInfo();
    }

    // 綁定事件
    bindEvents() {
        // 頁面加載完成後執行
        document.addEventListener('DOMContentLoaded', () => {
            this.onPageLoad();
        });

        // 窗口大小改變時調整UI
        window.addEventListener('resize', () => {
            this.onResize();
        });
    }

    // 頁面加載完成
    onPageLoad() {
        console.log('應用已加載');
        
        // 檢查是否在微信環境中
        this.checkWechatEnvironment();
        
        // 初始化調試信息
        this.updateDebugInfo();
        
        // 設置定期更新
        setInterval(() => {
            this.updateDebugInfo();
        }, 5000);
    }

    // 窗口大小改變
    onResize() {
        // 可以添加響應式邏輯
        console.log('窗口大小已改變:', window.innerWidth, 'x', window.innerHeight);
    }

    // 檢查環境
    checkEnvironment() {
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        
        if (isLocalhost) {
            this.showInfo('當前運行在本地環境，某些功能可能受限');
        }

        // 檢查HTTPS
        if (window.location.protocol !== 'https:' && !isLocalhost) {
            this.showWarning('建議使用HTTPS協議以確保安全');
        }
    }

    // 檢查微信環境
    checkWechatEnvironment() {
        const isWechat = /MicroMessenger/i.test(navigator.userAgent);
        
        if (isWechat) {
            this.showInfo('檢測到微信環境');
            // 在微信中，可以直接使用微信JS-SDK
            this.initWechatSDK();
        } else {
            this.showInfo('非微信環境，將使用網頁授權');
        }
    }

    // 初始化微信JS-SDK（如果可用）
    initWechatSDK() {
        // 這裡可以添加微信JS-SDK的初始化代碼
        // 需要先引入微信JS-SDK
        console.log('微信JS-SDK初始化（需要額外配置）');
    }

    // 更新調試信息
    updateDebugInfo() {
        const debugInfo = document.getElementById('debugInfo');
        if (!debugInfo) return;

        const info = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            protocol: window.location.protocol,
            hostname: window.location.hostname,
            isWechat: /MicroMessenger/i.test(navigator.userAgent),
            localStorage: {
                wechat_user_info: localStorage.getItem('wechat_user_info') ? '已保存' : '無',
                wechat_tokens: localStorage.getItem('wechat_tokens') ? '已保存' : '無'
            },
            wechatAuth: window.wechatAuth ? {
                hasUserInfo: !!window.wechatAuth.userInfo,
                hasAccessToken: !!window.wechatAuth.accessToken,
                hasOpenid: !!window.wechatAuth.openid
            } : '未初始化'
        };

        debugInfo.textContent = JSON.stringify(info, null, 2);
    }

    // 顯示信息消息
    showInfo(message) {
        this.showMessage(message, 'info');
    }

    // 顯示警告消息
    showWarning(message) {
        this.showMessage(message, 'warning');
    }

    // 顯示錯誤消息
    showError(message) {
        this.showMessage(message, 'error');
    }

    // 顯示成功消息
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    // 顯示消息
    showMessage(message, type = 'info') {
        // 創建消息元素
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // 插入到頁面頂部
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(messageDiv, container.firstChild);

            // 3秒後自動移除
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 3000);
        }
    }

    // 工具函數：格式化時間
    formatTime(date) {
        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    }

    // 工具函數：生成隨機字符串
    generateRandomString(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // 工具函數：檢查網絡連接
    checkNetworkConnection() {
        return navigator.onLine;
    }

    // 工具函數：複製到剪貼板
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showSuccess('已複製到剪貼板');
        } catch (error) {
            console.error('複製失敗:', error);
            this.showError('複製失敗');
        }
    }
}

// 創建全局應用實例
window.app = new App();

// 全局工具函數
function copyOpenid() {
    const openidElement = document.getElementById('userOpenid');
    if (openidElement && openidElement.textContent) {
        window.app.copyToClipboard(openidElement.textContent);
    }
}

function copyUnionid() {
    const unionidElement = document.getElementById('userUnionid');
    if (unionidElement && unionidElement.textContent && unionidElement.textContent !== '無') {
        window.app.copyToClipboard(unionidElement.textContent);
    }
}

// 添加複製按鈕到用戶信息區域
function addCopyButtons() {
    const userOpenid = document.getElementById('userOpenid');
    const userUnionid = document.getElementById('userUnionid');

    if (userOpenid) {
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '複製';
        copyBtn.className = 'btn btn-test';
        copyBtn.style.marginLeft = '10px';
        copyBtn.onclick = copyOpenid;
        userOpenid.parentNode.appendChild(copyBtn);
    }

    if (userUnionid) {
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '複製';
        copyBtn.className = 'btn btn-test';
        copyBtn.style.marginLeft = '10px';
        copyBtn.onclick = copyUnionid;
        userUnionid.parentNode.appendChild(copyBtn);
    }
}

// 頁面加載完成後添加複製按鈕
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(addCopyButtons, 1000);
}); 