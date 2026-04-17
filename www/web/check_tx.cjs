const { Connection } = require('@solana/web3.js');
async function main() {
  const connection = new Connection('https://api.devnet.solana.com');
  const tx = await connection.getTransaction(
    '4zwVcRv4xBYvLXCLQDq3DMXZ7N2k8FRmGmPgxtom7VRagxJqPHQbRYV1hiDtSEi3YTAvHTJm5JNuqb9mfeArumbR',
    { maxSupportedTransactionVersion: 0 }
  );
  console.log(JSON.stringify(tx.meta.postTokenBalances, null, 2));
}
main();
