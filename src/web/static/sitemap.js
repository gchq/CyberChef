import sm from "sitemap";
import OperationConfig from "../../core/config/MetaConfig.js";


/**
 * Generates an XML sitemap for all CyberChef operations and a number of recipes.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

const sitemap = sm.createSitemap({
    hostname: "https://gchq.github.io/CyberChef",
});

sitemap.add({
    url: "/",
    changefreq: "weekly",
    priority: 1.0
});

for (let op in OperationConfig) {
    sitemap.add({
        url: `/#op=${encodeURIComponent(op)}`,
        changeFreq: "yearly",
        priority: 0.5
    });
}

const xml = sitemap.toString();

console.log(xml); // eslint-disable-line no-console
