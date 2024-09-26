/**
 * Segwit extract tests.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Extract Segwit Artifacts - Basic",
        input: "bc1qglsjlj8m2yzxvlwvhclz0kdpy96q2vtn5cmre6\n" + "bc1qglsjlj8m2yzxvlwvhclz0kdpy96q2vtn5cmre7\n" +
        "ltc1qnral26ktht5e5yr7fkzcpzwm7vta4ykjm4ksp0\n" + "ltc1qnral26ktht5e5yr7fkzcpzwm7vta4ykjm4ksp1\n" +
        "tb1qp09q604zgltxrqsu5s24qnyv6ycm3g6lzw45ta\n" + "tb1qp09q604zgltxrqsu5s24qnyv6ycm3g6lzw45ts\n" +
        "bc1pr28rdctaptapvyumjqxushmht57qccj2y7r0hszm5ldc0ua9tlxsch4nge\nbc1pr28rdctaptapvyumjqxushmht57qccj2y7r0hszm5ldc0ua9tlxsch4ngf\n",
        expectedOutput: "bc1qglsjlj8m2yzxvlwvhclz0kdpy96q2vtn5cmre6\n" + "ltc1qnral26ktht5e5yr7fkzcpzwm7vta4ykjm4ksp0\n" +
        "tb1qp09q604zgltxrqsu5s24qnyv6ycm3g6lzw45ta\nbc1pr28rdctaptapvyumjqxushmht57qccj2y7r0hszm5ldc0ua9tlxsch4nge\n",
        recipeConfig: [
            {
                "op": "Extract Segwit Addresses",
                "args": []
            },
        ],
    },
]);
