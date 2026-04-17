const anchor = require("@coral-xyz/anchor");
const fs = require("fs");
const os = require("os");

async function run() {
    console.log("Starting configuration upgrade...");
    
    // 1. Setup connection and wallet
    const connection = new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed");
    const keyPath = os.homedir() + "/.config/solana/id.json";
    
    if (!fs.existsSync(keyPath)) {
        throw new Error(`Keypair not found at ${keyPath}. Please ensure your admin key is at this path.`);
    }

    const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(keyPath, "utf8")));
    const wallet = new anchor.Wallet(anchor.web3.Keypair.fromSecretKey(secretKey));
    const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "confirmed" });

    // 2. Load Program & IDL
    const idlPath = "./src/idl/zeroboost.json";
    if (!fs.existsSync(idlPath)) {
        throw new Error(`IDL not found at ${idlPath}. Make sure you are in packages/zeroboost.`);
    }
    const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
    const programId = new anchor.web3.PublicKey("G9hckfQ5yPjyqF9jTfPm2t3tBTxefgqrFrPPJsF8UJY6");
    const program = new anchor.Program(idl, programId, provider);

    // 3. Find PDA
    const [config] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("zeroboost")], 
        programId
    );

    console.log("Admin Wallet:", wallet.publicKey.toBase58());
    console.log("Config PDA:", config.toBase58());

    // 4. Send Transaction (this will trigger the realloc)
    console.log("Sending transaction...");
    const tx = await program.methods.initializeConfig({
        metadataCreationFee: 1,
        migrationPercentageFee: 1,
        minimumCurveUsdValuation: 10,
        maximumCurveUsdValuation: 100,
        estimatedRaydiumCpPoolFee: new anchor.BN(100000000)
    }).accounts({
        config,
        admin: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();

    console.log("Successfully upgraded Config account!");
    console.log("Transaction signature:", tx);
}

run().catch((err) => {
    console.error("Initialization failed:");
    console.error(err);
});
