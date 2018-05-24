import bsonjs from "bson";
import {Buffer} from "buffer";


/**
 * BSON operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 *
 * @namespace
 */
const BSON = {

    /**
     * BSON serialise operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    runBSONSerialise(input, args) {
        if (!input) return new ArrayBuffer();

        const bson = new bsonjs();

        try {
            const data = JSON.parse(input);
            return bson.serialize(data).buffer;
        } catch (err) {
            throw err.toString();
        }
    },


    /**
     * BSON deserialise operation.
     *
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     *
     */
    runBSONDeserialise(input, args) {
        if (!input.byteLength) return "";

        const bson = new bsonjs();

        try {
            const data = bson.deserialize(new Buffer(input));
            return JSON.stringify(data, null, 2);
        } catch (err) {
            return err.toString();
        }
    },
};

export default BSON;
