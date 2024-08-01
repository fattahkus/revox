import fetch from 'node-fetch';
import { Contract, ethers, JsonRpcProvider, Wallet } from 'ethers';
import fs from 'fs';
import { config } from './config.js';
import cron from 'node-cron';
import chalk from 'chalk';
import delay from 'delay';
import { HttpsProxyAgent } from 'https-proxy-agent';
import os from 'os';
import { setTimeout } from 'timers/promises';
import moment from 'moment';

// const proxyUrl = '';

const userAgentGenerator = {
    edge: function () {
        const edgeVersion = Math.floor(Math.random() * 100) + 90;
        const chromeVersion = Math.floor(Math.random() * 100) + 96;
        const safariVersion = Math.floor(Math.random() * 100) + 10;
        const webkitVersion = Math.floor(Math.random() * 700) + 500;
        const osPlatform = os.platform() === 'win32' ? 'Windows NT 10.0; Win64; x64' : 'Macintosh; Intel Mac OS X 10_15_17';
        const userAgent = `Mozilla/5.0 (${osPlatform}) AppleWebKit/${webkitVersion}.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.0.0 Safari/${webkitVersion}.36 Edg/${edgeVersion}.0.1901.203`;
        return userAgent;
    },
    chrome: function () {
        const windowsNtVersion = Math.floor(Math.random() * 100) + 7;
        const chromeVersion = Math.floor(Math.random() * 100) + 96;
        const webkitVersion = Math.floor(Math.random() * 700) + 500;
        const osPlatform = os.platform() === 'win32' ? `Windows NT ${windowsNtVersion}.0; Win64; x64` : 'Macintosh; Intel Mac OS X 10_15_17';
        const userAgent = `Mozilla/5.0 (${osPlatform}) AppleWebKit/${webkitVersion}.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.3163.100 Safari/${webkitVersion}.36`;
        return userAgent;
    },
    firefox: function () {
        const windowsNtVersion = Math.floor(Math.random() * 100) + 7;
        const firefoxVersion = Math.floor(Math.random() * 26) + 95;
        const geckoVersion = Math.floor(Math.random() * 30) + 20100101;
        const osPlatform = os.platform() === 'win32' ? `Windows NT ${windowsNtVersion}.0; Win64; x64` : 'Macintosh; Intel Mac OS X 10_15_17';
        const userAgent = `Mozilla/5.0 (${osPlatform}; rv: ${firefoxVersion}.0) Gecko/${geckoVersion} Firefox/${firefoxVersion}.0`;
        return userAgent;
    },
    safari: function () {
        const windowsNtVersion = Math.floor(Math.random() * 100) + 7;
        const safariVersion = Math.floor(Math.random() * 100) + 10;
        const webkitVersion = Math.floor(Math.random() * 100) + 500;
        const osPlatform = os.platform() === 'win32' ? `Windows NT ${windowsNtVersion}.0; Win64; x64` : 'Macintosh; Intel Mac OS X 10_15_17';
        const userAgent = `Mozilla/5.0 (${osPlatform}) AppleWebKit/${webkitVersion}.1.15 (KHTML, like Gecko) Version/${safariVersion}.1.15 Safari/${webkitVersion}.1.15`;
        return userAgent;
    },
    android: function () {
        const edgeVersion = Math.floor(Math.random() * 25) + 90;
        const androidVersion = Math.floor(Math.random() * 8) + 5;
        const chromeVersion = Math.floor(Math.random() * 20) + 96;
        const webkitVersion = Math.floor(Math.random() * 700) + 500;
        const osPlatform = Math.floor(Math.random() * 10)
        const userAgent = `Mozilla/5.0 (Linux; Android ${androidVersion}.${osPlatform}; K) AppleWebKit/5${webkitVersion}37.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.0.0 Mobile Safari/${webkitVersion}.36 EdgA/${edgeVersion}.0.1901.196`
        return userAgent;
    },
    ios: function () {
        const iosVersion = Math.floor(Math.random() * 8) + 9;
        const edgeVersion = Math.floor(Math.random() * 25) + 90;
        const safariVersion = Math.floor(Math.random() * 6) + 10;
        const webkitVersion = Math.floor(Math.random() * 700) + 500;
        const osPlatform = Math.floor(Math.random() * 10)
        const userAgent = `Mozilla/5.0 (iPhone; CPU iPhone OS ${iosVersion}_${osPlatform} like Mac OS X) AppleWebKit/${webkitVersion}.1.15 (KHTML, like Gecko) EdgiOS/${edgeVersion}.0.1901.187 Version/${safariVersion}.0 Mobile/15E148 Safari/${webkitVersion}.1`
        return userAgent;
    }
};
const login = (signature, walletAddress,randomUserAgent) => new Promise((resolve, reject) => {

    fetch('https://readon-api.readon.me/web/wallet_login', {
        method: 'POST',
        headers: {
            'Host': 'readon-api.readon.me',
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'Sec-Fetch-Site': 'same-site',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'Sec-Fetch-Mode': 'cors',
            'Origin': 'https://revox.readon.me',
            'User-Agent': randomUserAgent,
            // 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 BNC/2.84.3 BMP/4.28.0 NetType/wifi Language/id',
            'Content-Length': '245',
            'Sec-Fetch-Dest': 'empty',
            // 'Cookie': '_ga=GA1.1.1098011246.1719046897; _ga_QLH8Y0VQT8=GS1.1.1719046896.1.0.1719046896.0.0.0'
        },
        // agent: new HttpsProxyAgent(proxyUrl),
        body: JSON.stringify({
            'channel': 'binance',
            'signature': signature,
            'wallet_address': walletAddress,
            'from': 'lense'
        })
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err))
});

