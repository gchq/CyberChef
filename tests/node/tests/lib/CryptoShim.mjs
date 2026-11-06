import TestRegister from "../../../lib/TestRegister.mjs";
import it from "../../assertionHandler.mjs";
import assert from "assert";
import crypto from "crypto";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const cryptoShim = require("../../../../src/core/lib/CryptoShim.js");

TestRegister.addApiTests([
    it("CryptoShim: createSecretKey wraps a string key", () => {
        const key = cryptoShim.createSecretKey("secret_cat");
        assert.strictEqual(key.type, "secret");
        assert.deepStrictEqual(key.export(), Buffer.from("secret_cat"));
    }),

    it("CryptoShim: createHmac accepts a KeyObject", () => {
        const key = cryptoShim.createSecretKey("secret_cat");
        const actual = cryptoShim.createHmac("sha256", key).update("payload").digest("hex");
        const expected = crypto.createHmac("sha256", "secret_cat").update("payload").digest("hex");
        assert.strictEqual(actual, expected);
    }),

    it("CryptoShim: createHmac leaves plain keys unchanged", () => {
        const actual = cryptoShim.createHmac("sha256", "secret_cat").update("payload").digest("hex");
        const expected = crypto.createHmac("sha256", "secret_cat").update("payload").digest("hex");
        assert.strictEqual(actual, expected);
    }),

    it("CryptoShim: asymmetric constructors reject plain secrets", () => {
        assert.throws(() => cryptoShim.createPrivateKey("secret_cat"), TypeError);
        assert.throws(() => cryptoShim.createPublicKey("secret_cat"), TypeError);
    })
]);
