/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import TestRegister from "../../lib/TestRegister.mjs";
import it from "../assertionHandler.mjs";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const sha = "1234567890abcdef1234567890abcdef12345678";
const version = "11.4.0";
const readConfiguration = `
    const grunt = require("grunt");
    const readJSON = grunt.file.readJSON;
    grunt.file.readJSON = function (filename, ...args) {
        const result = readJSON.call(this, filename, ...args);
        return filename === "package.json" ? {...result, version: process.argv[1]} : result;
    };
    require("./Gruntfile.js")(grunt);
    const html = grunt.config.getRaw("webpack.web.plugins")
        .find(plugin => plugin.constructor.name === "HtmlWebpackPlugin").userOptions;
    console.log(JSON.stringify({
        archive: grunt.config.get("zip.standalone.dest"),
        version: html.version,
        download: html.downloadZipFilename,
        standalone: grunt.config.get("copy.standalone.files")[0].dest
    }));
`;

TestRegister.addApiTests([
    ["release tag", version, {GITHUB_REF: `refs/tags/v${version}`, GITHUB_SHA: sha}, `v${version}`],
    ["prerelease tag", "11.4.1-rc.1", {GITHUB_REF: "refs/tags/v11.4.1-rc.1", GITHUB_SHA: sha}, "v11.4.1-rc.1"],
    ["branch build", version, {GITHUB_REF: "refs/heads/master", GITHUB_SHA: sha}, sha],
    ["version-named branch", version, {GITHUB_REF: `refs/heads/v${version}`, GITHUB_SHA: sha}, sha],
    ["pull request", version, {GITHUB_REF: "refs/pull/123/merge", GITHUB_SHA: sha}, sha],
    ["unmatched tag", version, {GITHUB_REF: "refs/tags/v0.0.0", GITHUB_SHA: sha}, sha],
    ["local build", version, {}, `v${version}`],
    ["build without commit metadata", version, {GITHUB_REF: "refs/heads/master"}, `v${version}`]
].map(([name, packageVersion, environment, expected]) => it(`Build version: ${name}`, () => {
    const result = spawnSync(process.execPath, ["--no-warnings", "--eval", readConfiguration, packageVersion], {
        cwd: root,
        env: {...process.env, GITHUB_SHA: "", GITHUB_REF: "", ...environment},
        encoding: "utf8",
        timeout: 10000
    });
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), {
        archive: `build/prod/CyberChef_${expected}.zip`,
        version: expected,
        download: `CyberChef_${expected}.zip`,
        standalone: `build/prod/CyberChef_v${packageVersion}.html`
    });
})));
