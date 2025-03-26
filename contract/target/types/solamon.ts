/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solamon.json`.
 */
export type Solamon = {
  "address": "BcH8K2v6nUU72y3CctTH2zR7W2ZFpA94qqWZQerdAEnd",
  "metadata": {
    "name": "solamon",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "cancelBattle",
      "discriminator": [
        234,
        61,
        97,
        187,
        97,
        170,
        101,
        141
      ],
      "accounts": [
        {
          "name": "player",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "battleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "battle_account.battle_id",
                "account": "battleAccount"
              }
            ]
          }
        },
        {
          "name": "userAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "player"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "feeAccount",
          "type": "pubkey"
        },
        {
          "name": "admin",
          "type": "pubkey"
        },
        {
          "name": "feePercentageInBasisPoints",
          "type": "u16"
        }
      ]
    },
    {
      "name": "joinBattle",
      "discriminator": [
        126,
        0,
        69,
        130,
        127,
        145,
        54,
        100
      ],
      "accounts": [
        {
          "name": "player",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "battleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "battle_account.battle_id",
                "account": "battleAccount"
              }
            ]
          }
        },
        {
          "name": "userAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "player"
              }
            ]
          }
        },
        {
          "name": "opponentUserAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "battle_account.player_1",
                "account": "battleAccount"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "solamonIds",
          "type": {
            "vec": "u16"
          }
        }
      ]
    },
    {
      "name": "openBattle",
      "discriminator": [
        191,
        110,
        251,
        191,
        76,
        22,
        225,
        67
      ],
      "accounts": [
        {
          "name": "player",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "userAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "player"
              }
            ]
          }
        },
        {
          "name": "battleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "config_account.battle_count",
                "account": "configAccount"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "solamonIds",
          "type": {
            "vec": "u16"
          }
        }
      ]
    },
    {
      "name": "spawnSolamons",
      "discriminator": [
        130,
        43,
        240,
        49,
        221,
        150,
        192,
        83
      ],
      "accounts": [
        {
          "name": "player",
          "writable": true,
          "signer": true
        },
        {
          "name": "userAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "player"
              }
            ]
          }
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "feeAccount",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "count",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "battleAccount",
      "discriminator": [
        151,
        107,
        3,
        106,
        43,
        65,
        131,
        90
      ]
    },
    {
      "name": "configAccount",
      "discriminator": [
        189,
        255,
        97,
        70,
        186,
        189,
        24,
        102
      ]
    },
    {
      "name": "userAccount",
      "discriminator": [
        211,
        33,
        136,
        16,
        186,
        110,
        242,
        127
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "maxElementsReached",
      "msg": "Max elements reached"
    },
    {
      "code": 6001,
      "name": "invalidSolamonIds",
      "msg": "Invalid solamon ids"
    },
    {
      "code": 6002,
      "name": "invalidBattleParticipants",
      "msg": "Invalid battle participants"
    },
    {
      "code": 6003,
      "name": "battleNotAvailable",
      "msg": "Battle not available"
    },
    {
      "code": 6004,
      "name": "solamonNotAvailable",
      "msg": "Solamon not available"
    },
    {
      "code": 6005,
      "name": "invalidBattleParticipant",
      "msg": "Invalid battle participant"
    }
  ],
  "types": [
    {
      "name": "battleAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "battleId",
            "type": "u64"
          },
          {
            "name": "player1",
            "type": "pubkey"
          },
          {
            "name": "player2",
            "type": "pubkey"
          },
          {
            "name": "player1Solamons",
            "type": {
              "vec": {
                "defined": {
                  "name": "solamon"
                }
              }
            }
          },
          {
            "name": "player2Solamons",
            "type": {
              "vec": {
                "defined": {
                  "name": "solamon"
                }
              }
            }
          },
          {
            "name": "battleStatus",
            "type": {
              "defined": {
                "name": "battleStatus"
              }
            }
          },
          {
            "name": "fightMoney",
            "type": "u64"
          },
          {
            "name": "claimTimestamp",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "battleStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "canceled"
          },
          {
            "name": "player1Wins"
          },
          {
            "name": "player2Wins"
          }
        ]
      }
    },
    {
      "name": "configAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "feeAccount",
            "type": "pubkey"
          },
          {
            "name": "battleCount",
            "type": "u64"
          },
          {
            "name": "solamonCount",
            "type": "u16"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "feePercentageInBasisPoints",
            "type": "u16"
          },
          {
            "name": "availableBattleIds",
            "type": {
              "vec": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "element",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "fire"
          },
          {
            "name": "wood"
          },
          {
            "name": "earth"
          },
          {
            "name": "water"
          },
          {
            "name": "metal"
          }
        ]
      }
    },
    {
      "name": "solamon",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u16"
          },
          {
            "name": "species",
            "type": "u8"
          },
          {
            "name": "element",
            "type": {
              "defined": {
                "name": "element"
              }
            }
          },
          {
            "name": "attack",
            "type": "u8"
          },
          {
            "name": "health",
            "type": "u8"
          },
          {
            "name": "isAvailable",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "userAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "solamons",
            "type": {
              "vec": {
                "defined": {
                  "name": "solamon"
                }
              }
            }
          },
          {
            "name": "battleCount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
