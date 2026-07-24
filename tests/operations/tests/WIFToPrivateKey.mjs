/**
 * Wallet Import Format to Private key tests.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "WIF to Private Key - Compressed",
        input: "L3uC2epVmApXLbnCFSiS3hK4UkVLMnyrCGpPRzbxvRB3tKWRJPUF",
        expectedOutput: "c7559d1ffd85dc07e8e86413f99fdb42201257f97765c2dee8a632451b680a78",
        recipeConfig: [
            {
                "op": "From WIF Format",
                "args": []
            },
        ],
    },
    {
        name: "WIF to Private Key - Uncompressed 2",
        input: "5Jqv2HL2tEHEeg5hGdSTKkVaAdFtXfi1jKXkJLVAr6rU3DdASSy",
        expectedOutput: "8764b291f07ca7dd0cf939c65a4127f95d16b9412e90829d2b2a5085ad5ffb5b",
        recipeConfig: [
            {
                "op": "From WIF Format",
                "args": []
            },
        ],
    },
    {
        name: "WIF to Private Key - Unompressed",
        input: "5KL5K3gJqybnPZoVNrKuM6WU52F8755GgFusrARgriGsVrkJ9Hm",
        expectedOutput: "c7559d1ffd85dc07e8e86413f99fdb42201257f97765c2dee8a632451b680a78",
        recipeConfig: [
            {
                "op": "From WIF Format",
                "args": []
            },
        ],
    }
]);
