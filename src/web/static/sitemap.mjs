import sm from "sitemap";
import OperationConfig from "../../core/config/OperationConfig.json" assert { type: "json" };

/**
 * Generates an XML sitemap for all CyberChef operations and a number of recipes.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

const smStream = new sm.SitemapStream({
    hostname: "https://gchq.github.io/CyberChef"
});

smStream.write({
    url: "/",
    changefreq: "weekly",
    priority: 1.0
});

for (const op in OperationConfig) {
    smStream.write({
        url: `/?op=${encodeURIComponent(op)}`,
        changeFreq: "yearly",
        priority: 0.5
    });
}
smStream.end();

sm.streamToPromise(smStream).then(
    (buffer) => console.log(buffer.toString()) // eslint-disable-line no-console
);