const getProfile = (jwt,randomUserAgent) => new Promise((resolve, reject) => {


    fetch('https://readon-api.readon.me/v1/content_incubator/user_profile', {
        headers: {
            'Host': 'readon-api.readon.me',
            'Accept': 'application/json, text/plain, */*',
            'Authorization': jwt,
            'Sec-Fetch-Site': 'same-site',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'Sec-Fetch-Mode': 'cors',
            'Origin': 'https://revox.readon.me',
            'User-Agent': randomUserAgent,
            // 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 BNC/2.84.3 BMP/4.28.0 NetType/wifi Language/id',
            'Sec-Fetch-Dest': 'empty',
            //   'Cookie': '_ga=GA1.1.1098011246.1719046897; _ga_QLH8Y0VQT8=GS1.1.1719046896.1.1.1719046919.0.0.0'
        },
        // agent: new HttpsProxyAgent(proxyUrl),
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err))
});

const getData = (endpoint, jwt,randomUserAgent) => new Promise((resolve, reject) => {


    fetch('https://readon-api.readon.me/v1' + endpoint, {
        headers: {
            'Host': 'readon-api.readon.me',
            'Accept': 'application/json, text/plain, */*',
            'Authorization': jwt,
            'Sec-Fetch-Site': 'same-site',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'Sec-Fetch-Mode': 'cors',
            'Origin': 'https://revox.readon.me',
            'User-Agent': randomUserAgent,
            // 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 BNC/2.84.3 BMP/4.28.0 NetType/wifi Language/id',
            'Sec-Fetch-Dest': 'empty',
            //   'Cookie': '_ga=GA1.1.1098011246.1719046897; _ga_QLH8Y0VQT8=GS1.1.1719046896.1.1.1719046919.0.0.0'
        },
        // agent: new HttpsProxyAgent(proxyUrl),
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err))
});

const bindCode = (jwt, walletAddress, code,randomUserAgent) => new Promise((resolve, reject) => {
    fetch('https://readon-api.readon.me/v1/content_incubator/bind_code', {
        method: 'POST',
        headers: {
            'Host': 'readon-api.readon.me',
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'Authorization': jwt,
            'Sec-Fetch-Site': 'same-site',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Sec-Fetch-Mode': 'cors',
            'Origin': 'https://revox.readon.me',
            'User-Agent': randomUserAgent,
            // 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 BNC/2.84.3 BMP/4.28.0 NetType/wifi Language/id',
            'Content-Length': '94',
            'Sec-Fetch-Dest': 'empty',
            // 'Cookie': '_ga=GA1.1.1098011246.1719046897; _ga_QLH8Y0VQT8=GS1.1.1719046896.1.1.1719046919.0.0.0'
        },
        // agent: new HttpsProxyAgent(proxyUrl),
        body: JSON.stringify({
            'code': code,
            'wallet_address': walletAddress,
            'from': 'lense'
        })
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err))
});

