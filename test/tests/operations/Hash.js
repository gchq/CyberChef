/**
 * Hash tests.
 *
 * @author Matt C [matt@artemisbot.uk]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister.js";

TestRegister.addTests([
    {
        name: "MD2",
        input: "Hello, World!",
        expectedOutput: "1c8f1e6a94aaa7145210bf90bb52871a",
        recipeConfig: [
            {
                "op": "MD2",
                "args": []
            }
        ]
    },
    {
        name: "MD4",
        input: "Hello, World!",
        expectedOutput: "94e3cb0fa9aa7a5ee3db74b79e915989",
        recipeConfig: [
            {
                "op": "MD4",
                "args": []
            }
        ]
    },
    {
        name: "MD5",
        input: "Hello, World!",
        expectedOutput: "65a8e27d8879283831b664bd8b7f0ad4",
        recipeConfig: [
            {
                "op": "MD5",
                "args": []
            }
        ]
    },
    {
        name: "MD6",
        input: "Hello, World!",
        expectedOutput: "ce5effce32637e6b8edaacc9284b873c3fd4e66f9779a79df67eb4a82dda8230",
        recipeConfig: [
            {
                "op": "MD6",
                "args": [256, 64, ""]
            }
        ]
    },
    {
        name: "SHA0",
        input: "Hello, World!",
        expectedOutput: "5a5588f0407c6ae9a988758e76965f841b299229",
        recipeConfig: [
            {
                "op": "SHA0",
                "args": []
            }
        ]
    },
    {
        name: "SHA1",
        input: "Hello, World!",
        expectedOutput: "0a0a9f2a6772942557ab5355d76af442f8f65e01",
        recipeConfig: [
            {
                "op": "SHA1",
                "args": []
            }
        ]
    },
    {
        name: "SHA2 224",
        input: "Hello, World!",
        expectedOutput: "72a23dfa411ba6fde01dbfabf3b00a709c93ebf273dc29e2d8b261ff",
        recipeConfig: [
            {
                "op": "SHA2",
                "args": ["224"]
            }
        ]
    },
    {
        name: "SHA2 384",
        input: "Hello, World!",
        expectedOutput: "5485cc9b3365b4305dfb4e8337e0a598a574f8242bf17289e0dd6c20a3cd44a089de16ab4ab308f63e44b1170eb5f515",
        recipeConfig: [
            {
                "op": "SHA2",
                "args": ["384"]
            }
        ]
    },
    {
        name: "SHA2 256",
        input: "Hello, World!",
        expectedOutput: "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f",
        recipeConfig: [
            {
                "op": "SHA2",
                "args": ["256"]
            }
        ]
    },
    {
        name: "SHA2 512",
        input: "Hello, World!",
        expectedOutput: "374d794a95cdcfd8b35993185fef9ba368f160d8daf432d08ba9f1ed1e5abe6cc69291e0fa2fe0006a52570ef18c19def4e617c33ce52ef0a6e5fbe318cb0387",
        recipeConfig: [
            {
                "op": "SHA2",
                "args": ["512"]
            }
        ]
    },
    {
        name: "SHA2 512/224",
        input: "Hello, World!",
        expectedOutput: "766745f058e8a0438f19de48ae56ea5f123fe738af39bca050a7547a",
        recipeConfig: [
            {
                "op": "SHA2",
                "args": ["512/224"]
            }
        ]
    },
    {
        name: "SHA2 512/256",
        input: "Hello, World!",
        expectedOutput: "0686f0a605973dc1bf035d1e2b9bad1985a0bff712ddd88abd8d2593e5f99030",
        recipeConfig: [
            {
                "op": "SHA2",
                "args": ["512/256"]
            }
        ]
    },
    {
        name: "SHA3 224",
        input: "Hello, World!",
        expectedOutput: "853048fb8b11462b6100385633c0cc8dcdc6e2b8e376c28102bc84f2",
        recipeConfig: [
            {
                "op": "SHA3",
                "args": ["224"]
            }
        ]
    },
    {
        name: "SHA3 384",
        input: "Hello, World!",
        expectedOutput: "aa9ad8a49f31d2ddcabbb7010a1566417cff803fef50eba239558826f872e468c5743e7f026b0a8e5b2d7a1cc465cdbe",
        recipeConfig: [
            {
                "op": "SHA3",
                "args": ["384"]
            }
        ]
    },
    {
        name: "SHA3 256",
        input: "Hello, World!",
        expectedOutput: "1af17a664e3fa8e419b8ba05c2a173169df76162a5a286e0c405b460d478f7ef",
        recipeConfig: [
            {
                "op": "SHA3",
                "args": ["256"]
            }
        ]
    },
    {
        name: "SHA3 512",
        input: "Hello, World!",
        expectedOutput: "38e05c33d7b067127f217d8c856e554fcff09c9320b8a5979ce2ff5d95dd27ba35d1fba50c562dfd1d6cc48bc9c5baa4390894418cc942d968f97bcb659419ed",
        recipeConfig: [
            {
                "op": "SHA3",
                "args": ["512"]
            }
        ]
    },
    {
        name: "Keccak 224",
        input: "Hello, World!",
        expectedOutput: "4eaaf0e7a1e400efba71130722e1cb4d59b32afb400e654afec4f8ce",
        recipeConfig: [
            {
                "op": "Keccak",
                "args": ["224"]
            }
        ]
    },
    {
        name: "Keccak 384",
        input: "Hello, World!",
        expectedOutput: "4d60892fde7f967bcabdc47c73122ae6311fa1f9be90d721da32030f7467a2e3db3f9ccb3c746483f9d2b876e39def17",
        recipeConfig: [
            {
                "op": "Keccak",
                "args": ["384"]
            }
        ]
    },
    {
        name: "Keccak 256",
        input: "Hello, World!",
        expectedOutput: "acaf3289d7b601cbd114fb36c4d29c85bbfd5e133f14cb355c3fd8d99367964f",
        recipeConfig: [
            {
                "op": "Keccak",
                "args": ["256"]
            }
        ]
    },
    {
        name: "Keccak 512",
        input: "Hello, World!",
        expectedOutput: "eda765576c84c600ed7f5d97510e92703b61f5215def2a161037fd9dd1f5b6ed4f86ce46073c0e3f34b52de0289e9c618798fff9dd4b1bfe035bdb8645fc6e37",
        recipeConfig: [
            {
                "op": "Keccak",
                "args": ["512"]
            }
        ]
    },
    {
        name: "Shake 128",
        input: "Hello, World!",
        expectedOutput: "2bf5e6dee6079fad604f573194ba8426bd4d30eb13e8ba2edae70e529b570cbd",
        recipeConfig: [
            {
                "op": "Shake",
                "args": ["128", 256]
            }
        ]
    },
    {
        name: "Shake 256",
        input: "Hello, World!",
        expectedOutput: "b3be97bfd978833a65588ceae8a34cf59e95585af62063e6b89d0789f372424e8b0d1be4f21b40ce5a83a438473271e0661854f02d431db74e6904d6c347d757",
        recipeConfig: [
            {
                "op": "Shake",
                "args": ["256", 512]
            }
        ]
    },
    {
        name: "RIPEMD 128",
        input: "Hello, World!",
        expectedOutput: "67f9fe75ca2886dc76ad00f7276bdeba",
        recipeConfig: [
            {
                "op": "RIPEMD",
                "args": ["128"]
            }
        ]
    },
    {
        name: "RIPEMD 160",
        input: "Hello, World!",
        expectedOutput: "527a6a4b9a6da75607546842e0e00105350b1aaf",
        recipeConfig: [
            {
                "op": "RIPEMD",
                "args": ["160"]
            }
        ]
    },
    {
        name: "RIPEMD 256",
        input: "Hello, World!",
        expectedOutput: "567750c6d34dcba7ae038a80016f3ca3260ec25bfdb0b68bbb8e730b00b2447d",
        recipeConfig: [
            {
                "op": "RIPEMD",
                "args": ["256"]
            }
        ]
    },
    {
        name: "RIPEMD 320",
        input: "Hello, World!",
        expectedOutput: "f9832e5bb00576fc56c2221f404eb77addeafe49843c773f0df3fc5a996d5934f3c96e94aeb80e89",
        recipeConfig: [
            {
                "op": "RIPEMD",
                "args": ["320"]
            }
        ]
    },
    {
        name: "HAS-160",
        input: "Hello, World!",
        expectedOutput: "8f6dd8d7c8a04b1cb3831adc358b1e4ac2ed5984",
        recipeConfig: [
            {
                "op": "HAS-160",
                "args": []
            }
        ]
    },
    {
        name: "Whirlpool-0",
        input: "Hello, World!",
        expectedOutput: "1c327026f565a0105a827efbfb3d3635cdb042c0aabb8416e96deb128e6c5c8684b13541cf31c26c1488949df050311c6999a12eb0e7002ad716350f5c7700ca",
        recipeConfig: [
            {
                "op": "Whirlpool",
                "args": ["Whirlpool-0"]
            }
        ]
    },
    {
        name: "Whirlpool-T",
        input: "Hello, World!",
        expectedOutput: "16c581089b6a6f356ae56e16a63a4c613eecd82a2a894b293f5ee45c37a31d09d7a8b60bfa7e414bd4a7166662cea882b5cf8c96b7d583fc610ad202591bcdb1",
        recipeConfig: [
            {
                "op": "Whirlpool",
                "args": ["Whirlpool-T"]
            }
        ]
    },
    {
        name: "Whirlpool",
        input: "Hello, World!",
        expectedOutput: "3d837c9ef7bb291bd1dcfc05d3004af2eeb8c631dd6a6c4ba35159b8889de4b1ec44076ce7a8f7bfa497e4d9dcb7c29337173f78d06791f3c3d9e00cc6017f0b",
        recipeConfig: [
            {
                "op": "Whirlpool",
                "args": ["Whirlpool"]
            }
        ]
    },
    {
        name: "HMAC SHA256",
        input: "Hello, World!",
        expectedOutput: "52589bd80ccfa4acbb3f9512dfaf4f700fa5195008aae0b77a9e47dcca75beac",
        recipeConfig: [
            {
                "op": "HMAC",
                "args": ["test", "SHA256"]
            }
        ]
    },
]);
