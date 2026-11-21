import TestRegister from "../../lib/TestRegister.mjs";
import it from "../assertionHandler.mjs";
import assert from "assert";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const webpackConfig = require("../../../webpack.config.js");

TestRegister.addApiTests([
    it("Webpack: Babel exclusion handles Windows node_modules paths", () => {
        const javascriptRule = webpackConfig.module.rules.find(rule =>
            rule.loader === "babel-loader"
        );

        assert(javascriptRule.exclude.test("C:\\repo\\node_modules\\lodash\\index.js"));
        assert(!javascriptRule.exclude.test("C:\\repo\\node_modules\\crypto-api\\index.js"));
        assert(!javascriptRule.exclude.test("C:\\repo\\node_modules\\bootstrap\\index.js"));
        assert(javascriptRule.exclude.test("/repo/node_modules/lodash/index.js"));
    }),
]);
