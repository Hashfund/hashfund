"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDL = void 0;
exports.IDL = {
    "version": "0.1.0",
    "name": "zeroboost",
    "instructions": [
        {
            "name": "initializeConfig",
            "accounts": [
                {
                    "name": "config",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "admin",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "params",
                    "type": {
                        "defined": "InitializeConfigParams"
                    }
                }
            ]
        },
        {
            "name": "mintToken",
            "accounts": [
                {
                    "name": "mint",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "pair",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "boundingCurve",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "boundingCurveAta",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "boundingCurveReserve",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "boundingCurveReserveAta",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "boundingCurveReservePairAta",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "config",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "metadata",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "pythPairUsdFeed",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "metadataFeeReciever",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "creator",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMetadataProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "params",
                    "type": {
                        "defined": "MintTokenParams"
                    }
                }
            ]
        },
        {
            "name": "swap",
            "accounts": [
                {
                    "name": "mint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "pair",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "config",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "boundingCurve",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "boundingCurveReserve",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "boundingCurveReserveAta",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "boundingCurveReservePairAta",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "payerAta",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "payerPairAta",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "params",
                    "type": {
                        "defined": "SwapParams"
                    }
                }
            ]
        },
        {
            "name": "migrateFund",
            "accounts": [
                {
                    "name": "config",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "mint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "pair",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "boundingCurve",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "boundingCurveAta",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "boundingCurveReserve",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "boundingCurveReserveAta",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "boundingCurveReservePairAta",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "boundingCurveReserveLpAta",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "ammConfig",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "ammAuthority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "ammFeeReceiver",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "ammPoolState",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "ammLpMint",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "ammMintVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "ammPairVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "ammObservableState",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "payerPairAta",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "ammProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "params",
                    "type": {
                        "defined": "MigrateFundParams"
                    }
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "boundingCurve",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "pair",
                        "type": "publicKey"
                    },
                    {
                        "name": "mint",
                        "type": "publicKey"
                    },
                    {
                        "name": "migrated",
                        "type": "bool"
                    },
                    {
                        "name": "tradeable",
                        "type": "bool"
                    },
                    {
                        "name": "liquidityPercentage",
                        "type": "u8"
                    },
                    {
                        "name": "initialPrice",
                        "type": "f64"
                    },
                    {
                        "name": "initialSupply",
                        "type": "u64"
                    },
                    {
                        "name": "minimumPairBalance",
                        "type": "u64"
                    },
                    {
                        "name": "maximumPairBalance",
                        "type": "u64"
                    },
                    {
                        "name": "virtualTokenBalance",
                        "type": "u64"
                    },
                    {
                        "name": "virtualPairBalance",
                        "type": "u64"
                    }
                ]
            }
        },
        {
            "name": "config",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "bump",
                        "type": "u8"
                    },
                    {
                        "name": "metadataCreationFee",
                        "type": "u8"
                    },
                    {
                        "name": "migrationPercentageFee",
                        "type": "u8"
                    },
                    {
                        "name": "minimumCurveUsdValuation",
                        "type": "u16"
                    },
                    {
                        "name": "maximumCurveUsdValuation",
                        "type": "u16"
                    },
                    {
                        "name": "estimatedRaydiumCpPoolCreationFee",
                        "type": "u64"
                    }
                ]
            }
        }
    ],
    "types": [
        {
            "name": "InitializeConfigParams",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "metadataCreationFee",
                        "type": "u8"
                    },
                    {
                        "name": "migrationPercentageFee",
                        "type": "u8"
                    },
                    {
                        "name": "minimumCurveUsdValuation",
                        "type": "u16"
                    },
                    {
                        "name": "maximumCurveUsdValuation",
                        "type": "u16"
                    },
                    {
                        "name": "estimatedRaydiumCpPoolFee",
                        "type": "u64"
                    }
                ]
            }
        },
        {
            "name": "MigrateFundParams",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "openTime",
                        "type": {
                            "option": "u64"
                        }
                    }
                ]
            }
        },
        {
            "name": "MintTokenParams",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "name": "symbol",
                        "type": "string"
                    },
                    {
                        "name": "uri",
                        "type": "string"
                    },
                    {
                        "name": "supply",
                        "type": "u64"
                    },
                    {
                        "name": "decimals",
                        "type": "u8"
                    },
                    {
                        "name": "liquidityPercentage",
                        "type": "u8"
                    },
                    {
                        "name": "migrationTarget",
                        "type": {
                            "defined": "MigrationTarget"
                        }
                    }
                ]
            }
        },
        {
            "name": "SwapParams",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "amount",
                        "type": "u64"
                    },
                    {
                        "name": "tradeDirection",
                        "type": "u8"
                    }
                ]
            }
        },
        {
            "name": "MigrationTarget",
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "Raydium"
                    }
                ]
            }
        }
    ],
    "events": [
        {
            "name": "MigrateEvent",
            "fields": [
                {
                    "name": "mint",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "timestamp",
                    "type": "i64",
                    "index": false
                }
            ]
        },
        {
            "name": "MigrateTriggerEvent",
            "fields": [
                {
                    "name": "mint",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "timestamp",
                    "type": "i64",
                    "index": false
                }
            ]
        },
        {
            "name": "MintEvent",
            "fields": [
                {
                    "name": "mint",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "name",
                    "type": "string",
                    "index": false
                },
                {
                    "name": "symbol",
                    "type": "string",
                    "index": false
                },
                {
                    "name": "uri",
                    "type": "string",
                    "index": false
                },
                {
                    "name": "supply",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "decimals",
                    "type": "u8",
                    "index": false
                },
                {
                    "name": "boundingCurve",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "creator",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "timestamp",
                    "type": "i64",
                    "index": false
                }
            ]
        },
        {
            "name": "SwapEvent",
            "fields": [
                {
                    "name": "mint",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "tokenAmount",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "pairAmount",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "virtualTokenBalance",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "virtualPairBalance",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "marketCap",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "tradeDirection",
                    "type": "u8",
                    "index": false
                },
                {
                    "name": "payer",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "timestamp",
                    "type": "i64",
                    "index": false
                }
            ]
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "InvalidTradeDirection",
            "msg": "Invalid trade direction"
        },
        {
            "code": 6001,
            "name": "NotTradeable",
            "msg": "Mint is not tradeable on zeroboost"
        },
        {
            "code": 6002,
            "name": "InvalidAmount",
            "msg": "Amount must be a value greater than zero"
        }
    ]
};
