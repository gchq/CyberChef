/**
 * Regression coverage for production bundle cache invalidation.
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const grunt = require("grunt");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
require("../../Gruntfile.js")(grunt);
const productionFilename = grunt.config.get("webpack.web.output.filename");
const compile = promisify(webpack);

test("production HTML invalidates cached JavaScript when the build time changes", async t => {
    const directory = await mkdtemp(path.join(tmpdir(), "cyberchef-build-cache-"));
    t.after(() => rm(directory, { recursive: true, force: true }));
    const entry = path.join(directory, "entry.js");
    await writeFile(entry, "globalThis.compileTime = COMPILE_TIME;\n");
    const scriptUrls = [];
    const buildTimes = ["09/09/2024 12:00:00 UTC", "09/09/2026 12:00:00 UTC", "09/09/2026 12:00:00 UTC"];

    for (const [index, compileTime] of buildTimes.entries()) {
        const outputPath = path.join(directory, String(index));
        const stats = await compile({
            mode: "production",
            target: "web",
            entry: { main: entry, ChefWorker: entry, "modules/Default": entry },
            output: { path: outputPath, filename: productionFilename, publicPath: "" },
            plugins: [
                new webpack.DefinePlugin({ COMPILE_TIME: JSON.stringify(compileTime) }),
                new HtmlWebpackPlugin({
                    chunks: ["main"],
                    templateContent: `<html><body>Compile time: ${compileTime}</body></html>`
                })
            ]
        });
        assert.equal(stats.hasErrors(), false, stats.toString({ all: false, errors: true }));
        const html = await readFile(path.join(outputPath, "index.html"), "utf8");
        const scriptUrl = stats.toJson({ all: false, entrypoints: true })
            .entrypoints.main.assets.find(asset => asset.name.endsWith(".js")).name;
        assert.ok(html.includes(scriptUrl), "HTML must reference the emitted app bundle");
        scriptUrls.push(scriptUrl);
        const context = {};
        runInNewContext(await readFile(path.join(outputPath, scriptUrl), "utf8"), context);
        assert.equal(context.compileTime, compileTime);
        assert.ok(html.includes(`Compile time: ${compileTime}`));
        // Worker and operation module names are consumed separately and must stay unchanged.
        await readFile(path.join(outputPath, "ChefWorker.js"));
        await readFile(path.join(outputPath, "modules/Default.js"));
    }

    assert.notEqual(scriptUrls[0], scriptUrls[1], "a newer build must not reuse the old cached bundle URL");
    assert.equal(scriptUrls[1], scriptUrls[2], "identical bundles should retain the same cache key");
});
