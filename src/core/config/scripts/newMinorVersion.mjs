/**
 * This script updates the CHANGELOG when a new minor version is created.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

/* eslint no-console: ["off"] */
/* eslint jsdoc/require-jsdoc: ["off"] */

import path from "path";
import fs from "fs";
import process from "process";
import { execSync } from "child_process";

const ignoredAuthors = ["github-advanced-security[bot]", "dependabot[bot]"];

async function main() {
    const dir = path.join(process.cwd() + "/src/core/config/");
    if (!fs.existsSync(dir)) {
        console.log("\nCWD: " + process.cwd());
        console.log(
            "Error: newMinorVersion.mjs should be run from the project root",
        );
        console.log(
            "Example> node --experimental-modules src/core/config/scripts/newMinorVersion.mjs",
        );
        process.exit(1);
    }

    let changelogData = fs.readFileSync(
        path.join(process.cwd(), "CHANGELOG.md"),
        "utf8",
    );
    const lastVersion = changelogData.match(
        /## Details\s+### \[(\d+)\.(\d+)\.(\d+)\]/,
    );
    const newVersion = [
        parseInt(lastVersion[1], 10),
        parseInt(lastVersion[2], 10) + 1,
        0,
    ];

    let knownContributors = changelogData.match(/^\[@([^\]]+)\]/gm);
    knownContributors = knownContributors.map((c) => c.slice(2, -1));

    const date = new Date().toISOString().split("T")[0];

    const lastVersionSha = execSync(
        `git rev-list -n 1 v${lastVersion[1]}.${lastVersion[2]}.${lastVersion[3]}`,
        {
            encoding: "utf8",
        },
    ).trim();
    if (lastVersionSha.length !== 40) {
        throw new Error(
            `Unexpected output from git rev-list: ${lastVersionSha}`,
        );
    }

    const features = [];

    const commits = await (
        await fetch(`https://api.github.com/repos/gchq/cyberchef/commits`)
    ).json();
    let foundLast = false;
    for (const commit of commits) {
        if (commit.sha === lastVersionSha) {
            foundLast = true;
            break;
        } else {
            const feature = {
                message: "",
                authors: [],
                id: "",
            };

            const msgparts = commit.commit.message.split("\n\n");
            feature.message = msgparts[0];
            const prIdMatch = feature.message.match(/\(#(\d+)\)$/);
            if (prIdMatch !== null) {
                feature.message = feature.message
                    .replace(prIdMatch[0], "")
                    .trim();
                feature.id = prIdMatch[1];
            }

            if (!ignoredAuthors.includes(commit.author.login)) {
                feature.authors.push(commit.author.login);
            }

            if (msgparts.length > 1) {
                msgparts[1]
                    .split("\n")
                    .filter((line) => line.startsWith("Co-authored-by: "))
                    .forEach((line) => {
                        let coAuthor = line.slice("Co-authored-by: ".length);
                        if (coAuthor.indexOf(">") !== -1) {
                            const email = coAuthor.slice(
                                coAuthor.indexOf("<") + 1,
                                coAuthor.indexOf(">"),
                            );
                            if (email.endsWith("@users.noreply.github.com")) {
                                coAuthor = email.slice(
                                    email.indexOf("+") + 1,
                                    -"@users.noreply.github.com".length,
                                );
                            } else {
                                throw new Error(
                                    "Could not get ID of co-author: " +
                                        coAuthor,
                                );
                            }
                        } else {
                            throw new Error(
                                "Could not get email of co-author: " + coAuthor,
                            );
                        }
                        if (!ignoredAuthors.includes(coAuthor)) {
                            feature.authors.push(coAuthor);
                        }
                    });
            }

            features.push(feature);
        }
    }
    if (!foundLast) {
        throw new Error(
            `Could not find last version commit: ${lastVersionSha} - need to add paging functionality`,
        );
    }

    let message = `### [${newVersion[0]}.${newVersion[1]}.${newVersion[2]}] - ${date}\n`;

    const authors = [];
    const prIDs = [];
    const commitIDs = [];

    features.forEach((feature) => {
        const id =
            feature.id.length > 10 ? feature.id.slice(0, 7) : "#" + feature.id;
        message += `- ${feature.message} ${feature.authors.map((a) => `[@${a}]`).join(" ")} | [${id}]\n`;

        feature.authors.forEach((author) => {
            if (!knownContributors.includes(author)) {
                knownContributors.push(author);
                authors.push(`[@${author}]: https://github.com/${author}`);
            }
        });

        if (feature.id.length > 10) {
            commitIDs.push(
                `[${id}]: https://github.com/gchq/CyberChef/commit/${feature.id}`,
            );
        } else {
            prIDs.push(
                `[#${feature.id}]: https://github.com/gchq/CyberChef/pull/${feature.id}`,
            );
        }
    });

    // Message
    changelogData = changelogData.replace(
        /## Details\n\n/,
        "## Details\n\n" + message + "\n",
    );

    // Tag
    const newTag = `[${newVersion[0]}.${newVersion[1]}.${newVersion[2]}]: https://github.com/gchq/CyberChef/releases/tag/v${newVersion[0]}.${newVersion[1]}.${newVersion[2]}\n`;
    changelogData = changelogData.replace(
        /\n\n(\[\d+\.\d+\.\d+\]: https)/,
        "\n\n" + newTag + "$1",
    );

    // Author
    authors.forEach((author) => {
        changelogData = changelogData.replace(
            /(\n\[@[^\]]+\]: https:\/\/github\.com\/[^\n]+\n)\n/,
            "$1" + author + "\n\n",
        );
    });

    // Commit IDs
    commitIDs.forEach((commitID) => {
        changelogData = changelogData.replace(
            /(\n\[[^\].]+\]: https:\/\/github.com\/gchq\/CyberChef\/commit\/[^\n]+\n)\n/,
            "$1" + commitID + "\n\n",
        );
    });

    // PR IDs
    prIDs.forEach((prID) => {
        changelogData = changelogData.replace(
            /(\n\[#[^\]]+\]: https:\/\/github.com\/gchq\/CyberChef\/(?:pull|issues)\/[^\n]+\n)\n*$/,
            "$1" + prID + "\n\n",
        );
    });

    fs.writeFileSync(path.join(process.cwd(), "CHANGELOG.md"), changelogData);
}
main().catch(console.error);
