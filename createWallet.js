import Web3 from 'web3';
import fs from 'fs';
import readlineSync from 'readline-sync';

(async () => {

    const web3 = new Web3('https://devnet.sonic.game/'); // Replace with your preferred RPC endpoint
    const path = './pk.txt'
    const syncPath = fs.openSync(path)

    
    if (fs.existsSync(path)) {} else {
        fs.appendFileSync(path, '\r\n');
    }

    var howMuch = readlineSync.question('How many wallet accounts do you want to create? ');

    try{
        for (let index = 0; index < howMuch; index++){
            const indexs = index+1
            const tot = howMuch-index
            const newAccount = web3.eth.accounts.create();
            fs.appendFileSync(path,`${newAccount.address}|${newAccount.privateKey}\r\n`, 'utf-8');
            console.log(`Created [${indexs}/${tot}] ${newAccount.address}|${newAccount.privateKey}`);
        }
    }catch(e){
            console.error('Error:', e);
    }
})()