const finishTask = (jwt, task_id, time_key, randomUserAgent) => new Promise((resolve, reject) => {
    fetch("https://readon-api.readon.me/v1/lense/finish_task", {
        headers: {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          'Authorization': jwt,
          "content-type": "application/json",
          "priority": "u=1, i",
          'User-Agent': randomUserAgent,
          // 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 BNC/2.84.3 BMP/4.28.0 NetType/wifi Language/id',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site"
        },
        // agent: new HttpsProxyAgent(proxyUrl),
        referrerPolicy: "no-referrer",
        body: `{\"task_id\":${task_id},\"time_key\":\"${time_key}\"}`,
        method: "POST"
      })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err))
});

const getSymbol = (jwt, tokenSymbol, randomUserAgent) => new Promise((resolve, reject) => {
    fetch("https://readon-api.readon.me/v1/lense/get_conversation", {
        headers: {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          'Authorization': jwt,
          "content-type": "application/json",
          "priority": "u=1, i",
          'User-Agent': randomUserAgent,
          // 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 BNC/2.84.3 BMP/4.28.0 NetType/wifi Language/id',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site"
        },
        // agent: new HttpsProxyAgent(proxyUrl),
        referrerPolicy: "no-referrer",
        body: `{\"symbol\":\"${tokenSymbol}\",\"before_msg_id\":0}`,
        method: "POST"
      })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err))
});

const unlockSymbol = (jwt, tokenSymbol, randomUserAgent) => new Promise((resolve, reject) => {
    fetch("https://readon-api.readon.me/v1/lense/unlock_asset_tx", {
        headers: {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          'Authorization': jwt,
          "content-type": "application/json",
          "priority": "u=1, i",
          'User-Agent': randomUserAgent,
          // 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 BNC/2.84.3 BMP/4.28.0 NetType/wifi Language/id',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site"
        },
        // agent: new HttpsProxyAgent(proxyUrl),
        referrerPolicy: "no-referrer",
        body: `{\"symbol\":\"${tokenSymbol}\"}`,
        method: "POST"
      })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err))
});

