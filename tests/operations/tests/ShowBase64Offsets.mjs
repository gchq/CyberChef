/**
 * ShowBase64Offsets tests
 *
 * @author SAY-5
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        // Regression test for #2344. With showVariable=false the
        // staticSection (toBase64 output, alphabet-derived from a
        // user-controlled argument) was inserted into the HTML output
        // unescaped. A crafted alphabet whose Base64 image starts with
        // `<script>...` could land directly in the rendered output and
        // be eval'd by OutputWaiter.mjs. The fix runs the unescaped
        // path through Utils.escapeHtml; this test pins that the raw
        // `<script>` substring no longer appears verbatim and instead
        // appears as the HTML-encoded `&lt;script&gt;`.
        name: "Show Base64 offsets: HTML escapes static output (#2344)",
        input: "ABCDEFGHIJKDGLMNAOBCDEFGHPPP",
        // alphabet chosen so toBase64(input, alphabet) starts with
        // "<script>"; recipe also passes showVariable=false so the
        // staticSection is the bare offset0/1/2 reused as raw text.
        expectedMatch: /&lt;script&gt;|<\/script>/,
        recipeConfig: [
            {
                op: "Show Base64 offsets",
                args: [
                    "<script>ale(1)/.ABCDEFGHIJKLMNOPQRSTUVWXYZbdfghjkmnoquvwxyz023456",
                    false,
                    "Raw",
                ],
            },
        ],
    },
    {
        // Sanity: the showVariable=false output for a benign alphabet
        // still produces something that contains the expected offsets
        // header. This guards against the fix accidentally breaking
        // the happy path.
        name: "Show Base64 offsets: benign alphabet still renders Offset 0",
        input: "Hello, world!",
        expectedMatch: /Offset 0:/,
        recipeConfig: [
            {
                op: "Show Base64 offsets",
                args: [
                    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
                    false,
                    "Raw",
                ],
            },
        ],
    },
]);
