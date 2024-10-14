"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zeroboost_1 = require("@hashfund/zeroboost");
const anchor_1 = require("@coral-xyz/anchor");
const _1 = require(".");
const config_1 = require("./config");
const provider = new anchor_1.AnchorProvider(new anchor_1.web3.Connection(config_1.ANCHOR_PROVIDER_URL), new anchor_1.Wallet(config_1.ANCHOR_WALLET), {
    commitment: "confirmed",
});
const program = new anchor_1.Program(zeroboost_1.IDL, zeroboost_1.devnet.ZERO_BOOST_PROGRAM, provider);
const main = async (program) => {
    const onLogs = (0, _1.buildEventListeners)(program);
    program.provider.connection.onLogs(program.programId, (logs) => {
        console.log("[pending] signature=", logs.signature);
        onLogs(logs)
            .then(() => console.log("[success] signature=", logs.signature))
            .catch((error) => {
            console.log("[error] signature=", logs.signature);
            error.log();
        });
    }, "finalized");
};
main(program)
    .then(() => console.log("Running worker in background..."))
    .catch(console.error);
