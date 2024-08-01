export const config = {
    contractAddress: '0x7403cbc2586a3f9532fdfcaaf085e3fe69297f02',
    abi: [{
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !1,
            internalType: "address",
            name: "previousAdmin",
            type: "address"
        }, {
            indexed: !1,
            internalType: "address",
            name: "newAdmin",
            type: "address"
        }],
        name: "AdminChanged",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "address",
            name: "beacon",
            type: "address"
        }],
        name: "BeaconUpgraded",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "address",
            name: "user",
            type: "address"
        }],
        name: "ClaimCredit",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "address",
            name: "user",
            type: "address"
        }, {
            indexed: !0,
            internalType: "uint256",
            name: "tier",
            type: "uint256"
        }, {
            indexed: !0,
            internalType: "uint256",
            name: "amount",
            type: "uint256"
        }],
        name: "Deposit",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !1,
            internalType: "uint8",
            name: "version",
            type: "uint8"
        }],
        name: "Initialized",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "address",
            name: "previousOwner",
            type: "address"
        }, {
            indexed: !0,
            internalType: "address",
            name: "newOwner",
            type: "address"
        }],
        name: "OwnershipTransferred",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "address",
            name: "user",
            type: "address"
        }],
        name: "PayForOnce",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "address",
            name: "implementation",
            type: "address"
        }],
        name: "Upgraded",
        type: "event"
    }, {
        inputs: [],
        name: "claimCredit",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "uint256",
            name: "tier",
            type: "uint256"
        }],
        name: "deposit",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "uint256",
            name: "",
            type: "uint256"
        }],
        name: "depositMap",
        outputs: [{
            internalType: "uint256",
            name: "",
            type: "uint256"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "feePrice",
        outputs: [{
            internalType: "uint256",
            name: "",
            type: "uint256"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "initialize",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [],
        name: "owner",
        outputs: [{
            internalType: "address",
            name: "",
            type: "address"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "payForOnce",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [],
        name: "proxiableUUID",
        outputs: [{
            internalType: "bytes32",
            name: "",
            type: "bytes32"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "uint256",
            name: "tier",
            type: "uint256"
        }, {
            internalType: "uint256",
            name: "price",
            type: "uint256"
        }],
        name: "setDepositMap",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "uint256",
            name: "_feePrice",
            type: "uint256"
        }],
        name: "setFeePrice",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "_token",
            type: "address"
        }],
        name: "setToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [],
        name: "token",
        outputs: [{
            internalType: "address",
            name: "",
            type: "address"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "newOwner",
            type: "address"
        }],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "newImplementation",
            type: "address"
        }],
        name: "upgradeTo",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "newImplementation",
            type: "address"
        }, {
            internalType: "bytes",
            name: "data",
            type: "bytes"
        }],
        name: "upgradeToAndCall",
        outputs: [],
        stateMutability: "payable",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "beneficiary",
            type: "address"
        }],
        name: "withdrawTokens",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }]
}