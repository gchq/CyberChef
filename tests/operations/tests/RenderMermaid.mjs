/**
 * RenderMermaid tests.
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Render Mermaid: Nothing",
        input: "  \n",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Render Mermaid",
                "args": []
            }
        ]
    },
    {
        name: "Render Mermaid: Flowchart",
        input: "graph TD\n    A-->B",
        expectedOutput: '<div class="mermaid-diagram" data-source="graph TD\n    A--&gt;B" style="background: #fff; padding: 10px"></div>',
        recipeConfig: [
            {
                "op": "Render Mermaid",
                "args": []
            }
        ]
    },
    {
        name: "Render Mermaid: Source cannot break out of the attribute",
        input: "graph TD\n    A[\"\"><img src=x onerror=alert(1)>\"]",
        expectedOutput: '<div class="mermaid-diagram" data-source="graph TD\n    A[&quot;&quot;&gt;&lt;img src=x onerror=alert(1)&gt;&quot;]" style="background: #fff; padding: 10px"></div>',
        recipeConfig: [
            {
                "op": "Render Mermaid",
                "args": []
            }
        ]
    },
]);
