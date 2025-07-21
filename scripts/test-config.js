#!/usr/bin/env node

/**
 * 微信OpenID集成配置測試腳本
 * 用於驗證項目配置是否正確
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 顏色輸出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

// 測試配置
async function testConfiguration() {
    log('🔧 開始測試微信OpenID集成配置...', 'bright');
    console.log('');

    // 1. 檢查環境變量文件
    logInfo('1. 檢查環境變量配置...');
    const envPath = path.join(__dirname, '../config/.env');
    
    if (!fs.existsSync(envPath)) {
        logError('環境變量文件不存在: config/.env');
        logInfo('請運行: cp config/env.example config/.env');
        return false;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^#][^=]+)=(.*)$/);
        if (match) {
            envVars[match[1].trim()] = match[2].trim();
        }
    });
    
    // 檢查必要的環境變量
    const requiredVars = ['WECHAT_APPID', 'WECHAT_SECRET', 'BASE_URL'];
    let envValid = true;
    
    requiredVars.forEach(varName => {
        if (!envVars[varName] || envVars[varName].includes('your_')) {
            logError(`${varName} 未正確配置`);
            envValid = false;
        } else {
            logSuccess(`${varName} 已配置`);
        }
    });
    
    if (!envValid) {
        logWarning('請編輯 config/.env 文件，填入正確的配置信息');
        return false;
    }
    
    console.log('');

    // 2. 檢查服務器是否運行
    logInfo('2. 檢查服務器狀態...');
    try {
        const response = await axios.get('http://localhost:3000', { timeout: 5000 });
        if (response.status === 200) {
            logSuccess('服務器正在運行 (http://localhost:3000)');
        } else {
            logError('服務器響應異常');
            return false;
        }
    } catch (error) {
        logError('服務器未運行或無法訪問');
        logInfo('請運行: npm run dev');
        return false;
    }
    
    console.log('');

    // 3. 測試API接口
    logInfo('3. 測試API接口...');
    try {
        const apiResponse = await axios.get('http://localhost:3000/api/wechat/auth-url?redirect_uri=http://localhost:3000/wechat-auth');
        
        if (apiResponse.data.success) {
            logSuccess('API接口正常響應');
            
            // 檢查授權URL格式
            const authUrl = apiResponse.data.data.authUrl;
            if (authUrl.includes('open.weixin.qq.com') && authUrl.includes('appid=')) {
                logSuccess('授權URL格式正確');
            } else {
                logWarning('授權URL格式可能不正確');
            }
        } else {
            logError('API接口返回錯誤');
            return false;
        }
    } catch (error) {
        logError('API接口測試失敗');
        console.error(error.message);
        return false;
    }
    
    console.log('');

    // 4. 檢查微信配置
    logInfo('4. 檢查微信公眾平台配置...');
    logInfo('請確認以下配置：');
    console.log('');
    
    const checklist = [
        '✅ 微信公眾平台服務號已註冊',
        '✅ 企業認證已通過',
        '✅ AppID 和 AppSecret 已獲取',
        '✅ 網頁授權域名已配置',
        '✅ 域名已備案（中國大陸）',
        '✅ HTTPS 證書已配置',
        '✅ 自定義菜單已創建'
    ];
    
    checklist.forEach(item => {
        log(item, 'cyan');
    });
    
    console.log('');

    // 5. 生成測試URL
    logInfo('5. 生成測試URL...');
    const testAuthUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${envVars.WECHAT_APPID}&redirect_uri=${encodeURIComponent('http://localhost:3000/wechat-auth')}&response_type=code&scope=snsapi_userinfo&state=test#wechat_redirect`;
    
    logInfo('測試授權URL（本地開發）：');
    log(testAuthUrl, 'magenta');
    
    console.log('');
    logInfo('注意：本地測試需要使用 ngrok 等工具進行內網穿透');
    
    console.log('');

    // 6. 檢查文件結構
    logInfo('6. 檢查項目文件結構...');
    const requiredFiles = [
        'server/app.js',
        'server/routes/wechat.js',
        'server/routes/auth.js',
        'public/index.html',
        'public/wechat-auth.html',
        'public/css/style.css',
        'public/js/wechat-auth.js',
        'package.json'
    ];
    
    let filesValid = true;
    requiredFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) {
            logSuccess(`${file} 存在`);
        } else {
            logError(`${file} 不存在`);
            filesValid = false;
        }
    });
    
    if (!filesValid) {
        return false;
    }
    
    console.log('');

    // 總結
    log('🎉 配置測試完成！', 'bright');
    console.log('');
    
    logInfo('下一步操作：');
    log('1. 確保微信公眾平台配置正確', 'cyan');
    log('2. 部署到生產環境（需要HTTPS）', 'cyan');
    log('3. 在微信中測試授權流程', 'cyan');
    log('4. 查看 docs/wechat-config-step-by-step.md 獲取詳細指南', 'cyan');
    
    console.log('');
    logInfo('常用命令：');
    log('npm run dev     # 啟動開發服務器', 'cyan');
    log('npm start       # 啟動生產服務器', 'cyan');
    log('pm2 start server/app.js --name "wechat-openid"  # 使用PM2啟動', 'cyan');
    
    return true;
}

// 運行測試
if (require.main === module) {
    testConfiguration().catch(error => {
        logError('測試過程中發生錯誤：');
        console.error(error);
        process.exit(1);
    });
}

module.exports = { testConfiguration }; 