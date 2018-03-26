import BSON from "../../operations/BSON.js";


/**
 * BSON module.
 *
 * Libraries:
 *  - bson
 *  - buffer
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
let OpModules = typeof self === "undefined" ? {} : self.OpModules || {};

OpModules.BSON = {
    "BSON serialise":   BSON.runBSONSerialise,
    "BSON deserialise": BSON.runBSONDeserialise,
};

export default OpModules;
