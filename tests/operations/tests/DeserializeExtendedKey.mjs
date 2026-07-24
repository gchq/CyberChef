/**
 * Deserialize Key tests.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Deserialize Extended Key",
        input: "xprv9s21ZrQH143K2cGpWQPQuyZYEMwror2UbE2oWX7BfanEBvVay5SZAbF5795VUXesFgkHXAw1eDzijWA1QMG76cxqehM7zZurQuCrJsZnPFi",
        expectedOutput: "Key Analyzed: xprv9s21ZrQH143K2cGpWQPQuyZYEMwror2UbE2oWX7BfanEBvVay5SZAbF5795VUXesFgkHXAw1eDzijWA1QMG76cxqehM7zZurQuCrJsZnPFi\n\tChecksum: 663cfc75\n\tVersion: 0488ade4\n\tLevel: 0\n\tFingerprint: 00000000\n\tChaincode: 374570a7ea4028600ce87e2769b4be7e4d90aa0b417cde33bc6c896f046b2c9f\n\tMasterKey: 00692cd2a168f6ef0d1b857b5f0ce89f14cc9fae5888a3a822c22e31b85b442059\n\n",
        recipeConfig: [
            {
                "op": "Deserialize Extended Key",
                "args": [false]
            },
        ],
    },
    {
        name: "Deserialize Extended Key - Key Only",
        input: "xprv9s21ZrQH143K2cGpWQPQuyZYEMwror2UbE2oWX7BfanEBvVay5SZAbF5795VUXesFgkHXAw1eDzijWA1QMG76cxqehM7zZurQuCrJsZnPFi",
        expectedOutput: "00692cd2a168f6ef0d1b857b5f0ce89f14cc9fae5888a3a822c22e31b85b442059",
        recipeConfig: [
            {
                "op": "Deserialize Extended Key",
                "args": [true]
            },
        ],
    },

]);
