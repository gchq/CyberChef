/**
 * JA3SFingerprint tests.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "JA3S Fingerprint: TLS 1.0",
        input: "160301003d020000390301543dd2ddedbfe33895bd6bc676a3fa6b9fe5773a6e04d5476d1af3bcbc1dcbbb00c011000011ff01000100000b00040300010200230000",
        expectedOutput: "bed95e1b525d2f41db3a6d68fac5b566",
        recipeConfig: [
            {
                "op": "JA3S Fingerprint",
                "args": ["Hex", "Hash digest"]
            }
        ],
    },
    {
        name: "JA3S Fingerprint: TLS 1.1",
        input: "160302003d020000390302543dd2ed88131999a0120d36c14a4139671d75aae3d7d7779081d3cf7dd7725a00c013000011ff01000100000b00040300010200230000",
        expectedOutput: "130fac2dc19b142500acb0abc63b6379",
        recipeConfig: [
            {
                "op": "JA3S Fingerprint",
                "args": ["Hex", "Hash digest"]
            }
        ],
    },
    {
        name: "JA3S Fingerprint: TLS 1.2",
        input: "160303003d020000390303543dd328b38b445686739d58fab733fa23838f575e0e5ad9a1b9baace6cc3b4100c02f000011ff01000100000b00040300010200230000",
        expectedOutput: "ccc514751b175866924439bdbb5bba34",
        recipeConfig: [
            {
                "op": "JA3S Fingerprint",
                "args": ["Hex", "Hash digest"]
            }
        ],
    },
    // This Server Hello was based on draft 18 of the TLS1.3 spec which does not include a Session ID field, leading it to fail.
    // The published version of TLS1.3 does require a legacy Session ID field (even if it is empty).
    // {
    //     name: "JA3S Fingerprint: TLS 1.3",
    //     input: "16030100520200004e7f123ef1609fd3f4fa8668aac5822d500fb0639b22671d0fb7258597355795511bf61301002800280024001d0020ae0e282a3b7a463e71064ecbaf671586e979b0edbebf7a4735c31678c70f660c",
    //     expectedOutput: "986ae432c402479fe7a0c6fbe02164c1",
    //     recipeConfig: [
    //         {
    //             "op": "JA3S Fingerprint",
    //             "args": ["Hex", "Hash digest"]
    //         }
    //     ],
    // },
]);
