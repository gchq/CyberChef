import assert from "assert";
import it from "../assertionHandler.mjs";
import TestRegister from "../../lib/TestRegister.mjs";
import ParseIPv4Header from "../../../src/core/operations/ParseIPv4Header.mjs";

TestRegister.addApiTests([
    it("Parse IPv4 header: regression for Uint8Array.concat crash on truncated raw input", () => {
        const operation = new ParseIPv4Header();
        const truncatedHeader = new Uint8Array([0x45, 0x00, 0x00, 0x14, 0x00, 0x00, 0x00, 0x00, 0x40, 0x06, 0x00, 0x00]);
        // The Raw path converts the input into a Uint8Array before checksum header construction.
        const rawInput = String.fromCharCode(...truncatedHeader);
        let result;
        let thrownError;

        try {
            result = operation.run(rawInput, ["Raw", "Data (raw)"]);
        } catch (err) {
            thrownError = err;
        }

        assert.ok(!(thrownError instanceof TypeError), `Unexpected TypeError: ${thrownError && thrownError.message}`);
        assert.ifError(thrownError);
        assert.strictEqual(typeof result, "string");
    })
]);
