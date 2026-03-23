/**
 * Prepares build/prod/index.html for GitHub Pages deployment.
 * Adds Google Analytics and Structured Data.
 * Replaces the Grunt copy:ghPages task.
 *
 * @author CyberChef Modernization
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const buildDir = "build/prod";

console.log("--- Preparing for GitHub Pages ---");

let indexHtml = readFileSync(join(buildDir, "index.html"), "utf8");

// Add Google Analytics code
const gaHtml = readFileSync("src/web/static/ga.html", "utf8");
indexHtml = indexHtml.replace("</body></html>", gaHtml + "</body></html>");

// Add Structured Data for SEO
const structuredData = JSON.parse(readFileSync("src/web/static/structuredData.json", "utf8"));
indexHtml = indexHtml.replace("</head>",
    "<script type='application/ld+json'>" +
    JSON.stringify(structuredData) +
    "</script></head>");

writeFileSync(join(buildDir, "index.html"), indexHtml);
console.log("--- GitHub Pages preparation complete ---");
