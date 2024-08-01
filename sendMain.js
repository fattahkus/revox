import Web3 from 'web3';
import fs from 'fs';
import delay from 'delay';

(async () => {

    const web3 = new Web3('https://opbnb-mainnet-rpc.bnbchain.org'); // Replace with your preferred RPC endpoint

    async function getBalance(address) {
        const balance = await web3.eth.getBalance(address);
        return web3.utils.fromWei(balance, 'ether'); // Convert from Wei to Ether
    }
    
    try{
        const pkData = fs.readFileSync(`./pk.txt`, 'utf-8').split(/\r\n|\n|\r/)
        // console.log('pkData ' + pkData)
        for (let index = 0; index < pkData.length; index++){
            const indexs = index+1
            const tot = pkData.length-index
            if(pkData[index]){
                // console.log(pkData[index])
                const addressKey = pkData[index].split('|')[0];
                const privateKey = pkData[index].split('|')[1];
    
                // main wallet
                const MainPrivateKey = ''; // 0xYOURPRIVATEKEY
                const mainWallet = web3.eth.accounts.privateKeyToAccount(MainPrivateKey);
                // console.log(mainWallet)
    
                // other wallet
                const recipientAddress = addressKey;
                const amountToSend = web3.utils.toWei('0.0000005', 'ether'); // Amount in BNB
                
                // get balance
                const getBalances = await getBalance(addressKey)
                if(await getBalance(mainWallet.address) > 0.0000005){
                    // console.log(await getBalance(mainWallet))
                    if(getBalances < 0.00000025 ){
                        // console.log(getBalances)
                        const transaction = {
                            // from: mainWallet.address,
                            // to: recipientAddress,
                            from: recipientAddress,
                            to: mainWallet.address,
                            value: amountToSend,
                            gas: 21000,
                            gasPrice: await web3.eth.getGasPrice(),
                        };
                
                        await web3.eth.accounts.signTransaction(transaction, MainPrivateKey)
                          .then(signedTx => {
                            return web3.eth.sendSignedTransaction(signedTx.rawTransaction);
                          })
                          .then(receipt => {
                            console.log(`[${indexs}/${tot}] remaining balance ${getBalances} Tx : From ${receipt.from} to ${receipt.to} | ${receipt.transactionHash}`);
                          })
                          .catch(error => {
                            console.error(`[${indexs}/${tot}] Error sending transaction:`, error);
                          });
                    }else{
                        console.error(`[${indexs}/${tot}] Balance is still sufficient : ${recipientAddress} | ${getBalances}...`)
                    }
                }else{
                    console.error(`[${indexs}/${tot}] Main balance is low ${await getBalance(mainWallet.address)}...`)
                }
            }
        }
    }catch(e){
            console.error('Error:', e);
    }
})()