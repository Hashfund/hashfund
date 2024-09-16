const { LOCALHOST, tmpLedgerDir } = require("@metaplex-foundation/amman");

module.exports = {
  validator: {
    killRunningValidators: true,
    programs: [],
    jsonRpcUrl: LOCALHOST,
    websocketUrl: "",
    commitment: "confirmed",
    ledgerDir: tmpLedgerDir(),
    resetLedger: true,
    verifyFees: false,
    accountsCluster: "https://api.devnet.solana.com",
    accounts: [
      {
        label: "Spl ATA Program",
        accountId: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
        executable: true,
      },
      {
        label: "SPL Token Program",
        accountId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        executable: true,
      },
      // {
      //   label: "Token Metadata Program",
      //   accountId: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
      //   executable: true,
      // },
      {
        label: "Serum Program",
        accountId: "EoTcMgcDRTJVZDMZWBoU6rhYHZfkNTVEAfz3uUJRcYGj",
        executable: true,
      },
      {
        label: "Raydium Program",
        accountId: "HWy1jotHpo6UqeQxx49dpYYdQB8wj9Qk9MdxwjLvDHB8",
        executable: true,
      },
      {
        label: "SolUSDFeed",
        accountId: "J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix",
      },
      {
        label: "Raydium Pool Fee",
        accountId: "3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR",
      },
    ],
  },
  relay: {
    enabled: process.env.CI == null,
    killRunningRelay: true,
  },
  storage: {
    enabled: process.env.CI == null,
    storageId: "mock-storage",
    clearOnStart: true,
  },
};
