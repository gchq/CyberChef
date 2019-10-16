/* eslint no-console: 0 */

/**
 * Node API Test Runner
 *
 * @author d98762625 [d98762625@gmail.com]
 * @author tlwr [toby@toby.codes]
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import {
    setLongTestFailure,
    logTestReport,
} from "../lib/utils.mjs";

import TestRegister from "../lib/TestRegister.mjs";
import "./tests/nodeApi.mjs";
import "./tests/operations.mjs";
import "./tests/File.mjs";
import "./tests/Dish.mjs";
import "./tests/NodeDish.mjs";
import "./tests/Utils.mjs";
import "./tests/Categories.mjs";

const testStatus = {
    allTestsPassing: true,
    counts: {
        total: 0,
    }
};

setLongTestFailure();

const logOpsTestReport = logTestReport.bind(null, testStatus);

TestRegister.runApiTests()
    .then(logOpsTestReport);

