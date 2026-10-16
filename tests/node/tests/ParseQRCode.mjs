/**
 * ParseQRCode API tests.
 *
 * @author Sanjays2402
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";
import OperationConfig from "../../../src/core/config/OperationConfig.json" with { type: "json" };
import it from "../assertionHandler.mjs";
import assert from "assert";

TestRegister.addApiTests([
    /*
     * Regression test for #2610.
     *
     * Parse QR Code used to declare a `checks` regex that matched any JPEG,
     * PNG, GIF, WEBP or BMP magic bytes. Magic aggregates every operation
     * with a `checks` property, so any image input ran through a full QR
     * parse attempt, which in turn emitted a "Could not read a QR code from
     * the image" warning to the browser console for every image. There is
     * no cheap way to detect a QR code without attempting a full parse, so
     * Parse QR Code must not participate in Magic; users can add it
     * manually when they know an image contains a QR code.
     */
    it("Parse QR Code: must not participate in Magic (#2610)", () => {
        const op = OperationConfig["Parse QR Code"];
        assert(op, "Parse QR Code operation is missing from OperationConfig");
        assert(
            !op.checks || op.checks.length === 0,
            "Parse QR Code must not declare `checks`; otherwise Magic will run a " +
                "QR parse on every image and spam the console (see issue #2610)."
        );
    }),
]);
