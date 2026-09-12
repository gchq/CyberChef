/**
 * Disassemble x86 address reset tests.
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import assert from "assert";
import chef from "../../../src/node/index.mjs";
import TestRegister from "../../lib/TestRegister.mjs";
import it from "../assertionHandler.mjs";

/**
 * Run a new recipe against the shared disassembler.
 *
 * @param {string} mode
 * @param {string} offset
 * @param {string} [input="FFE0"]
 * @returns {Promise<string>}
 */
async function disassemble(mode, offset, input = "FFE0") {
    const result = await chef.bake(input, [{
        op: "Disassemble x86",
        args: [mode, "Full x86 architecture", "16", offset, false, true]
    }]);
    return result.toString();
}

TestRegister.addApiTests([
    it("Disassemble x86: clear low address bits between 64-bit recipes", async () => {
        assert.match(await disassemble("64", "00000000FFFFFFFF"), /^00000000FFFFFFFF JMP RAX/);
        assert.match(await disassemble("64", "0"), /^0000000000000000 JMP RAX/);
    }),
    it("Disassemble x86: clear high address bits between 64-bit recipes", async () => {
        assert.match(await disassemble("64", "1234567800000010"), /^1234567800000010 JMP RAX/);
        assert.match(await disassemble("64", "10000"), /^0000000000010000 JMP RAX/);
    }),
    it("Disassemble x86: clear low address bits between 32-bit recipes", async () => {
        assert.match(await disassemble("32", "12345678"), /^12345678 JMP EAX/);
        assert.match(await disassemble("32", "1"), /^00000001 JMP EAX/);
    }),
    it("Disassemble x86: reset address when switching bit modes", async () => {
        await disassemble("64", "1234567812345678");
        assert.match(await disassemble("16", "1234", "90"), /^0016:1234 NOP/);
        assert.match(await disassemble("64", "0x10", "90"), /^0000000000000010 NOP/);
    }),
    it("Disassemble x86: preserve carry inside a recipe and reset on the next", async () => {
        assert.strictEqual(await disassemble("64", "00000000FFFFFFFF", "9090"),
            "00000000FFFFFFFF NOP\r\n0000000100000000 NOP\r\n");
        assert.match(await disassemble("64", "0", "90"), /^0000000000000000 NOP/);
    }),
]);
