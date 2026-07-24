/**
 * Seedphrase to seed tests.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Seedphrase to Seed - BIP39 - 12",
        input: "regret snack luxury tornado orient end bind video caution syrup minimum tree",
        expectedOutput: "f2c6a948086e43745837e3aafb5fad31086da2bc83d76da4d029a38037f4e032eb75e30560921e75fafb791c53888d0eed7006ce29a9552d9888c9e7be58b461",
        recipeConfig: [
            {
                "op": "Seedphrase To Seed",
                "args": ["bip39", { "option": "UTF8", "string": "" }]
            }
        ],
    },
    {
        name: "Seedphrase to Seed - BIP39 - 12 - Passphrase",
        input: "regret snack luxury tornado orient end bind video caution syrup minimum tree",
        expectedOutput: "60fa03fa8de256a794c04828051578b76ac7c3e130a034b27f47017eae8d52a37fe2a0f8e71e364ec81af9109ea100b4a16fef730628c9be4c4cc8d7360599a4",
        recipeConfig: [
            {
                "op": "Seedphrase To Seed",
                "args": ["bip39", { "option": "UTF8", "string": "password1234" }]
            }
        ],
    },
    {
        name: "Seedphrase to Seed - Electrum - 12",
        input: "hover engine either unknown hospital pole idea settle advice parent bundle solid",
        expectedOutput: "0e66066dcd50ce43cd64dd42adae6f6fe2d121622677255cadcbf9695c73eb5a1dc44e763793f858c3421089c0e623c55309262527665f1bbb0d26bac080108b",
        recipeConfig: [
            {
                "op": "Seedphrase To Seed",
                "args": ["electrum2", { "option": "UTF8", "string": "" }]
            }
        ],
    },
    {
        name: "Seedphrase to Seed - Electrum - 12 - Passphrase",
        input: "hover engine either unknown hospital pole idea settle advice parent bundle solid",
        expectedOutput: "90a4fff5335f9023dc75c7872c1207e90cadc7b4d8dc3b7c217d4d3be9428a7987154ab21c5c9a4abe6d038fbf68bb0400eaa461f41b9838f346bb79b8852f98",
        recipeConfig: [
            {
                "op": "Seedphrase To Seed",
                "args": ["electrum2", { "option": "UTF8", "string": "password1234" }]
            }
        ],
    }
]);
