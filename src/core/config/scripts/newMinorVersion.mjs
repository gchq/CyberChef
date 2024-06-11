/**
 * This script updates the CHANGELOG when a new minor version is created.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

/* eslint no-console: ["off"] */

import prompt from "prompt";
import colors from "colors";
import path from "path";
import fs  from "fs";
import process from "process";

const dir = path.join(process.cwd() + "/src/core/config/");
if (!fs.existsSync(dir)) {
    console.log("\nCWD: " + process.cwd());
    console.log("Error: newMinorVersion.mjs should be run from the project root");
    console.log("Example> node --experimental-modules src/core/config/scripts/newMinorVersion.mjs");
    process.exit(1);
}

let changelogData = fs.readFileSync(path.join(process.cwd(), "CHANGELOG.md"), "utf8");
const lastVersion = changelogData.match(/## Details\s+### \[(\d+)\.(\d+)\.(\d+)\]/);
const newVersion = [
    parseInt(lastVersion[1], 10),
    parseInt(lastVersion[2], 10) + 1,
    0
];

let knownContributors = changelogData.match(/^\[@([^\]]+)\]/gm);
knownContributors = knownContributors.map(c => c.slice(2, -1));

const date = (new Date()).toISOString().split("T")[0];

const schema = {
    properties: {
        message: {
            description: "A short but descriptive summary of a feature in this version",
            example: "Added 'Op name' operation",
            prompt: "Feature description",
            type: "string",
            required: true,
        },
        author: {
            description: "The author of the feature (only one supported, edit manually to add more)",
            example: "n1474335",
            prompt: "Author",
            type: "string",
            default: "n1474335"
        },
        id: {
            description: "The PR number or full commit hash for this feature.",
            example: "1200",
            prompt: "Pull request or commit ID",
            type: "string"
        },
        another: {
            description: "y/n",
            example: "y",
            prompt: "Add another feature?",
            type: "string",
            pattern: /^[yn]$/,
        }
    }
};

// Build schema
for (const prop in schema.properties) {
    const p = schema.properties[prop];
    p.description = "\n" + colors.white(p.description) + colors.cyan("\nExample: " + p.example) + "\n" + colors.green(p.prompt);
}

prompt.message = "";
prompt.delimiter = ":".green;

const features = [];
const authors = [];
const prIDs = [];
const commitIDs = [];

prompt.start();

const getFeature = function() {
    prompt.get(schema, (err, result) => {
        if (err) {
            console.log("\nExiting script.");
            process.exit(0);
        }

        features.push(result);

        if (result.another === "y") {
            getFeature();
        } else {
            let message = `### [${newVersion[0]}.${newVersion[1]}.${newVersion[2]}] - ${date}\n`;

            features.forEach(feature => {
                const id = feature.id.length > 10 ? feature.id.slice(0, 7) : "#" + feature.id;
                message += `- ${feature.message} [@${feature.author}] | [${id}]\n`;

                if (!knownContributors.includes(feature.author)) {
                    authors.push(`[@${feature.author}]: https://github.com/${feature.author}`);
                }

                if (feature.id.length > 10) {
                    commitIDs.push(`[${id}]: https://github.com/gchq/CyberChef/commit/${feature.id}`);
                } else {
                    prIDs.push(`[#${feature.id}]: https://github.com/gchq/CyberChef/pull/${feature.id}`);
                }
            });

            // Message
            changelogData = changelogData.replace(/## Details\n\n/, "## Details\n\n" + message + "\n");

            // Tag
            const newTag = `[${newVersion[0]}.${newVersion[1]}.${newVersion[2]}]: https://github.com/gchq/CyberChef/releases/tag/v${newVersion[0]}.${newVersion[1]}.${newVersion[2]}\n`;
            changelogData = changelogData.replace(/\n\n(\[\d+\.\d+\.\d+\]: https)/, "\n\n" + newTag + "$1");

            // Author
            authors.forEach(author => {
                changelogData = changelogData.replace(/(\n\[@[^\]]+\]: https:\/\/github\.com\/[^\n]+\n)\n/, "$1" + author + "\n\n");
            });

            // Commit IDs
            commitIDs.forEach(commitID => {
                changelogData = changelogData.replace(/(\n\[[^\].]+\]: https:\/\/github.com\/gchq\/CyberChef\/commit\/[^\n]+\n)\n/, "$1" + commitID + "\n\n");
            });

            // PR IDs
            prIDs.forEach(prID => {
                changelogData = changelogData.replace(/(\n\[#[^\]]+\]: https:\/\/github.com\/gchq\/CyberChef\/pull\/[^\n]+\n)\n*$/, "$1" + prID + "\n\n");
            });

            fs.writeFileSync(path.join(process.cwd(), "CHANGELOG.md"), changelogData);

            console.log("Written CHANGELOG.md\nCommit changes and then run `npm version minor`.");
        }
    });
};

getFeature();
