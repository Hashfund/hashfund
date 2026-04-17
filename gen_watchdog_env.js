const bs58 = require("bs58");
const fs = require("fs");

const key = [168,213,183,139,91,93,7,191,216,107,5,254,166,72,148,220,30,179,197,131,201,51,165,144,42,5,100,206,85,93,243,212,225,25,224,33,89,8,40,238,111,17,23,137,203,198,31,254,245,8,141,166,107,157,86,118,105,129,136,116,221,10,115,215];
const encoder = (bs58.default && bs58.default.encode) ? bs58.default.encode : bs58.encode;
const base58Key = encoder(Uint8Array.from(key));

const envContent = `ANCHOR_PROVIDER_URL=https://devnet.helius-rpc.com/?api-key=6938ff69-b34f-4cc7-8023-c4025bb5faba\nANCHOR_WALLET=${base58Key}\nWALLET_PRIVATE_KEY=${JSON.stringify(key)}\n`;
fs.writeFileSync("./servers/watchdog/.env", envContent);
console.log("Successfully created .env file for watchdog");
