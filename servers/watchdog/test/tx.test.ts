import { devnet, IDL } from "@hashfund/zeroboost";
import { web3, Program } from "@coral-xyz/anchor";
import { buildEventListeners } from "../src";

const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
const program = new Program(IDL, devnet.ZERO_BOOST_PROGRAM, { connection });

const onLog = buildEventListeners(program);

const main = async (signature: string) => {
  const transaction = await connection.getTransaction(signature);
  if (transaction) {
    const logs = transaction.meta?.logMessages;
    if (logs) await onLog({ logs, err: null, signature });
  }
};

main(
  "65qD4d4fpVgAyLL2yL6rWzEQJFgiaKgGwuguZxiRUmitGAarnaNX21GkK6JctK5s13DVv3hhJmb65BJEuu5YdAy5"
).catch(console.error);
