
const { web3, Program, AnchorProvider, BN } = require('@coral-xyz/anchor');
const idl = require('c:\\Users\\rolan\\projects\\hashfund\\packages\\zeroboost\\src\\idl\\zeroboost.json');

async function checkConfig() {
    const connection = new web3.Connection('https://api.devnet.solana.com', 'confirmed');
    const programId = new web3.PublicKey('G9hckfQ5yPjyqF9jTfPm2t3tBTxefgqrFrPPJsF8UJY6');
    
    // Create a dummy wallet
    const wallet = {
        publicKey: web3.Keypair.generate().publicKey,
        signTransaction: async (tx) => tx,
        signAllTransactions: async (txs) => txs,
    };
    
    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    const program = new Program(idl, programId, provider);
    
    const [configPda] = web3.PublicKey.findProgramAddressSync([Buffer.from("zeroboost")], programId);
    
    console.log('Checking config at:', configPda.toBase58());
    
    try {
        const account = await program.account.config.fetch(configPda);
        console.log('CONFIG_FOUND:', JSON.stringify(account));
    } catch (e) {
        console.log('CONFIG_NOT_FOUND');
    }
}

checkConfig();
