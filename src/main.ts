import {configDotenv} from 'dotenv'
import * as WEB3 from '@solana/web3.js'

configDotenv({
    path: '.env'
})

const RPC_URL:string = process.env.RPC_URL || "";
const TOKEN_ID = new WEB3.PublicKey(process.env.TOKEN_ID || "");
const TOKEN_2022_PROGRAM_ID = new WEB3.PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb")
const WALLET_ADDRESS = process.env.WALLET_ADDRESS || "";

async function main() {
    const client = new WEB3.Connection(RPC_URL);
    console.log(TOKEN_ID);
    

    const options = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        jsonrpc: '2.0',
        id: '1',
        method: 'getProgramAccountsV2',
        params: [
            TOKEN_2022_PROGRAM_ID.toBase58(),
            {
                encoding: 'jsonParsed', 
                filters: [
                    {
                        memcmp: {
                            offset: 0,
                            bytes: TOKEN_ID.toBase58(),
                        }
                    }
                ],
                limit: 10000,
            }
        ]
    })
    };
    console.log(options);
    
    const res = await(await fetch(RPC_URL, options)).json();

    let nonZeroAddresses: any[] = [];

    // console.log(res);
    res.result.accounts.forEach((e:any) => {

        const amount = e.account.data.parsed.info.tokenAmount.amount;
        if(amount != 0) {
            nonZeroAddresses.push(e);
        }
    })

    const noOfHolders = nonZeroAddresses.length;

    let parsedAddresses:any[] = [];

    nonZeroAddresses.forEach((add:any) => {
        const {info} = add.account.data.parsed;
        try {
            parsedAddresses.push({
                owner: info.owner,
                balance: info.tokenAmount.uiAmount
            })
        }
        catch (e) {
            console.log({e, info});
            
        }
    });

    // sort
    parsedAddresses.sort((a, b) => b.balance - a.balance)
    
    let rank = 0;
    let user_acc;

    for (let i = 0; i < parsedAddresses.length; i++) {
        if(parsedAddresses[i].owner == WALLET_ADDRESS) {
            user_acc = parsedAddresses[i];
            rank = i+1;
        }
    }

    console.log({
        rank,user_acc
    });
    
}

main();