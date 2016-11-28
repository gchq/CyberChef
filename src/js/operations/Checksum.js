/**
 * Checksum operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var Checksum = {

    /**
     * Fletcher-16 Checksum operation.
     *
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_fletcher16: function(input, args) {
        var a = 0,
            b = 0;
        
        for (var i = 0; i < input.length; i++) {
            a = (a + input[i]) % 0xff;
            b = (b + a) % 0xff;
        }
        
        return Utils.hex(((b << 8) | a) >>> 0, 4);
    },
    
    
    /**
     * Adler-32 Checksum operation.
     *
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_adler32: function(input, args) {
        var MOD_ADLER = 65521,
            a = 1,
            b = 0;
        
        for (var i = 0; i < input.length; i++) {
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
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_crc32: function(input, args) {
        var crc_table = window.crc_table || (window.crc_table = Checksum._gen_crc_table()),
            crc = 0 ^ (-1);
        
        for (var i = 0; i < input.length; i++) {
            crc = (crc >>> 8) ^ crc_table[(crc ^ input[i]) & 0xff];
        }
        
        return Utils.hex((crc ^ (-1)) >>> 0);
    },
    
    
    /**
     * TCP/IP Checksum operation.
     *
     * @author GCHQ Contributor [1]
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {string}
     *
     * @example
     * // returns '3f2c'
     * Checksum.run_tcp_ip([0x45,0x00,0x00,0x87,0xa3,0x1b,0x40,0x00,0x40,0x06,
     *                      0x00,0x00,0xac,0x11,0x00,0x04,0xac,0x11,0x00,0x03])
     *
     * // returns 'a249'
     * Checksum.run_tcp_ip([0x45,0x00,0x01,0x11,0x3f,0x74,0x40,0x00,0x40,0x06,
     *                      0x00,0x00,0xac,0x11,0x00,0x03,0xac,0x11,0x00,0x04])
     */
    run_tcp_ip: function(input, args) {
        var csum = 0;
        
        for (var i = 0; i < input.length; i++) {
            if(i % 2 === 0) {
                csum += (input[i] << 8);
            } else {
                csum += input[i];
            }
        }

        csum = (csum >> 16) + (csum & 0xffff);

        return Utils.hex(0xffff - csum);
    },
    
    
    /**
     * Generates a CRC table for use with CRC checksums.
     *
     * @private
     * @returns {array}
     */
    _gen_crc_table: function() {
        var c,
            crc_table = [];
        
        for (var n = 0; n < 256; n++) {
            c = n;
            for (var k = 0; k < 8; k++) {
                c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
            }
            crc_table[n] = c;
        }
        
        return crc_table;
    },

};