(async () => {
    
            const RPC_URL = 'https://opbnb-mainnet-rpc.bnbchain.org';
            const REFF_CODE = '4UXUBL';

            // check file is exist
            if (fs.existsSync(`./pk.txt`)) {
                // console.log("File 'pk.txt' exist...")
            } else {
                // console.log("File 'pk.txt' does not exist, creating...")
                fs.appendFileSync(`./pk.txt`, '');
            }
        
            let pkData = fs.readFileSync(`./pk.txt`, 'utf-8').split(/\r\n|\n|\r/)
            // console.log('pkData ' + pkData)
            for (let index = 0; index < pkData.length; index++) {
                const indexs = index+1
                const randomUserAgent = userAgentGenerator.ios();
                const dataLength = pkData.length-index
                if(pkData[index]){
                    const publicKey = pkData[index].split('|')[0];
                    const privateKey = pkData[index].split('|')[1];
                    // console.log('Private key: ' + privateKey)
                
                    const provider = new JsonRpcProvider(RPC_URL)
                    const wallet = new Wallet(privateKey, provider);
        
                    console.log(`============================================== [${indexs}/${dataLength}] ==============================================`);
                    console.log(`[${moment().format("DD/MM/YY HH:mm:ss")}] Revox Check Points`);
                
                        // sign revox message
                        const message = "Sign in to REVOX";
                        const signature = await wallet.signMessage(message);
                
                        const walletAddress = wallet.address;
                
                        if (!fs.existsSync('./session')) {
                            fs.mkdirSync('./session')
                        }
                
                        let dataLogin;
                        let firstRun = false;
                        console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Checking session...`))
                        if (!fs.existsSync(`./session/${walletAddress}.json`)) {
                            console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Creating New Session!`))
                            const loginResult = await login(signature, walletAddress,randomUserAgent);
                            if (loginResult.message && loginResult.message === 'success') {
                                firstRun = true;
                                console.log(chalk.green(`[${moment().format("DD/MM/YY HH:mm:ss")}] Login Success!`))
                                dataLogin = loginResult
                                // console.log(dataLogin)
                                fs.writeFileSync(`./session/${walletAddress}.json`, JSON.stringify(dataLogin, 0, 2), 'utf-8')
                            } else {
                                console.log(`[${moment().format("DD/MM/YY HH:mm:ss")}] Login Failed : `,loginResult)
                                // process.exit(0)
                            }
                        } else {
                            const dataLoginExist = fs.readFileSync(`./session/${walletAddress}.json`, 'utf-8');
                            const jsonDataLogin = JSON.parse(dataLoginExist);
                            const profileData = await getProfile(jsonDataLogin.data.token,randomUserAgent);
                            if (profileData.message === 'Token expired') {
                                console.log(chalk.green('Active Session Expired, try to relogin...'))
                                const loginResult = await login(signature, walletAddress,randomUserAgent);
                                if (loginResult.message && loginResult.message === 'success') {
                                    console.log(chalk.green('Login Success!'))
                                    dataLogin = loginResult
                                    fs.writeFileSync(`./session/${walletAddress}.json`, JSON.stringify(dataLogin, 0, 2), 'utf-8')
                                } else {
                                    console.log(`[${moment().format("DD/MM/YY HH:mm:ss")}] `,loginResult)
                                    // process.exit(0)
                                }
                
                            } else {
                                console.log(chalk.green(`[${moment().format("DD/MM/YY HH:mm:ss")}] Have active session...`))
                                dataLogin = jsonDataLogin
                            }
                        };
                
                        const jwt = dataLogin.data.token;
                
                        if (firstRun) {
                            await getData('/lense/binance_passes', jwt,randomUserAgent);
                            await getData('/lense/binance_task_list?code=bnb', jwt,randomUserAgent);
                            await getData('/content_incubator/user_profile', jwt,randomUserAgent);
                            await getData('/lense/b_sign_in_info', jwt,randomUserAgent);
                            await getData('/lense/task_list', jwt,randomUserAgent);
                            await getData('/lense/settlement_result', jwt,randomUserAgent);
                            await getData('/content_incubator/get_cpoint', jwt,randomUserAgent);
                        };
                
                        const checkPoints = await getData('/lense/settlement_result', jwt,randomUserAgent);
                        const cPoint = await getData('/content_incubator/get_cpoint', jwt,randomUserAgent);
                        if(checkPoints.code === 0 && cPoint.code === 0){
                            console.log(`[${moment().format("DD/MM/YY HH:mm:ss")}] Wallet : ${chalk.green(wallet.address)} | Lense : P1 ${chalk.green(checkPoints.data.lense_points)} / P2 ${chalk.green(cPoint.data.cpoint)} | Premium : ${chalk.green(checkPoints.data.premium_points)}`);
                            fs.readFile(`./pk.txt`, function(err, data) { 
                                if (!err) {
                                if (pkData.length > 0) { 
                                    let data = fs.readFileSync(`./pk.txt`).toString().split('\n')
                                    data.shift()
                                    data = data.join('\n')
                                        fs.writeFile(`./pk.txt`, data, function(err) { 
                                            if (err) { 
                                                console.log(err);
                                            }
                                        });
                                        fs.appendFileSync(`./cpoint.txt`, `${publicKey}|${privateKey}|Lense : P1 ${checkPoints.data.lense_points} / P2 ${cPoint.data.cpoint}|Premium : ${checkPoints.data.premium_points}\n`, function(err) { 
                                            if (err) { 
                                                console.log(err);
                                            }
                                        });
                                    } else {
                                    }
                                } else {
                                    console.log(err);
                                }
                            });
                        }
                }
            }
})();