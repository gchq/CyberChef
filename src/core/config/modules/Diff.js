import Diff from "../../operations/Diff.js";


/**
 * Diff module.
 *
 * Libraries:
 *  - JsDIff
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
let OpModules = self.OpModules || {};

OpModules.Diff = {
    "Diff": Diff.runDiff,
};

export default OpModules;
