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

const proxyUrl = 'http://brd-customer-hl_e9344a78-zone-data_center:54h3c6twdc8f@brd.superproxy.io:22225';

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
        agent: new HttpsProxyAgent(proxyUrl),
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
        agent: new HttpsProxyAgent(proxyUrl),
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
        agent: new HttpsProxyAgent(proxyUrl),
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
        agent: new HttpsProxyAgent(proxyUrl),
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
        agent: new HttpsProxyAgent(proxyUrl),
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
        agent: new HttpsProxyAgent(proxyUrl),
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
        agent: new HttpsProxyAgent(proxyUrl),
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
                    if(pkData.length === 0 || pkData.length === 1){
                        // console.log("kosong")
                        // check file is exist
                        if (fs.existsSync(`./pk.temp`)) {
                            console.log(`[${moment().format("DD/MM/YY HH:mm:ss")}] File 'pk.temp' exist, moving data...`)
                            const tmpData = fs.readFileSync(`./pk.temp`, 'utf-8').split(/\r\n|\n|\r/)
                            for (let index = 0; index < tmpData.length; index++) {
                                const tmpDataLength = tmpData.length-index
                                const tmppublicKey = tmpData[index].split('|')[0];
                                const tmpprivateKey = tmpData[index].split('|')[1];
                                if(tmpData[index]){
                                    try{
                                        fs.readFile(`./pk.temp`, function(err, data) { 
                                            if (!err) {
                                            if (tmpDataLength > 0) { 
                                                let data = fs.readFileSync(`./pk.temp`).toString().split('\n')
                                                data.shift()
                                                data = data.join('\n')
                                                    fs.writeFile(`./pk.temp`, data, function(err) { 
                                                        if (err) { 
                                                            console.log(err);
                                                        }
                                                    });
                                                    data = `${tmppublicKey}|${tmpprivateKey}\n`
                                                    fs.appendFileSync(`./pk.txt`, data, function(err) { 
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
                                        // console.log(`${index} | ${tmppublicKey} | ${tmpprivateKey}`)
                                        await delay(10)
                                    }catch(e){
                                        console.log(e);
                                    }
                                }
                            }
                        } else {
                            console.log(`[${moment().format("DD/MM/YY HH:mm:ss")}] File 'pk.temp' does not exist, creating...`)
                            fs.appendFileSync(`./pk.temp`, '');
                        }
                    }
                    
                    // console.log('pkData ' + pkData)
                    pkData = fs.readFileSync(`./pk.txt`, 'utf-8').split(/\r\n|\n|\r/)
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
                    console.log(`[${moment().format("DD/MM/YY HH:mm:ss")}] Revox Auto Claim Credit`);
                    console.log(`[${moment().format("DD/MM/YY HH:mm:ss")}] Reff Code : ${chalk.green(REFF_CODE)} | Wallet Address : ${chalk.green(wallet.address)}`);
                
                
                    // console.log('Waiting running every 01:00...')
                    // cron.schedule('0 01 * * *', async () => {
                        // console.log('Running process...')
                
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
                            await getData('/lense/task_list', jwt,randomUserAgent);
                
                            console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Trying to bind code on first run :`, REFF_CODE))
                            const bindCodeResult = await bindCode(jwt, walletAddress, REFF_CODE,randomUserAgent);
                            if (bindCodeResult.code == 0) {
                                console.log(chalk.green(`[${moment().format("DD/MM/YY HH:mm:ss")}] Success Binding code on first run :`, REFF_CODE))
                                await getProfile(jwt,randomUserAgent)
                            }
                        };
                
                        const taskInfoToday = await getData('/lense/b_sign_in_info', jwt,randomUserAgent);
                        const findTaskToday = taskInfoToday.data.bonus_task_info.find(x => x.date === taskInfoToday.data.current_date);
                        console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Checking for claim...`))
                        if (findTaskToday && findTaskToday.status === 1) {
                            // console.log(chalk.yellow('Checkin Time!'))
                            try {
                                console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Try to claiming...`))
                                // contract claim credit 
                                const contract = new Contract(config.contractAddress, config.abi, wallet);
                                const txClaimCredit = await contract.claimCredit();
                                // Wait for the transaction to be mined
                                await txClaimCredit.wait();
                                console.log(`[${moment().format("DD/MM/YY HH:mm:ss")}] Claim Success! Tx hash: `, chalk.green(txClaimCredit.hash));
                                console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Checking for SignIn, delay 15s...`))
                
                                // daily SignIn
                                await delay(15000)
                                const taskSignInfoToday = await getData('/lense/sign_in_info', jwt,randomUserAgent);
                                // console.log(taskSignInfoToday.data.bonus_task_info)
                                const findSignTaskToday = taskSignInfoToday.data.bonus_task_info.find(x => x.date === taskSignInfoToday.data.current_date);
                                // console.log(findSignTaskToday)
                                if (findSignTaskToday && findSignTaskToday.status === 1) {
                                    // console.log(chalk.yellow('SignIn Time!'))
                                    try {
                                        console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Try to SignIn...`))
                                        // contract claim credit 
                                        const claimSignInfoToday = await getData(`/lense/sign_in_claim?date=${taskSignInfoToday.data.current_date}`, jwt,randomUserAgent);
                                        if(claimSignInfoToday.code === 0){
                                            console.log(chalk.green(`[${moment().format("DD/MM/YY HH:mm:ss")}] SignIn Success!`))
                                        }
                                    } catch (error) {
                                        console.log(`[${moment().format("DD/MM/YY HH:mm:ss")}] SignIn Error : ${error.toString()}`)
                                    }
                                } else if (findSignTaskToday && findSignTaskToday.status === 2) {
                                    console.log(chalk.green(`[${moment().format("DD/MM/YY HH:mm:ss")}] U have SignIn today!`))
                                } else if (findSignTaskToday && findSignTaskToday.status === 3) {
                                    console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Not time to SignIn!`))
                                } else {
                                    console.log(`[${moment().format("DD/MM/YY HH:mm:ss")}] Fuck SignIn error : `, findSignTaskToday.toString())
                                }

                                // daily analyze
                                console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Checking for daily analyze...`))
                                const getCredit = await getData('/lense/credit_balance', jwt,randomUserAgent);
                                if(getCredit.message === "success"){
                                    if(getCredit.data.balance > 0){
                                        const getIndex = (getCredit.data.balance/4)+1
                                        // tokenSymbol 63
                                        const tokenSymbol = ["BTC","ONDO","ZRO","TAO","BRETT","BALT","BNB","PAX","BNBG","BPAY","BNBD","BNBB","USDT","USDTV","USDTE","USDTZ","USDTBS","ETH","OS","ENS","3TH","EMS","XLC","EUT","SOL","SB","EYE","SLB","SCS","SAX","SXP","SSB","STR","SLX","XRP","XRPC","XRPS","XRPBEAR","XRPAYNET","XCE","XRPH","XRP20","XRPBULL","DOT","DTBX","PINK","MOOV","DAO","DGS","DAL","DAOG","DAOT","HAUS","DAOSOL","DAOP","VEST","RICE","DAOSOL","HAUS","DAOT","USDC","ADA","SHIB"]
                                        // generate random 5 number
                                        var arr = [];
                                        while(arr.length < getIndex){
                                            var r = Math.floor(Math.random() * tokenSymbol.length-1) + 1;
                                            if(arr.indexOf(r) === -1) arr.push(r);
                                        }
                                        // generate random 5 tokenSymbol
                                        let index = 0
                                        while(index < 5){
                                            index++
                                            // console.log(`${index} | ${tokenSymbol[arr[index]]}`)
                                            console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Try to analyze token ${tokenSymbol[arr[index]]}...`))
                                            const getSymbols = await getSymbol(jwt, tokenSymbol[arr[index]], randomUserAgent)
                                            if(getSymbols.message === "lense card is lock"){
                                                const unlockSymbols = await unlockSymbol(jwt, tokenSymbol[arr[index]], randomUserAgent)
                                                if(unlockSymbols.message === "success"){
                                                    console.log(chalk.green(`[${moment().format("DD/MM/YY HH:mm:ss")}] Analyze token ${tokenSymbol[arr[index]]} Success!`))
                                                }
                                            }
                                        }
                                    }
                                }

                                // daily tasks
                                console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Checking for daily task...`))
                                const taskList = await getData('/lense/task_list', jwt,randomUserAgent);
                                // console.log(taskList)
                                const taskData = taskList.data
                                taskData.forEach(async (element) => {
                                    // console.log("element :",element)
                                    if(element){
                                        const task_id = element.task_id
                                        const time_key = element.time_key
                                        const task_status = element.task_status

                                        if(element && task_status === 2){
                                            const taskFinish = await finishTask(jwt, task_id, time_key, randomUserAgent);
                                            if(taskFinish && taskFinish.code === 0){
                                                console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Try to claiming task : ${task_id}...`))
                                                console.log(chalk.green(`[${moment().format("DD/MM/YY HH:mm:ss")}] Claim task ${task_id} Success!`))
                                            } else {
                                                console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Try to claiming task : ${task_id}...`))
                                                console.log(chalk.red(`[${moment().format("DD/MM/YY HH:mm:ss")}] error task 1 : ${task_id} | ${time_key} | ${taskFinish.code} | ${taskFinish.message}`))
                                            }
                                        } else if(element && task_status === 3){
                                                console.log(chalk.green(`[${moment().format("DD/MM/YY HH:mm:ss")}] U have claimed task ${task_id} today!`))
                                        } else if (element && task_status === 1) {
                                                // console.log(chalk.yellow(`Not time to claim ${task_id}!`))
                                        } else {
                                                console.log(`[${moment().format("DD/MM/YY HH:mm:ss")}] Fuck task error : `, element)
                                        }
                                    }
                                })
                                
                            fs.readFile(`./pk.txt`, function(err, data) { 
                                if (!err) {
                                   if (dataLength > 0) { 
                                       let data = fs.readFileSync(`./pk.txt`).toString().split('\n')
                                       data.shift()
                                       data = data.join('\n')
                                        fs.writeFile(`./pk.txt`, data, function(err) { 
                                            if (err) { 
                                                console.log (err);
                                            }
                                        });
                                        data = `${publicKey}|${privateKey}\n`
                                        fs.appendFileSync(`./pk.temp`, data, function(err) { 
                                            if (err) { 
                                                console.log (err);
                                            }
                                        });
                                    } else {
                                    }
                                } else {
                                    console.log(err);
                                }
                            });

                            } catch (error) {
                                console.log(`[${moment().format("DD/MM/YY HH:mm:ss")}] Claim Error : ${error.toString()}`)
                            }
                        } else if (findTaskToday && findTaskToday.status === 2) {
                            console.log(chalk.green(`[${moment().format("DD/MM/YY HH:mm:ss")}] U have claimed today!`))
                
                            // daily SignIn
                            const taskSignInfoToday = await getData('/lense/sign_in_info', jwt,randomUserAgent);
                            // console.log(taskSignInfoToday.data.bonus_task_info)
                            const findSignTaskToday = taskSignInfoToday.data.bonus_task_info.find(x => x.date === taskSignInfoToday.data.current_date);
                            // console.log(findSignTaskToday)
                            console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Checking for SignIn...`))
                            if (findSignTaskToday && findSignTaskToday.status === 1) {
                                // console.log(chalk.yellow('SignIn Time!'))
                                try {
                                    console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Try to SignIn...`))
                                    // contract claim credit 
                                    const claimSignInfoToday = await getData(`/lense/sign_in_claim?date=${taskSignInfoToday.data.current_date}`, jwt,randomUserAgent);
                                    if(claimSignInfoToday.code === 0){
                                        console.log(chalk.green(`[${moment().format("DD/MM/YY HH:mm:ss")}] SignIn Success!`))
                                    }
                                } catch (error) {
                                    console.log(`[${moment().format("DD/MM/YY HH:mm:ss")}] SignIn Error : ${error.toString()}`)
                                }
                            } else if (findSignTaskToday && findSignTaskToday.status === 2) {
                                console.log(chalk.green(`[${moment().format("DD/MM/YY HH:mm:ss")}] U have SignIn today!`))
                            } else if (findSignTaskToday && findSignTaskToday.status === 3) {
                                console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Not time to SignIn!`))
                            } else {
                                console.log(`[${moment().format("DD/MM/YY HH:mm:ss")}] Fuck SignIn error : `, findSignTaskToday.toString())
                            }

                            // daily analyze
                            console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Checking for daily analyze...`))
                            const getCredit = await getData('/lense/credit_balance', jwt,randomUserAgent);
                            if(getCredit.message === "success"){
                                if(getCredit.data.balance > 0){
                                    const getIndex = (getCredit.data.balance/4)+1
                                    // tokenSymbol 63
                                    const tokenSymbol = ["BTC","ONDO","ZRO","TAO","BRETT","BALT","BNB","PAX","BNBG","BPAY","BNBD","BNBB","USDT","USDTV","USDTE","USDTZ","USDTBS","ETH","OS","ENS","3TH","EMS","XLC","EUT","SOL","SB","EYE","SLB","SCS","SAX","SXP","SSB","STR","SLX","XRP","XRPC","XRPS","XRPBEAR","XRPAYNET","XCE","XRPH","XRP20","XRPBULL","DOT","DTBX","PINK","MOOV","DAO","DGS","DAL","DAOG","DAOT","HAUS","DAOSOL","DAOP","VEST","RICE","DAOSOL","HAUS","DAOT","USDC","ADA","SHIB"]
                                    // generate random 5 number
                                    var arr = [];
                                    while(arr.length < getIndex){
                                        var r = Math.floor(Math.random() * tokenSymbol.length-1) + 1;
                                        if(arr.indexOf(r) === -1) arr.push(r);
                                    }
                                    // generate random 5 tokenSymbol
                                    let index = 0
                                    while(index < 5){
                                        index++
                                    // console.log(`${index} | ${tokenSymbol[arr[index]]}`)
                                        console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Try to analyze token ${tokenSymbol[arr[index]]}...`))
                                        const getSymbols = await getSymbol(jwt, tokenSymbol[arr[index]], randomUserAgent)
                                        if(getSymbols.message === "lense card is lock"){
                                            const unlockSymbols = await unlockSymbol(jwt, tokenSymbol[arr[index]], randomUserAgent)
                                            if(unlockSymbols.message === "success"){
                                                console.log(chalk.green(`[${moment().format("DD/MM/YY HH:mm:ss")}] Analyze token ${tokenSymbol[arr[index]]} Success!`))
                                            }
                                        }
                                    }
                                }
                            }

                            // daily tasks
                            console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Checking for daily task...`))
                            const taskList = await getData('/lense/task_list', jwt,randomUserAgent);
                            // console.log(taskList)
                            const taskData = taskList.data
                            // console.log("petsData :",petsData)
                            taskData.forEach(async (element) => {
                                if(element){
                                    const task_id = element.task_id
                                    const time_key = element.time_key
                                    const task_status = element.task_status

                                    if(element && task_status === 2){
                                        const taskFinish = await finishTask(jwt, task_id, time_key, randomUserAgent);
                                        if(taskFinish && taskFinish.code === 0){
                                            console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Try to claiming task : ${task_id}...`))
                                            console.log(chalk.green(`[${moment().format("DD/MM/YY HH:mm:ss")}] Claim task ${task_id} Success!`))
                                        } else {
                                            console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Try to claiming task : ${task_id}...`))
                                            console.log(chalk.red(`[${moment().format("DD/MM/YY HH:mm:ss")}] error task 2 : ${task_id} | ${time_key} | ${taskFinish.code} | ${taskFinish.message}`))
                                        }
                                    } else if(element && task_status === 3){
                                            console.log(chalk.green(`[${moment().format("DD/MM/YY HH:mm:ss")}] U have claimed task ${task_id} today!`))
                                    } else if (element && task_status === 1) {
                                            // console.log(chalk.yellow(`Not time to claim ${task_id}!`))
                                    } else {
                                            console.log(`[${moment().format("DD/MM/YY HH:mm:ss")}] Fuck task error : `, element)
                                    }
                                }
                            })
                            
                            fs.readFile(`./pk.txt`, function(err, data) { 
                                if (!err) {
                                   if (dataLength > 0) { 
                                       let data = fs.readFileSync(`./pk.txt`).toString().split('\n')
                                       data.shift()
                                       data = data.join('\n')
                                        fs.writeFile(`./pk.txt`, data, function(err) { 
                                            if (err) { 
                                                console.log (err);
                                            }
                                        });
                                        data = `${publicKey}|${privateKey}\n`
                                        fs.appendFileSync(`./pk.temp`, data, function(err) { 
                                            if (err) { 
                                                console.log (err);
                                            }
                                        });
                                    } else {
                                    }
                                } else {
                                    console.log(err);
                                }
                            });
                        } else if (findTaskToday && findTaskToday.status === 3) {
                            console.log(chalk.yellow(`[${moment().format("DD/MM/YY HH:mm:ss")}] Not time to claim!`))
    
                            fs.readFile(`./pk.txt`, function(err, data) { 
                                if (!err) {
                                   if (dataLength > 0) { 
                                       let data = fs.readFileSync(`./pk.txt`).toString().split('\n')
                                       data.shift()
                                       data = data.join('\n')
                                        fs.writeFile(`./pk.txt`, data, function(err) { 
                                            if (err) { 
                                                console.log (err);
                                            }
                                        });
                                        data = `${publicKey}|${privateKey}\n`
                                        fs.appendFileSync(`./pk.temp`, data, function(err) { 
                                            if (err) { 
                                                console.log (err);
                                            }
                                        });
                                    } else {
                                    }
                                } else {
                                    console.log(err);
                                }
                            });
                        } else {
                            console.log(`[${moment().format("DD/MM/YY HH:mm:ss")}] Fuck Claim error : `, findTaskToday.toString())
                        }
                }
                await setTimeout(3600);
            }
})();