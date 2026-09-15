/**
 * ExtractDomains tests.
 *
 * @author @BruceGithub [github.com/BruceGithub]
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "ExtractDomains: SRV-style domain with underscores",
        input: "_sip._tls.lewes-tc.gov.uk",
        expectedOutput: "_sip._tls.lewes-tc.gov.uk",
        recipeConfig: [
            {
                op: "Extract domains",
                args: []
            }
        ],
    },
    {
        name: "ExtractDomains: domain with underscore in label",
        input: "foo_bar.example.com",
        expectedOutput: "foo_bar.example.com",
        recipeConfig: [
            {
                op: "Extract domains",
                args: []
            }
        ],
    },
    {
        name: "ExtractDomains: normal domain",
        input: "normal-domain.org",
        expectedOutput: "normal-domain.org",
        recipeConfig: [
            {
                op: "Extract domains",
                args: []
            }
        ],
    },
    {
        name: "ExtractDomains: invalid TLD with underscore",
        input: "example._com",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Extract domains",
                args: []
            }
        ],
    },
    {
        name: "ExtractDomains: invalid label starting with hyphen",
        input: "-bad.example.com",
        expectedOutput: "bad.example.com",
        recipeConfig: [
            {
                op: "Extract domains",
                args: []
            }
        ],
    },
]);
