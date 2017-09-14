import * as CRC from "js-crc";
import Utils from "../Utils.js";


/**
 * Checksum operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const Checksum = {

    /**
     * Fletcher-8 Checksum operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runFletcher8: function(input, args) {
        let a = 0,
            b = 0;

        for (let i = 0; i < input.length; i++) {
            a = (a + input[i]) % 0xf;
            b = (b + a) % 0xf;
        }

        return Utils.hex(((b << 4) | a) >>> 0, 2);
    },


    /**
     * Fletcher-16 Checksum operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runFletcher16: function(input, args) {
        let a = 0,
            b = 0;

        for (let i = 0; i < input.length; i++) {
            a = (a + input[i]) % 0xff;
            b = (b + a) % 0xff;
        }

        return Utils.hex(((b << 8) | a) >>> 0, 4);
    },


    /**
     * Fletcher-32 Checksum operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runFletcher32: function(input, args) {
        let a = 0,
            b = 0;

        for (let i = 0; i < input.length; i++) {
            a = (a + input[i]) % 0xffff;
            b = (b + a) % 0xffff;
        }

        return Utils.hex(((b << 16) | a) >>> 0, 8);
    },


    /**
     * Fletcher-64 Checksum operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runFletcher64: function(input, args) {
        let a = 0,
            b = 0;

        for (let i = 0; i < input.length; i++) {
            a = (a + input[i]) % 0xffffffff;
            b = (b + a) % 0xffffffff;
        }

        return Utils.hex(b >>> 0, 8) + Utils.hex(a >>> 0, 8);
    },


    /**
     * Adler-32 Checksum operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runAdler32: function(input, args) {
        let MOD_ADLER = 65521,
            a = 1,
            b = 0;

        for (let i = 0; i < input.length; i++) {
            a += input[i];
            b += a;
        }

        a %= MOD_ADLER;
        b %= MOD_ADLER;

        return Utils.hex(((b << 16) | a) >>> 0, 8);
    },


    /**
     * CRC-32 Checksum operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runCRC32: function(input, args) {
        return CRC.crc32(input);
    },


    /**
     * CRC-16 Checksum operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runCRC16: function(input, args) {
        return CRC.crc16(input);
    },


    /**
     * TCP/IP Checksum operation.
     *
     * @author GCHQ Contributor [1]
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     *
     * @example
     * // returns '3f2c'
     * Checksum.runTcpIp([0x45,0x00,0x00,0x87,0xa3,0x1b,0x40,0x00,0x40,0x06,
     *                      0x00,0x00,0xac,0x11,0x00,0x04,0xac,0x11,0x00,0x03])
     *
     * // returns 'a249'
     * Checksum.runTcpIp([0x45,0x00,0x01,0x11,0x3f,0x74,0x40,0x00,0x40,0x06,
     *                      0x00,0x00,0xac,0x11,0x00,0x03,0xac,0x11,0x00,0x04])
     */
    runTCPIP: function(input, args) {
        let csum = 0;

        for (let i = 0; i < input.length; i++) {
            if (i % 2 === 0) {
                csum += (input[i] << 8);
            } else {
                csum += input[i];
            }
        }

        csum = (csum >> 16) + (csum & 0xffff);

        return Utils.hex(0xffff - csum);
    },

};

export default Checksum;
