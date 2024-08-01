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
        const pkData = fs.readFileSync(`./main.txt`, 'utf-8').split(/\r\n|\n|\r/)
        // console.log('pkData ' + pkData)
        for (let index = 0; index < pkData.length; index++){
            const indexs = index+1
            const tot = pkData.length-index
            if(pkData[index]){
                // console.log(pkData[index])
                const addressKey = pkData[index].split('|')[0];
                const privateKey = pkData[index].split('|')[1];
    
                // main wallet
                let MainPrivateKey = [""]; // 0xYOURPRIVATEKEY
                    MainPrivateKey = MainPrivateKey[Math.floor(Math.random() * MainPrivateKey.length)].split("|")[1]
                const mainWallet = web3.eth.accounts.privateKeyToAccount(MainPrivateKey);
                // console.log(mainWallet)
    
                // other wallet
                const recipientAddress = addressKey;
                const randvalue = Math.random().toString().substr(2, 6)
                const amountToSend = web3.utils.toWei(`0.00000025${randvalue}`, 'ether'); // Amount in BNB
                
                // get balance
                const getBalances = await getBalance(addressKey)
                if(await getBalance(mainWallet.address) > 0.0000005){
                    // console.log(await getBalance(mainWallet))
                    if(getBalances < 0.00000025 ){
                        // console.log(getBalances)
                        const transaction = {
                            from: mainWallet.address,
                            to: recipientAddress,
                            value: amountToSend,
                            gas: 21000,
                            // gasPrice: await web3.eth.getGasPrice(),
                            baseFeePerGas: web3.utils.toWei('0.000000008', 'gwei'),
                            maxFeePerGas: web3.utils.toWei('0.000100016', 'gwei'),
                            maxPriorityFeePerGas: web3.utils.toWei('0.0001', 'gwei'),
                            // type : 2
                        };
                
                        await web3.eth.accounts.signTransaction(transaction, MainPrivateKey)
                          .then(signedTx => {
                            return web3.eth.sendSignedTransaction(signedTx.rawTransaction);
                          })
                          .then(receipt => {
                            console.log(`[${indexs}/${tot}] Send from ${receipt.from} to ${receipt.to} : ${getBalances.toFixed(2)} | Tx hash : ${receipt.transactionHash}`); 
                          })
                          .catch(error => {
                            console.error(`[${indexs}/${tot}] Error sending transaction:`, error);
                          });
                    }else{
                        console.error(`[${indexs}/${tot}] ${recipientAddress} | ${getBalances} Sufficient Balance`)
                    }
                }else{
                    console.error(`[${indexs}/${tot}] ${mainWallet.address} | ${await getBalance(mainWallet.address)} Main balance is low...`)
                }
            }
        }
    }catch(e){
            console.error('Error:', e);
    }
})()