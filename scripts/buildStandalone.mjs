/**
 * Builds standalone CyberChef HTML file, creates zip archive, and calculates SHA256 hash.
 * Replaces the Grunt tasks: copy:standalone, zip:standalone, clean:standalone, exec:calcDownloadHash
 *
 * @author CyberChef Modernization
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import { readFileSync, writeFileSync, unlinkSync, createReadStream, createWriteStream, readdirSync, statSync } from "fs";
import { createHash } from "crypto";
import { join, relative } from "path";
import { createGzip } from "zlib";
import { pipeline } from "stream/promises";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const version = pkg.version;
const buildDir = "build/prod";

// Step 1: Create standalone HTML (copy:standalone equivalent)
console.log("--- Creating standalone HTML ---");
let indexHtml = readFileSync(join(buildDir, "index.html"), "utf8");

// Replace download link with version number
indexHtml = indexHtml.replace(/<a [^>]+>Download CyberChef.+?<\/a>/,
    `<span>Version ${version}</span>`);

const standaloneFilename = `CyberChef_v${version}.html`;
writeFileSync(join(buildDir, standaloneFilename), indexHtml);
console.log(`Created ${standaloneFilename}`);

// Step 2: Create zip archive (zip:standalone equivalent)
console.log("--- Creating zip archive ---");
const archiver = (await import("archiver")).default;
const zipFilename = `CyberChef_v${version}.zip`;
const zipPath = join(buildDir, zipFilename);

const output = createWriteStream(zipPath);
const archive = archiver("zip", { zlib: { level: 9 } });

await new Promise((resolve, reject) => {
    output.on("close", resolve);
    archive.on("error", reject);

    archive.pipe(output);

    // Add all files from build/prod except index.html and BundleAnalyzerReport.html
    const addDir = (dir) => {
        const entries = readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            const relPath = relative(buildDir, fullPath);

            if (entry.isDirectory()) {
                addDir(fullPath);
            } else if (entry.isFile()) {
                if (relPath === "index.html" || relPath === "BundleAnalyzerReport.html") continue;
                if (relPath.startsWith("CyberChef_v")) continue; // skip standalone files
                archive.file(fullPath, { name: relPath });
            }
        }
    };

    addDir(buildDir);
    archive.finalize();
});

console.log(`Created ${zipFilename}`);

// Step 3: Clean standalone HTML (clean:standalone equivalent)
unlinkSync(join(buildDir, standaloneFilename));
console.log(`Cleaned ${standaloneFilename}`);

// Step 4: Calculate SHA256 hash (exec:calcDownloadHash equivalent)
console.log("--- Calculating SHA256 hash ---");
const zipBuffer = readFileSync(zipPath);
const hash = createHash("sha256").update(zipBuffer).digest("hex");
writeFileSync(join(buildDir, "sha256digest.txt"), hash);

// Replace placeholder in index.html
let prodIndexHtml = readFileSync(join(buildDir, "index.html"), "utf8");
prodIndexHtml = prodIndexHtml.replace(/DOWNLOAD_HASH_PLACEHOLDER/g, hash);
writeFileSync(join(buildDir, "index.html"), prodIndexHtml);

console.log(`SHA256: ${hash}`);
console.log("--- Standalone build complete ---");
