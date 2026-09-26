/**
 * To Table tests.
 *
 * @author CyberChefCloud
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "To Table: quoted CSV cells keep their delimiters",
        input: "name,note\n\"Smith, J\",\"said \"\"hi\"\"\"\n",
        expectedOutput: "<table class='table table-hover table-sm table-bordered table-nonfluid'><thead class='thead-light'><tr><th>name</th><th>note</th></tr></thead><tbody><tr><td>Smith, J</td><td>said &quot;hi&quot;</td></tr></tbody></table>",
        recipeConfig: [{ op: "To Table", args: [",", "\\r\\n", true, "HTML"] }],
    },
    {
        name: "To Table: HTML in cells is escaped",
        input: "a,b\n<script>,x&y\n",
        expectedOutput: "<table class='table table-hover table-sm table-bordered table-nonfluid'><tbody><tr><td>a</td><td>b</td></tr><tr><td>&lt;script&gt;</td><td>x&amp;y</td></tr></tbody></table>",
        recipeConfig: [{ op: "To Table", args: [",", "\\r\\n", false, "HTML"] }],
    },
]);
