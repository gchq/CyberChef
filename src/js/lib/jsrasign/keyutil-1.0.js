/*! keyutil-1.0.10.js (c) 2013-2015 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
/*
 * keyutil.js - key utility for PKCS#1/5/8 PEM, RSA/DSA/ECDSA key object
 *
 * Copyright (c) 2013-2015 Kenji Urushima (kenji.urushima@gmail.com)
 *
 * This software is licensed under the terms of the MIT License.
 * http://kjur.github.com/jsrsasign/license
 *
 * The above copyright and license notice shall be 
 * included in all copies or substantial portions of the Software.
 */
/**
 * @fileOverview
 * @name keyutil-1.0.js
 * @author Kenji Urushima kenji.urushima@gmail.com
 * @version keyutil 1.0.10 (2015-Sep-13)
 * @since jsrsasign 4.1.4
 * @license <a href="http://kjur.github.io/jsrsasign/license/">MIT License</a>
 */

/**
 * @name KEYUTIL
 * @class class for RSA/ECC/DSA key utility
 * @description 
 * <br/>
 * {@link KEYUTIL} class is an update of former {@link PKCS5PKEY} class.
 * So for now, {@link PKCS5PKEY} is deprecated class.
 * {@link KEYUTIL} class has following features:
 * <dl>
 * <dt><b>key loading - {@link KEYUTIL.getKey}</b>
 * <dd>
 * <ul>
 * <li>supports RSAKey and KJUR.crypto.{ECDSA,DSA} key object</li>
 * <li>supports private key and public key</li>
 * <li>supports encrypted and plain private key</li>
 * <li>supports PKCS#1, PKCS#5 and PKCS#8 key</li>
 * <li>supports public key in X.509 certificate</li>
 * <li>key represented by JSON object</li>
 * </ul>
 * NOTE1: Encrypted PKCS#8 only supports PBKDF2/HmacSHA1/3DES <br/>
 * NOTE2: Encrypted PKCS#5 supports DES-CBC, DES-EDE3-CBC, AES-{128,192.256}-CBC <br/>
 *
 * <dt><b>exporting key - {@link KEYUTIL.getPEM}</b>
 * <dd>
 * {@link KEYUTIL.getPEM} method supports following formats:
 * <ul>
 * <li>supports RSA/EC/DSA keys</li>
 * <li>PKCS#1 plain RSA/EC/DSA private key</li>
 * <li>PKCS#5 encrypted RSA/EC/DSA private key with DES-CBC, DES-EDE3-CBC, AES-{128,192.256}-CBC</li>
 * <li>PKCS#8 plain RSA/EC/DSA private key</li>
 * <li>PKCS#8 encrypted RSA/EC/DSA private key with PBKDF2_HmacSHA1_3DES</li>
 * </ul>
 *
 * <dt><b>keypair generation - {@link KEYUTIL.generateKeypair}</b>
 * <ul>
 * <li>generate key pair of {@link RSAKey} or {@link KJUR.crypto.ECDSA}.</li>
 * <li>generate private key and convert it to PKCS#5 encrypted private key.</li>
 * </ul>
 * NOTE: {@link KJUR.crypto.DSA} is not yet supported.
 * </dl>
 * 
 * @example
 * // 1. loading private key
 * var key = KEYUTIL.getKey(pemPKCS1PrivateKey);
 * var key = KEYUTIL.getKey(pemPKCS5EncryptedPrivateKey, "passcode");
 * var key = KEYUTIL.getKey(pemPKC85PlainPrivateKey);
 * var key = KEYUTIL.getKey(pemPKC85EncryptedPrivateKey, "passcode");
 * // 2. loading public key
 * var key = KEYUTIL.getKey(pemPKCS8PublicKey);
 * var key = KEYUTIL.getKey(pemX509Certificate);
 * // 3. exporting private key
 * var pem = KEYUTIL.getPEM(privateKeyObj, "PKCS1PRV");
 * var pem = KEYUTIL.getPEM(privateKeyObj, "PKCS5PRV", "passcode"); // DES-EDE3-CBC by default
 * var pem = KEYUTIL.getPEM(privateKeyObj, "PKCS5PRV", "passcode", "DES-CBC");
 * var pem = KEYUTIL.getPEM(privateKeyObj, "PKCS8PRV");
 * var pem = KEYUTIL.getPEM(privateKeyObj, "PKCS8PRV", "passcode");
 * // 4. exporting public key
 * var pem = KEYUTIL.getPEM(publicKeyObj);
 */
/*
 * DEPRECATED METHODS
 * GET PKCS8
 * KEYUTIL.getRSAKeyFromPlainPKCS8PEM
 * KEYUTIL.getRSAKeyFromPlainPKCS8Hex
 * KEYUTIL.getRSAKeyFromEncryptedPKCS8PEM
 * P8 UTIL (make internal use)
 * KEYUTIL.getPlainPKCS8HexFromEncryptedPKCS8PEM
 * GET PKCS8 PUB
 * KEYUTIL.getKeyFromPublicPKCS8PEM
 * KEYUTIL.getKeyFromPublicPKCS8Hex
 * KEYUTIL.getRSAKeyFromPublicPKCS8PEM
 * KEYUTIL.getRSAKeyFromPublicPKCS8Hex
 * GET PKCS5
 * KEYUTIL.getRSAKeyFromEncryptedPKCS5PEM
 * PUT PKCS5
 * KEYUTIL.getEncryptedPKCS5PEMFromRSAKey
 * OTHER METHODS (FOR INTERNAL?)
 * KEYUTIL.getHexFromPEM
 * KEYUTIL.getDecryptedKeyHexByKeyIV
 */
var KEYUTIL = function() {
    // *****************************************************************
    // *** PRIVATE PROPERTIES AND METHODS *******************************
    // *****************************************************************
    // shared key decryption ------------------------------------------
    var decryptAES = function(dataHex, keyHex, ivHex) {
        return decryptGeneral(CryptoJS.AES, dataHex, keyHex, ivHex);
    };

    var decrypt3DES = function(dataHex, keyHex, ivHex) {
        return decryptGeneral(CryptoJS.TripleDES, dataHex, keyHex, ivHex);
    };

    var decryptDES = function(dataHex, keyHex, ivHex) {
        return decryptGeneral(CryptoJS.DES, dataHex, keyHex, ivHex);
    };

    var decryptGeneral = function(f, dataHex, keyHex, ivHex) {
        var data = CryptoJS.enc.Hex.parse(dataHex);
        var key = CryptoJS.enc.Hex.parse(keyHex);
        var iv = CryptoJS.enc.Hex.parse(ivHex);
        var encrypted = {};
        encrypted.key = key;
        encrypted.iv = iv;
        encrypted.ciphertext = data;
        var decrypted = f.decrypt(encrypted, key, { iv: iv });
        return CryptoJS.enc.Hex.stringify(decrypted);
    };

    // shared key decryption ------------------------------------------
    var encryptAES = function(dataHex, keyHex, ivHex) {
        return encryptGeneral(CryptoJS.AES, dataHex, keyHex, ivHex);
    };

    var encrypt3DES = function(dataHex, keyHex, ivHex) {
        return encryptGeneral(CryptoJS.TripleDES, dataHex, keyHex, ivHex);
    };

    var encryptDES = function(dataHex, keyHex, ivHex) {
        return encryptGeneral(CryptoJS.DES, dataHex, keyHex, ivHex);
    };

    var encryptGeneral = function(f, dataHex, keyHex, ivHex) {
        var data = CryptoJS.enc.Hex.parse(dataHex);
        var key = CryptoJS.enc.Hex.parse(keyHex);
        var iv = CryptoJS.enc.Hex.parse(ivHex);
        var encryptedHex = f.encrypt(data, key, { iv: iv });
        var encryptedWA = CryptoJS.enc.Hex.parse(encryptedHex.toString());
        var encryptedB64 = CryptoJS.enc.Base64.stringify(encryptedWA);
        return encryptedB64;
    };

    // other methods and properties ----------------------------------------
    var ALGLIST = {
        'AES-256-CBC':  { 'proc': decryptAES,  'eproc': encryptAES,  keylen: 32, ivlen: 16 },
        'AES-192-CBC':  { 'proc': decryptAES,  'eproc': encryptAES,  keylen: 24, ivlen: 16 },
        'AES-128-CBC':  { 'proc': decryptAES,  'eproc': encryptAES,  keylen: 16, ivlen: 16 },
        'DES-EDE3-CBC': { 'proc': decrypt3DES, 'eproc': encrypt3DES, keylen: 24, ivlen: 8 },
        'DES-CBC':      { 'proc': decryptDES,  'eproc': encryptDES,  keylen: 8,  ivlen: 8 }
    };

    var getFuncByName = function(algName) {
        return ALGLIST[algName]['proc'];
    };

    var _generateIvSaltHex = function(numBytes) {
        var wa = CryptoJS.lib.WordArray.random(numBytes);
        var hex = CryptoJS.enc.Hex.stringify(wa);
        return hex;
    };

    var _parsePKCS5PEM = function(sPKCS5PEM) {
        var info = {};
        if (sPKCS5PEM.match(new RegExp("DEK-Info: ([^,]+),([0-9A-Fa-f]+)", "m"))) {
            info.cipher = RegExp.$1;
            info.ivsalt = RegExp.$2;
        }
        if (sPKCS5PEM.match(new RegExp("-----BEGIN ([A-Z]+) PRIVATE KEY-----"))) {
            info.type = RegExp.$1;
        }
        var i1 = -1;
        var lenNEWLINE = 0;
        if (sPKCS5PEM.indexOf("\r\n\r\n") != -1) {
            i1 = sPKCS5PEM.indexOf("\r\n\r\n");
            lenNEWLINE = 2;
        }
        if (sPKCS5PEM.indexOf("\n\n") != -1) {
            i1 = sPKCS5PEM.indexOf("\n\n");
            lenNEWLINE = 1;
        }
        var i2 = sPKCS5PEM.indexOf("-----END");
        if (i1 != -1 && i2 != -1) {
            var s = sPKCS5PEM.substring(i1 + lenNEWLINE * 2, i2 - lenNEWLINE);
            s = s.replace(/\s+/g, '');
            info.data = s;
        }
        return info;
    };

    var _getKeyAndUnusedIvByPasscodeAndIvsalt = function(algName, passcode, ivsaltHex) {
        //alert("ivsaltHex(2) = " + ivsaltHex);
        var saltHex = ivsaltHex.substring(0, 16);
        //alert("salt = " + saltHex);
        
        var salt = CryptoJS.enc.Hex.parse(saltHex);
        var data = CryptoJS.enc.Utf8.parse(passcode);
        //alert("salt = " + salt);
        //alert("data = " + data);

        var nRequiredBytes = ALGLIST[algName]['keylen'] + ALGLIST[algName]['ivlen'];
        var hHexValueJoined = '';
        var hLastValue = null;
        //alert("nRequiredBytes = " + nRequiredBytes);
        for (;;) {
            var h = CryptoJS.algo.MD5.create();
            if (hLastValue != null) {
                h.update(hLastValue);
            }
            h.update(data);
            h.update(salt);
            hLastValue = h.finalize();
            hHexValueJoined = hHexValueJoined + CryptoJS.enc.Hex.stringify(hLastValue);
            //alert("joined = " + hHexValueJoined);
            if (hHexValueJoined.length >= nRequiredBytes * 2) {
                break;
            }
        }
        var result = {};
        result.keyhex = hHexValueJoined.substr(0, ALGLIST[algName]['keylen'] * 2);
        result.ivhex = hHexValueJoined.substr(ALGLIST[algName]['keylen'] * 2, ALGLIST[algName]['ivlen'] * 2);
        return result;
    };

    /**
     * @param {String} privateKeyB64 base64 string of encrypted private key
     * @param {String} sharedKeyAlgName algorithm name of shared key encryption
     * @param {String} sharedKeyHex hexadecimal string of shared key to encrypt
     * @param {String} ivsaltHex hexadecimal string of IV and salt
     * @param {String} hexadecimal string of decrypted private key
     */
    var _decryptKeyB64 = function(privateKeyB64, sharedKeyAlgName, sharedKeyHex, ivsaltHex) {
        var privateKeyWA = CryptoJS.enc.Base64.parse(privateKeyB64);
        var privateKeyHex = CryptoJS.enc.Hex.stringify(privateKeyWA);
        var f = ALGLIST[sharedKeyAlgName]['proc'];
        var decryptedKeyHex = f(privateKeyHex, sharedKeyHex, ivsaltHex);
        return decryptedKeyHex;
    };
    
    /**
     * @param {String} privateKeyHex hexadecimal string of private key
     * @param {String} sharedKeyAlgName algorithm name of shared key encryption
     * @param {String} sharedKeyHex hexadecimal string of shared key to encrypt
     * @param {String} ivsaltHex hexadecimal string of IV and salt
     * @param {String} base64 string of encrypted private key
     */
    var _encryptKeyHex = function(privateKeyHex, sharedKeyAlgName, sharedKeyHex, ivsaltHex) {
        var f = ALGLIST[sharedKeyAlgName]['eproc'];
        var encryptedKeyB64 = f(privateKeyHex, sharedKeyHex, ivsaltHex);
        return encryptedKeyB64;
    };

    // *****************************************************************
    // *** PUBLIC PROPERTIES AND METHODS *******************************
    // *****************************************************************
    return {
        // -- UTILITY METHODS ------------------------------------------------------------
        /**
         * decrypt private key by shared key
         * @name version
         * @memberOf KEYUTIL
         * @property {String} version
         * @description version string of KEYUTIL class
         */
        version: "1.0.0",

        /**
         * get hexacedimal string of PEM format
         * @name getHexFromPEM
         * @memberOf KEYUTIL
         * @function
         * @param {String} sPEM PEM formatted string
         * @param {String} sHead PEM header string without BEGIN/END
         * @return {String} hexadecimal string data of PEM contents
         * @since pkcs5pkey 1.0.5
         */
        getHexFromPEM: function(sPEM, sHead) {
            var s = sPEM;
            if (s.indexOf("-----BEGIN ") == -1) {
                throw "can't find PEM header: " + sHead;
            }
            if (typeof sHead == "string" && sHead != "") {
                s = s.replace("-----BEGIN " + sHead + "-----", "");
                s = s.replace("-----END " + sHead + "-----", "");
            } else {
                s = s.replace(/-----BEGIN [^-]+-----/, '');
                s = s.replace(/-----END [^-]+-----/, '');
            }
            var sB64 = s.replace(/\s+/g, '');
            var dataHex = b64tohex(sB64);
            return dataHex;
        },

        /**
         * decrypt private key by shared key
         * @name getDecryptedKeyHexByKeyIV
         * @memberOf KEYUTIL
         * @function
         * @param {String} encryptedKeyHex hexadecimal string of encrypted private key
         * @param {String} algName name of symmetric key algorithm (ex. 'DES-EBE3-CBC')
         * @param {String} sharedKeyHex hexadecimal string of symmetric key
         * @param {String} ivHex hexadecimal string of initial vector(IV).
         * @return {String} hexadecimal string of decrypted privated key
         */
        getDecryptedKeyHexByKeyIV: function(encryptedKeyHex, algName, sharedKeyHex, ivHex) {
            var f1 = getFuncByName(algName);
            return f1(encryptedKeyHex, sharedKeyHex, ivHex);
        },

        /**
         * parse PEM formatted passcode protected PKCS#5 private key
         * @name parsePKCS5PEM
         * @memberOf KEYUTIL
         * @function
         * @param {String} sEncryptedPEM PEM formatted protected passcode protected PKCS#5 private key
         * @return {Hash} hash of key information
         * @description
         * Resulted hash has following attributes.
         * <ul>
         * <li>cipher - symmetric key algorithm name (ex. 'DES-EBE3-CBC', 'AES-256-CBC')</li>
         * <li>ivsalt - IV used for decrypt. Its heading 8 bytes will be used for passcode salt.</li>
         * <li>type - asymmetric key algorithm name of private key described in PEM header.</li>
         * <li>data - base64 encoded encrypted private key.</li>
         * </ul>
         *
         */
        parsePKCS5PEM: function(sPKCS5PEM) {
            return _parsePKCS5PEM(sPKCS5PEM);
        },

        /**
         * the same function as OpenSSL EVP_BytsToKey to generate shared key and IV
         * @name getKeyAndUnusedIvByPasscodeAndIvsalt
         * @memberOf KEYUTIL
         * @function
         * @param {String} algName name of symmetric key algorithm (ex. 'DES-EBE3-CBC')
         * @param {String} passcode passcode to decrypt private key (ex. 'password')
         * @param {String} hexadecimal string of IV. heading 8 bytes will be used for passcode salt
         * @return {Hash} hash of key and unused IV (ex. {keyhex:2fe3..., ivhex:3fad..})
         */
        getKeyAndUnusedIvByPasscodeAndIvsalt: function(algName, passcode, ivsaltHex) {
            return _getKeyAndUnusedIvByPasscodeAndIvsalt(algName, passcode, ivsaltHex);
        },

        decryptKeyB64: function(privateKeyB64, sharedKeyAlgName, sharedKeyHex, ivsaltHex) {
            return _decryptKeyB64(privateKeyB64, sharedKeyAlgName, sharedKeyHex, ivsaltHex);
        },

        /**
         * decrypt PEM formatted protected PKCS#5 private key with passcode
         * @name getDecryptedKeyHex
         * @memberOf KEYUTIL
         * @function
         * @param {String} sEncryptedPEM PEM formatted protected passcode protected PKCS#5 private key
         * @param {String} passcode passcode to decrypt private key (ex. 'password')
         * @return {String} hexadecimal string of decrypted RSA priavte key
         */
        getDecryptedKeyHex: function(sEncryptedPEM, passcode) {
            // 1. parse pem
            var info = _parsePKCS5PEM(sEncryptedPEM);
            var publicKeyAlgName = info.type;
            var sharedKeyAlgName = info.cipher;
            var ivsaltHex = info.ivsalt;
            var privateKeyB64 = info.data;
            //alert("ivsaltHex = " + ivsaltHex);

            // 2. generate shared key
            var sharedKeyInfo = _getKeyAndUnusedIvByPasscodeAndIvsalt(sharedKeyAlgName, passcode, ivsaltHex);
            var sharedKeyHex = sharedKeyInfo.keyhex;
            //alert("sharedKeyHex = " + sharedKeyHex);

            // 3. decrypt private key
            var decryptedKey = _decryptKeyB64(privateKeyB64, sharedKeyAlgName, sharedKeyHex, ivsaltHex);
            return decryptedKey;
        },

        /**
         * (DEPRECATED) read PEM formatted encrypted PKCS#5 private key and returns RSAKey object
         * @name getRSAKeyFromEncryptedPKCS5PEM
         * @memberOf KEYUTIL
         * @function
         * @param {String} sEncryptedP5PEM PEM formatted encrypted PKCS#5 private key
         * @param {String} passcode passcode to decrypt private key
         * @return {RSAKey} loaded RSAKey object of RSA private key
         * @since pkcs5pkey 1.0.2
         * @deprecated From jsrsasign 4.2.1 please use {@link KEYUTIL.getKey#}.
         */
        getRSAKeyFromEncryptedPKCS5PEM: function(sEncryptedP5PEM, passcode) {
            var hPKey = this.getDecryptedKeyHex(sEncryptedP5PEM, passcode);
            var rsaKey = new RSAKey();
            rsaKey.readPrivateKeyFromASN1HexString(hPKey);
            return rsaKey;
        },

        /**
         * get PEM formatted encrypted PKCS#5 private key from hexadecimal string of plain private key
         * @name getEncryptedPKCS5PEMFromPrvKeyHex
         * @memberOf KEYUTIL
         * @function
         * @param {String} pemHeadAlg algorithm name in the pem header (i.e. RSA,EC or DSA)
         * @param {String} hPrvKey hexadecimal string of plain private key
         * @param {String} passcode pass code to protect private key (ex. password)
         * @param {String} sharedKeyAlgName algorithm name to protect private key (ex. AES-256-CBC)
         * @param {String} ivsaltHex hexadecimal string of IV and salt
         * @return {String} string of PEM formatted encrypted PKCS#5 private key
         * @since pkcs5pkey 1.0.2
         * @description
         * <br/>
         * generate PEM formatted encrypted PKCS#5 private key by hexadecimal string encoded
         * ASN.1 object of plain RSA private key.
         * Following arguments can be omitted.
         * <ul>
         * <li>alg - AES-256-CBC will be used if omitted.</li>
         * <li>ivsaltHex - automatically generate IV and salt which length depends on algorithm</li>
         * </ul>
         * NOTE1: DES-CBC, DES-EDE3-CBC, AES-{128,192.256}-CBC algorithm are supported.
         * @example
         * var pem = 
         *   KEYUTIL.getEncryptedPKCS5PEMFromPrvKeyHex(plainKeyHex, "password");
         * var pem2 = 
         *   KEYUTIL.getEncryptedPKCS5PEMFromPrvKeyHex(plainKeyHex, "password", "AES-128-CBC");
         * var pem3 = 
         *   KEYUTIL.getEncryptedPKCS5PEMFromPrvKeyHex(plainKeyHex, "password", "AES-128-CBC", "1f3d02...");
         */
        getEncryptedPKCS5PEMFromPrvKeyHex: function(pemHeadAlg, hPrvKey, passcode, sharedKeyAlgName, ivsaltHex) {
            var sPEM = "";

            // 1. set sharedKeyAlgName if undefined (default AES-256-CBC)
            if (typeof sharedKeyAlgName == "undefined" || sharedKeyAlgName == null) {
                sharedKeyAlgName = "AES-256-CBC";
            }
            if (typeof ALGLIST[sharedKeyAlgName] == "undefined")
                throw "KEYUTIL unsupported algorithm: " + sharedKeyAlgName;

            // 2. set ivsaltHex if undefined
            if (typeof ivsaltHex == "undefined" || ivsaltHex == null) {
                var ivlen = ALGLIST[sharedKeyAlgName]['ivlen'];
                var randIV = _generateIvSaltHex(ivlen);
                ivsaltHex = randIV.toUpperCase();
            }

            // 3. get shared key
            //alert("ivsalthex=" + ivsaltHex);
            var sharedKeyInfo = _getKeyAndUnusedIvByPasscodeAndIvsalt(sharedKeyAlgName, passcode, ivsaltHex);
            var sharedKeyHex = sharedKeyInfo.keyhex;
            // alert("sharedKeyHex = " + sharedKeyHex);

            // 3. get encrypted Key in Base64
            var encryptedKeyB64 = _encryptKeyHex(hPrvKey, sharedKeyAlgName, sharedKeyHex, ivsaltHex);

            var pemBody = encryptedKeyB64.replace(/(.{64})/g, "$1\r\n");
            var sPEM = "-----BEGIN " + pemHeadAlg + " PRIVATE KEY-----\r\n";
            sPEM += "Proc-Type: 4,ENCRYPTED\r\n";
            sPEM += "DEK-Info: " + sharedKeyAlgName + "," + ivsaltHex + "\r\n";
            sPEM += "\r\n";
            sPEM += pemBody;
            sPEM += "\r\n-----END " + pemHeadAlg + " PRIVATE KEY-----\r\n";

            return sPEM;
        },

        /**
         * (DEPRECATED) get PEM formatted encrypted PKCS#5 private key from RSAKey object of private key
         * @name getEncryptedPKCS5PEMFromRSAKey
         * @memberOf KEYUTIL
         * @function
         * @param {RSAKey} pKey RSAKey object of private key
         * @param {String} passcode pass code to protect private key (ex. password)
         * @param {String} alg algorithm name to protect private key (default AES-256-CBC)
         * @param {String} ivsaltHex hexadecimal string of IV and salt (default generated random IV)
         * @return {String} string of PEM formatted encrypted PKCS#5 private key
         * @since pkcs5pkey 1.0.2
         * @deprecated From jsrsasign 4.2.1 please use {@link KEYUTIL.getPEM#}.
         * @description
         * <br/>
         * generate PEM formatted encrypted PKCS#5 private key by
         * {@link RSAKey} object of RSA private key and passcode.
         * Following argument can be omitted.
         * <ul>
         * <li>alg - AES-256-CBC will be used if omitted.</li>
         * <li>ivsaltHex - automatically generate IV and salt which length depends on algorithm</li>
         * </ul>
         * @example
         * var pkey = new RSAKey();
         * pkey.generate(1024, '10001'); // generate 1024bit RSA private key with public exponent 'x010001'
         * var pem = KEYUTIL.getEncryptedPKCS5PEMFromRSAKey(pkey, "password");
         */
        getEncryptedPKCS5PEMFromRSAKey: function(pKey, passcode, alg, ivsaltHex) {
            var version = new KJUR.asn1.DERInteger({'int': 0});
            var n = new KJUR.asn1.DERInteger({'bigint': pKey.n});
            var e = new KJUR.asn1.DERInteger({'int': pKey.e});
            var d = new KJUR.asn1.DERInteger({'bigint': pKey.d});
            var p = new KJUR.asn1.DERInteger({'bigint': pKey.p});
            var q = new KJUR.asn1.DERInteger({'bigint': pKey.q});
            var dmp1 = new KJUR.asn1.DERInteger({'bigint': pKey.dmp1});
            var dmq1 = new KJUR.asn1.DERInteger({'bigint': pKey.dmq1});
            var coeff = new KJUR.asn1.DERInteger({'bigint': pKey.coeff});
            var seq = new KJUR.asn1.DERSequence({'array': [version, n, e, d, p, q, dmp1, dmq1, coeff]});
            var hex = seq.getEncodedHex();
            return this.getEncryptedPKCS5PEMFromPrvKeyHex("RSA", hex, passcode, alg, ivsaltHex);
        },

        /**
         * generate RSAKey and PEM formatted encrypted PKCS#5 private key
         * @name newEncryptedPKCS5PEM
         * @memberOf KEYUTIL
         * @function
         * @param {String} passcode pass code to protect private key (ex. password)
         * @param {Integer} keyLen key bit length of RSA key to be generated. (default 1024)
         * @param {String} hPublicExponent hexadecimal string of public exponent (default 10001)
         * @param {String} alg shared key algorithm to encrypt private key (default AES-258-CBC)
         * @return {String} string of PEM formatted encrypted PKCS#5 private key
         * @since pkcs5pkey 1.0.2
         * @example
         * var pem1 = KEYUTIL.newEncryptedPKCS5PEM("password");           // RSA1024bit/10001/AES-256-CBC
         * var pem2 = KEYUTIL.newEncryptedPKCS5PEM("password", 512);      // RSA 512bit/10001/AES-256-CBC
         * var pem3 = KEYUTIL.newEncryptedPKCS5PEM("password", 512, '3'); // RSA 512bit/    3/AES-256-CBC
         */
        newEncryptedPKCS5PEM: function(passcode, keyLen, hPublicExponent, alg) {
            if (typeof keyLen == "undefined" || keyLen == null) {
                keyLen = 1024;
            }
            if (typeof hPublicExponent == "undefined" || hPublicExponent == null) {
                hPublicExponent = '10001';
            }
            var pKey = new RSAKey();
            pKey.generate(keyLen, hPublicExponent);
            var pem = null;
            if (typeof alg == "undefined" || alg == null) {
                pem = this.getEncryptedPKCS5PEMFromRSAKey(pKey, passcode);
            } else {
                pem = this.getEncryptedPKCS5PEMFromRSAKey(pKey, passcode, alg);
            }
            return pem;
        },

        // === PKCS8 ===============================================================

        /**
         * (DEPRECATED) read PEM formatted unencrypted PKCS#8 private key and returns RSAKey object
         * @name getRSAKeyFromPlainPKCS8PEM
         * @memberOf KEYUTIL
         * @function
         * @param {String} pkcs8PEM PEM formatted unencrypted PKCS#8 private key
         * @return {RSAKey} loaded RSAKey object of RSA private key
         * @since pkcs5pkey 1.0.1
         * @deprecated From jsrsasign 4.2.1 please use {@link KEYUTIL.getKey#}.
         */
        getRSAKeyFromPlainPKCS8PEM: function(pkcs8PEM) {
            if (pkcs8PEM.match(/ENCRYPTED/))
                throw "pem shall be not ENCRYPTED";
            var prvKeyHex = this.getHexFromPEM(pkcs8PEM, "PRIVATE KEY");
            var rsaKey = this.getRSAKeyFromPlainPKCS8Hex(prvKeyHex);
            return rsaKey;
        },

        /**
         * (DEPRECATED) provide hexadecimal string of unencrypted PKCS#8 private key and returns RSAKey object
         * @name getRSAKeyFromPlainPKCS8Hex
         * @memberOf KEYUTIL
         * @function
         * @param {String} prvKeyHex hexadecimal string of unencrypted PKCS#8 private key
         * @return {RSAKey} loaded RSAKey object of RSA private key
         * @since pkcs5pkey 1.0.3
         * @deprecated From jsrsasign 4.2.1 please use {@link KEYUTIL.getKey#}.
         */
        getRSAKeyFromPlainPKCS8Hex: function(prvKeyHex) {
            var a1 = ASN1HEX.getPosArrayOfChildren_AtObj(prvKeyHex, 0);
            if (a1.length != 3)
                throw "outer DERSequence shall have 3 elements: " + a1.length;
            var algIdTLV =ASN1HEX.getHexOfTLV_AtObj(prvKeyHex, a1[1]);
            if (algIdTLV != "300d06092a864886f70d0101010500") // AlgId rsaEncryption
                throw "PKCS8 AlgorithmIdentifier is not rsaEnc: " + algIdTLV;
            var algIdTLV = ASN1HEX.getHexOfTLV_AtObj(prvKeyHex, a1[1]);
            var octetStr = ASN1HEX.getHexOfTLV_AtObj(prvKeyHex, a1[2]);
            var p5KeyHex = ASN1HEX.getHexOfV_AtObj(octetStr, 0);
            //alert(p5KeyHex);
            var rsaKey = new RSAKey();
            rsaKey.readPrivateKeyFromASN1HexString(p5KeyHex);
            return rsaKey;
        },

        /**
         * generate PBKDF2 key hexstring with specified passcode and information
         * @name parseHexOfEncryptedPKCS8
         * @memberOf KEYUTIL
         * @function
         * @param {String} passcode passcode to decrypto private key
         * @return {Array} info associative array of PKCS#8 parameters
         * @since pkcs5pkey 1.0.3
         * @description
         * The associative array which is returned by this method has following properties:
         * <ul>
         * <li>info.pbkdf2Salt - hexadecimal string of PBKDF2 salt</li>
         * <li>info.pkbdf2Iter - iteration count</li>
         * <li>info.ciphertext - hexadecimal string of encrypted private key</li>
         * <li>info.encryptionSchemeAlg - encryption algorithm name (currently TripleDES only)</li>
         * <li>info.encryptionSchemeIV - initial vector for encryption algorithm</li>
         * </ul>
         * Currently, this method only supports PKCS#5v2.0 with PBES2/PBDKF2 of HmacSHA1 and TripleDES.
         * <ul>
         * <li>keyDerivationFunc = pkcs5PBKDF2 with HmacSHA1</li>
         * <li>encryptionScheme = des-EDE3-CBC(i.e. TripleDES</li>
         * </ul>
         * @example
         * // to convert plain PKCS#5 private key to encrypted PKCS#8 private
         * // key with PBKDF2 with TripleDES
         * % openssl pkcs8 -in plain_p5.pem -topk8 -v2 -des3 -out encrypted_p8.pem
         */
        parseHexOfEncryptedPKCS8: function(sHEX) {
            var info = {};
            
            var a0 = ASN1HEX.getPosArrayOfChildren_AtObj(sHEX, 0);
            if (a0.length != 2)
                throw "malformed format: SEQUENCE(0).items != 2: " + a0.length;

            // 1. ciphertext
            info.ciphertext = ASN1HEX.getHexOfV_AtObj(sHEX, a0[1]);

            // 2. pkcs5PBES2
            var a0_0 = ASN1HEX.getPosArrayOfChildren_AtObj(sHEX, a0[0]); 
            if (a0_0.length != 2)
                throw "malformed format: SEQUENCE(0.0).items != 2: " + a0_0.length;

            // 2.1 check if pkcs5PBES2(1 2 840 113549 1 5 13)
            if (ASN1HEX.getHexOfV_AtObj(sHEX, a0_0[0]) != "2a864886f70d01050d")
                throw "this only supports pkcs5PBES2";

            // 2.2 pkcs5PBES2 param
            var a0_0_1 = ASN1HEX.getPosArrayOfChildren_AtObj(sHEX, a0_0[1]); 
            if (a0_0.length != 2)
                throw "malformed format: SEQUENCE(0.0.1).items != 2: " + a0_0_1.length;

            // 2.2.1 encryptionScheme
            var a0_0_1_1 = ASN1HEX.getPosArrayOfChildren_AtObj(sHEX, a0_0_1[1]); 
            if (a0_0_1_1.length != 2)
                throw "malformed format: SEQUENCE(0.0.1.1).items != 2: " + a0_0_1_1.length;
            if (ASN1HEX.getHexOfV_AtObj(sHEX, a0_0_1_1[0]) != "2a864886f70d0307")
                throw "this only supports TripleDES";
            info.encryptionSchemeAlg = "TripleDES";

            // 2.2.1.1 IV of encryptionScheme
            info.encryptionSchemeIV = ASN1HEX.getHexOfV_AtObj(sHEX, a0_0_1_1[1]);

            // 2.2.2 keyDerivationFunc
            var a0_0_1_0 = ASN1HEX.getPosArrayOfChildren_AtObj(sHEX, a0_0_1[0]); 
            if (a0_0_1_0.length != 2)
                throw "malformed format: SEQUENCE(0.0.1.0).items != 2: " + a0_0_1_0.length;
            if (ASN1HEX.getHexOfV_AtObj(sHEX, a0_0_1_0[0]) != "2a864886f70d01050c")
                throw "this only supports pkcs5PBKDF2";

            // 2.2.2.1 pkcs5PBKDF2 param
            var a0_0_1_0_1 = ASN1HEX.getPosArrayOfChildren_AtObj(sHEX, a0_0_1_0[1]); 
            if (a0_0_1_0_1.length < 2)
                throw "malformed format: SEQUENCE(0.0.1.0.1).items < 2: " + a0_0_1_0_1.length;

            // 2.2.2.1.1 PBKDF2 salt
            info.pbkdf2Salt = ASN1HEX.getHexOfV_AtObj(sHEX, a0_0_1_0_1[0]);

            // 2.2.2.1.2 PBKDF2 iter
            var iterNumHex = ASN1HEX.getHexOfV_AtObj(sHEX, a0_0_1_0_1[1]);
            try {
                info.pbkdf2Iter = parseInt(iterNumHex, 16);
            } catch(ex) {
                throw "malformed format pbkdf2Iter: " + iterNumHex;
            }

            return info;
        },

        /**
         * generate PBKDF2 key hexstring with specified passcode and information
         * @name getPBKDF2KeyHexFromParam
         * @memberOf KEYUTIL
         * @function
         * @param {Array} info result of {@link parseHexOfEncryptedPKCS8} which has preference of PKCS#8 file
         * @param {String} passcode passcode to decrypto private key
         * @return {String} hexadecimal string of PBKDF2 key
         * @since pkcs5pkey 1.0.3
         * @description
         * As for info, this uses following properties:
         * <ul>
         * <li>info.pbkdf2Salt - hexadecimal string of PBKDF2 salt</li>
         * <li>info.pkbdf2Iter - iteration count</li>
         * </ul>
         * Currently, this method only supports PKCS#5v2.0 with PBES2/PBDKF2 of HmacSHA1 and TripleDES.
         * <ul>
         * <li>keyDerivationFunc = pkcs5PBKDF2 with HmacSHA1</li>
         * <li>encryptionScheme = des-EDE3-CBC(i.e. TripleDES</li>
         * </ul>
         * @example
         * // to convert plain PKCS#5 private key to encrypted PKCS#8 private
         * // key with PBKDF2 with TripleDES
         * % openssl pkcs8 -in plain_p5.pem -topk8 -v2 -des3 -out encrypted_p8.pem
         */
        getPBKDF2KeyHexFromParam: function(info, passcode) {
            var pbkdf2SaltWS = CryptoJS.enc.Hex.parse(info.pbkdf2Salt);
            var pbkdf2Iter = info.pbkdf2Iter;
            var pbkdf2KeyWS = CryptoJS.PBKDF2(passcode, 
                                              pbkdf2SaltWS, 
                                              { keySize: 192/32, iterations: pbkdf2Iter });
            var pbkdf2KeyHex = CryptoJS.enc.Hex.stringify(pbkdf2KeyWS);
            return pbkdf2KeyHex;
        },

        /**
         * read PEM formatted encrypted PKCS#8 private key and returns hexadecimal string of plain PKCS#8 private key
         * @name getPlainPKCS8HexFromEncryptedPKCS8PEM
         * @memberOf KEYUTIL
         * @function
         * @param {String} pkcs8PEM PEM formatted encrypted PKCS#8 private key
         * @param {String} passcode passcode to decrypto private key
         * @return {String} hexadecimal string of plain PKCS#8 private key
         * @since pkcs5pkey 1.0.3
         * @description
         * Currently, this method only supports PKCS#5v2.0 with PBES2/PBDKF2 of HmacSHA1 and TripleDES.
         * <ul>
         * <li>keyDerivationFunc = pkcs5PBKDF2 with HmacSHA1</li>
         * <li>encryptionScheme = des-EDE3-CBC(i.e. TripleDES</li>
         * </ul>
         * @example
         * // to convert plain PKCS#5 private key to encrypted PKCS#8 private
         * // key with PBKDF2 with TripleDES
         * % openssl pkcs8 -in plain_p5.pem -topk8 -v2 -des3 -out encrypted_p8.pem
         */
        getPlainPKCS8HexFromEncryptedPKCS8PEM: function(pkcs8PEM, passcode) {
            // 1. derHex - PKCS#8 private key encrypted by PBKDF2
            var derHex = this.getHexFromPEM(pkcs8PEM, "ENCRYPTED PRIVATE KEY");
            // 2. info - PKCS#5 PBES info
            var info = this.parseHexOfEncryptedPKCS8(derHex);
            // 3. hKey - PBKDF2 key
            var pbkdf2KeyHex = KEYUTIL.getPBKDF2KeyHexFromParam(info, passcode);
            // 4. decrypt ciphertext by PBKDF2 key
            var encrypted = {};
            encrypted.ciphertext = CryptoJS.enc.Hex.parse(info.ciphertext);
            var pbkdf2KeyWS = CryptoJS.enc.Hex.parse(pbkdf2KeyHex);
            var des3IVWS = CryptoJS.enc.Hex.parse(info.encryptionSchemeIV);
            var decWS = CryptoJS.TripleDES.decrypt(encrypted, pbkdf2KeyWS, { iv: des3IVWS });
            var decHex = CryptoJS.enc.Hex.stringify(decWS);
            return decHex;
        },

        /**
         * (DEPRECATED) read PEM formatted encrypted PKCS#8 private key and returns RSAKey object
         * @name getRSAKeyFromEncryptedPKCS8PEM
         * @memberOf KEYUTIL
         * @function
         * @param {String} pkcs8PEM PEM formatted encrypted PKCS#8 private key
         * @param {String} passcode passcode to decrypto private key
         * @return {RSAKey} loaded RSAKey object of RSA private key
         * @since pkcs5pkey 1.0.3
         * @deprecated From jsrsasign 4.2.1 please use {@link KEYUTIL.getKey#}.
         * @description
         * Currently, this method only supports PKCS#5v2.0 with PBES2/PBDKF2 of HmacSHA1 and TripleDES.
         * <ul>
         * <li>keyDerivationFunc = pkcs5PBKDF2 with HmacSHA1</li>
         * <li>encryptionScheme = des-EDE3-CBC(i.e. TripleDES</li>
         * </ul>
         * @example
         * // to convert plain PKCS#5 private key to encrypted PKCS#8 private
         * // key with PBKDF2 with TripleDES
         * % openssl pkcs8 -in plain_p5.pem -topk8 -v2 -des3 -out encrypted_p8.pem
         */
        getRSAKeyFromEncryptedPKCS8PEM: function(pkcs8PEM, passcode) {
            var prvKeyHex = this.getPlainPKCS8HexFromEncryptedPKCS8PEM(pkcs8PEM, passcode);
            var rsaKey = this.getRSAKeyFromPlainPKCS8Hex(prvKeyHex);
            return rsaKey;
        },

        /**
         * get RSAKey/ECDSA private key object from encrypted PEM PKCS#8 private key
         * @name getKeyFromEncryptedPKCS8PEM
         * @memberOf KEYUTIL
         * @function
         * @param {String} pkcs8PEM string of PEM formatted PKCS#8 private key
         * @param {String} passcode passcode string to decrypt key
         * @return {Object} RSAKey or KJUR.crypto.ECDSA private key object
         * @since pkcs5pkey 1.0.5
         */
        getKeyFromEncryptedPKCS8PEM: function(pkcs8PEM, passcode) {
            var prvKeyHex = this.getPlainPKCS8HexFromEncryptedPKCS8PEM(pkcs8PEM, passcode);
            var key = this.getKeyFromPlainPrivatePKCS8Hex(prvKeyHex);
            return key;
        },

        /**
         * parse hexadecimal string of plain PKCS#8 private key
         * @name parsePlainPrivatePKCS8Hex
         * @memberOf KEYUTIL
         * @function
         * @param {String} pkcs8PrvHex hexadecimal string of PKCS#8 plain private key
         * @return {Array} associative array of parsed key
         * @since pkcs5pkey 1.0.5
         * @description
         * Resulted associative array has following properties:
         * <ul>
         * <li>algoid - hexadecimal string of OID of asymmetric key algorithm</li>
         * <li>algparam - hexadecimal string of OID of ECC curve name or null</li>
         * <li>keyidx - string starting index of key in pkcs8PrvHex</li>
         * </ul>
         */
        parsePlainPrivatePKCS8Hex: function(pkcs8PrvHex) {
            var result = {};
            result.algparam = null;

            // 1. sequence
            if (pkcs8PrvHex.substr(0, 2) != "30")
                throw "malformed plain PKCS8 private key(code:001)"; // not sequence

            var a1 = ASN1HEX.getPosArrayOfChildren_AtObj(pkcs8PrvHex, 0);
            if (a1.length != 3)
                throw "malformed plain PKCS8 private key(code:002)";

            // 2. AlgID
            if (pkcs8PrvHex.substr(a1[1], 2) != "30")
                throw "malformed PKCS8 private key(code:003)"; // AlgId not sequence

            var a2 = ASN1HEX.getPosArrayOfChildren_AtObj(pkcs8PrvHex, a1[1]);
            if (a2.length != 2)
                throw "malformed PKCS8 private key(code:004)"; // AlgId not have two elements

            // 2.1. AlgID OID
            if (pkcs8PrvHex.substr(a2[0], 2) != "06")
                throw "malformed PKCS8 private key(code:005)"; // AlgId.oid is not OID

            result.algoid = ASN1HEX.getHexOfV_AtObj(pkcs8PrvHex, a2[0]);

            // 2.2. AlgID param
            if (pkcs8PrvHex.substr(a2[1], 2) == "06") {
                result.algparam = ASN1HEX.getHexOfV_AtObj(pkcs8PrvHex, a2[1]);
            }

            // 3. Key index
            if (pkcs8PrvHex.substr(a1[2], 2) != "04")
                throw "malformed PKCS8 private key(code:006)"; // not octet string

            result.keyidx = ASN1HEX.getStartPosOfV_AtObj(pkcs8PrvHex, a1[2]);

            return result;
        },

        /**
         * get RSAKey/ECDSA private key object from PEM plain PEM PKCS#8 private key
         * @name getKeyFromPlainPrivatePKCS8PEM
         * @memberOf KEYUTIL
         * @function
         * @param {String} pkcs8PEM string of plain PEM formatted PKCS#8 private key
         * @return {Object} RSAKey or KJUR.crypto.ECDSA private key object
         * @since pkcs5pkey 1.0.5
         */
        getKeyFromPlainPrivatePKCS8PEM: function(prvKeyPEM) {
            var prvKeyHex = this.getHexFromPEM(prvKeyPEM, "PRIVATE KEY");
            var key = this.getKeyFromPlainPrivatePKCS8Hex(prvKeyHex);
            return key;
        },

        /**
         * get RSAKey/ECDSA private key object from HEX plain PEM PKCS#8 private key
         * @name getKeyFromPlainPrivatePKCS8Hex
         * @memberOf KEYUTIL
         * @function
         * @param {String} prvKeyHex hexadecimal string of plain PKCS#8 private key
         * @return {Object} RSAKey or KJUR.crypto.ECDSA private key object
         * @since pkcs5pkey 1.0.5
         */
        getKeyFromPlainPrivatePKCS8Hex: function(prvKeyHex) {
            var p8 = this.parsePlainPrivatePKCS8Hex(prvKeyHex);
            
            if (p8.algoid == "2a864886f70d010101") { // RSA
                this.parsePrivateRawRSAKeyHexAtObj(prvKeyHex, p8);
                var k = p8.key;
                var key = new RSAKey();
                key.setPrivateEx(k.n, k.e, k.d, k.p, k.q, k.dp, k.dq, k.co);
                return key;
            } else if (p8.algoid == "2a8648ce3d0201") { // ECC
                this.parsePrivateRawECKeyHexAtObj(prvKeyHex, p8);
                if (KJUR.crypto.OID.oidhex2name[p8.algparam] === undefined)
                    throw "KJUR.crypto.OID.oidhex2name undefined: " + p8.algparam;
                var curveName = KJUR.crypto.OID.oidhex2name[p8.algparam];
                var key = new KJUR.crypto.ECDSA({'curve': curveName});
                key.setPublicKeyHex(p8.pubkey);
                key.setPrivateKeyHex(p8.key);
                key.isPublic = false;
                return key;
            } else if (p8.algoid == "2a8648ce380401") { // DSA
                var hP = ASN1HEX.getVbyList(prvKeyHex, 0, [1,1,0], "02");
                var hQ = ASN1HEX.getVbyList(prvKeyHex, 0, [1,1,1], "02");
                var hG = ASN1HEX.getVbyList(prvKeyHex, 0, [1,1,2], "02");
                var hX = ASN1HEX.getVbyList(prvKeyHex, 0, [2,0], "02");
                var biP = new BigInteger(hP, 16);
                var biQ = new BigInteger(hQ, 16);
                var biG = new BigInteger(hG, 16);
                var biX = new BigInteger(hX, 16);
                var key = new KJUR.crypto.DSA();
                key.setPrivate(biP, biQ, biG, null, biX);
                return key;
            } else {
                throw "unsupported private key algorithm";
            }
        },

        // === PKCS8 RSA Public Key ================================================
        /**
         * (DEPRECATED) read PEM formatted PKCS#8 public key and returns RSAKey object
         * @name getRSAKeyFromPublicPKCS8PEM
         * @memberOf KEYUTIL
         * @function
         * @param {String} pkcs8PubPEM PEM formatted PKCS#8 public key
         * @return {RSAKey} loaded RSAKey object of RSA public key
         * @since pkcs5pkey 1.0.4
         * @deprecated From jsrsasign 4.2.1 please use {@link KEYUTIL.getKey#}.
         */
        getRSAKeyFromPublicPKCS8PEM: function(pkcs8PubPEM) {
            var pubKeyHex = this.getHexFromPEM(pkcs8PubPEM, "PUBLIC KEY");
            var rsaKey = this.getRSAKeyFromPublicPKCS8Hex(pubKeyHex);
            return rsaKey;
        },

        /**
         * (DEPRECATED) get RSAKey/ECDSA public key object from PEM PKCS#8 public key
         * @name getKeyFromPublicPKCS8PEM
         * @memberOf KEYUTIL
         * @function
         * @param {String} pkcsPub8PEM string of PEM formatted PKCS#8 public key
         * @return {Object} RSAKey or KJUR.crypto.ECDSA private key object
         * @since pkcs5pkey 1.0.5
         * @deprecated From jsrsasign 4.2.1 please use {@link KEYUTIL.getKey#}.
         */
        getKeyFromPublicPKCS8PEM: function(pkcs8PubPEM) {
            var pubKeyHex = this.getHexFromPEM(pkcs8PubPEM, "PUBLIC KEY");
            var key = this.getKeyFromPublicPKCS8Hex(pubKeyHex);
            return key;
        },

        /**
         * (DEPRECATED) get RSAKey/DSA/ECDSA public key object from hexadecimal string of PKCS#8 public key
         * @name getKeyFromPublicPKCS8Hex
         * @memberOf KEYUTIL
         * @function
         * @param {String} pkcsPub8Hex hexadecimal string of PKCS#8 public key
         * @return {Object} RSAKey or KJUR.crypto.{ECDSA,DSA} private key object
         * @since pkcs5pkey 1.0.5
         * @deprecated From jsrsasign 4.2.1 please use {@link KEYUTIL.getKey#}.
         */
        getKeyFromPublicPKCS8Hex: function(pkcs8PubHex) {
            var p8 = this.parsePublicPKCS8Hex(pkcs8PubHex);
            
            if (p8.algoid == "2a864886f70d010101") { // RSA
                var aRSA = this.parsePublicRawRSAKeyHex(p8.key);
                var key = new RSAKey();
                key.setPublic(aRSA.n, aRSA.e);
                return key;
            } else if (p8.algoid == "2a8648ce3d0201") { // ECC
                if (KJUR.crypto.OID.oidhex2name[p8.algparam] === undefined)
                    throw "KJUR.crypto.OID.oidhex2name undefined: " + p8.algparam;
                var curveName = KJUR.crypto.OID.oidhex2name[p8.algparam];
                var key = new KJUR.crypto.ECDSA({'curve': curveName, 'pub': p8.key});
                return key;
            } else if (p8.algoid == "2a8648ce380401") { // DSA 1.2.840.10040.4.1
                var param = p8.algparam;
                var y = ASN1HEX.getHexOfV_AtObj(p8.key, 0);
                var key = new KJUR.crypto.DSA();
                key.setPublic(new BigInteger(param.p, 16),
                              new BigInteger(param.q, 16),
                              new BigInteger(param.g, 16),
                              new BigInteger(y, 16));
                return key;
            } else {
                throw "unsupported public key algorithm";
            }
        },

        /**
         * parse hexadecimal string of plain PKCS#8 private key
         * @name parsePublicRawRSAKeyHex
         * @memberOf KEYUTIL
         * @function
         * @param {String} pubRawRSAHex hexadecimal string of ASN.1 encoded PKCS#8 public key
         * @return {Array} associative array of parsed key
         * @since pkcs5pkey 1.0.5
         * @description
         * Resulted associative array has following properties:
         * <ul>
         * <li>n - hexadecimal string of public key
         * <li>e - hexadecimal string of public exponent
         * </ul>
         */
        parsePublicRawRSAKeyHex: function(pubRawRSAHex) {
            var result = {};
            
            // 1. Sequence
            if (pubRawRSAHex.substr(0, 2) != "30")
                throw "malformed RSA key(code:001)"; // not sequence
            
            var a1 = ASN1HEX.getPosArrayOfChildren_AtObj(pubRawRSAHex, 0);
            if (a1.length != 2)
                throw "malformed RSA key(code:002)"; // not 2 items in seq

            // 2. public key "N"
            if (pubRawRSAHex.substr(a1[0], 2) != "02")
                throw "malformed RSA key(code:003)"; // 1st item is not integer

            result.n = ASN1HEX.getHexOfV_AtObj(pubRawRSAHex, a1[0]);

            // 3. public key "E"
            if (pubRawRSAHex.substr(a1[1], 2) != "02")
                throw "malformed RSA key(code:004)"; // 2nd item is not integer

            result.e = ASN1HEX.getHexOfV_AtObj(pubRawRSAHex, a1[1]);

            return result;
        },

        /**
         * parse hexadecimal string of RSA private key
         * @name parsePrivateRawRSAKeyHexAtObj
         * @memberOf KEYUTIL
         * @function
         * @param {String} pkcs8PrvHex hexadecimal string of PKCS#8 private key concluding RSA private key
         * @return {Array} info associative array to add parsed RSA private key information
         * @since pkcs5pkey 1.0.5
         * @description
         * Following properties are added to associative array 'info'
         * <ul>
         * <li>n - hexadecimal string of public key
         * <li>e - hexadecimal string of public exponent
         * <li>d - hexadecimal string of private key
         * <li>p - hexadecimal string
         * <li>q - hexadecimal string
         * <li>dp - hexadecimal string
         * <li>dq - hexadecimal string
         * <li>co - hexadecimal string
         * </ul>
         */
        parsePrivateRawRSAKeyHexAtObj: function(pkcs8PrvHex, info) {
            var keyIdx = info.keyidx;
            
            // 1. sequence
            if (pkcs8PrvHex.substr(keyIdx, 2) != "30")
                throw "malformed RSA private key(code:001)"; // not sequence

            var a1 = ASN1HEX.getPosArrayOfChildren_AtObj(pkcs8PrvHex, keyIdx);
            if (a1.length != 9)
                throw "malformed RSA private key(code:002)"; // not sequence

            // 2. RSA key
            info.key = {};
            info.key.n = ASN1HEX.getHexOfV_AtObj(pkcs8PrvHex, a1[1]);
            info.key.e = ASN1HEX.getHexOfV_AtObj(pkcs8PrvHex, a1[2]);
            info.key.d = ASN1HEX.getHexOfV_AtObj(pkcs8PrvHex, a1[3]);
            info.key.p = ASN1HEX.getHexOfV_AtObj(pkcs8PrvHex, a1[4]);
            info.key.q = ASN1HEX.getHexOfV_AtObj(pkcs8PrvHex, a1[5]);
            info.key.dp = ASN1HEX.getHexOfV_AtObj(pkcs8PrvHex, a1[6]);
            info.key.dq = ASN1HEX.getHexOfV_AtObj(pkcs8PrvHex, a1[7]);
            info.key.co = ASN1HEX.getHexOfV_AtObj(pkcs8PrvHex, a1[8]);
        },

        /**
         * parse hexadecimal string of ECC private key
         * @name parsePrivateRawECKeyHexAtObj
         * @memberOf KEYUTIL
         * @function
         * @param {String} pkcs8PrvHex hexadecimal string of PKCS#8 private key concluding EC private key
         * @return {Array} info associative array to add parsed ECC private key information
         * @since pkcs5pkey 1.0.5
         * @description
         * Following properties are added to associative array 'info'
         * <ul>
         * <li>key - hexadecimal string of ECC private key
         * </ul>
         */
        parsePrivateRawECKeyHexAtObj: function(pkcs8PrvHex, info) {
            var keyIdx = info.keyidx;
            
            var key = ASN1HEX.getVbyList(pkcs8PrvHex, keyIdx, [1], "04");
            var pubkey = ASN1HEX.getVbyList(pkcs8PrvHex, keyIdx, [2,0], "03").substr(2);

            info.key = key;
            info.pubkey = pubkey;
        },

        /**
         * parse hexadecimal string of PKCS#8 RSA/EC/DSA public key
         * @name parsePublicPKCS8Hex
         * @memberOf KEYUTIL
         * @function
         * @param {String} pkcs8PubHex hexadecimal string of PKCS#8 public key
         * @return {Hash} hash of key information
         * @description
         * Resulted hash has following attributes.
         * <ul>
         * <li>algoid - hexadecimal string of OID of asymmetric key algorithm</li>
         * <li>algparam - hexadecimal string of OID of ECC curve name, parameter SEQUENCE of DSA or null</li>
         * <li>key - hexadecimal string of public key</li>
         * </ul>
         */
        parsePublicPKCS8Hex: function(pkcs8PubHex) {
            var result = {};
            result.algparam = null;

            // 1. AlgID and Key bit string
            var a1 = ASN1HEX.getPosArrayOfChildren_AtObj(pkcs8PubHex, 0);
            if (a1.length != 2)
                throw "outer DERSequence shall have 2 elements: " + a1.length;

            // 2. AlgID
            var idxAlgIdTLV = a1[0];
            if (pkcs8PubHex.substr(idxAlgIdTLV, 2) != "30")
                throw "malformed PKCS8 public key(code:001)"; // AlgId not sequence

            var a2 = ASN1HEX.getPosArrayOfChildren_AtObj(pkcs8PubHex, idxAlgIdTLV);
            if (a2.length != 2)
                throw "malformed PKCS8 public key(code:002)"; // AlgId not have two elements

            // 2.1. AlgID OID
            if (pkcs8PubHex.substr(a2[0], 2) != "06")
                throw "malformed PKCS8 public key(code:003)"; // AlgId.oid is not OID

            result.algoid = ASN1HEX.getHexOfV_AtObj(pkcs8PubHex, a2[0]);

            // 2.2. AlgID param
            if (pkcs8PubHex.substr(a2[1], 2) == "06") { // OID for EC
                result.algparam = ASN1HEX.getHexOfV_AtObj(pkcs8PubHex, a2[1]);
            } else if (pkcs8PubHex.substr(a2[1], 2) == "30") { // SEQ for DSA
                result.algparam = {};
                result.algparam.p = ASN1HEX.getVbyList(pkcs8PubHex, a2[1], [0], "02");
                result.algparam.q = ASN1HEX.getVbyList(pkcs8PubHex, a2[1], [1], "02");
                result.algparam.g = ASN1HEX.getVbyList(pkcs8PubHex, a2[1], [2], "02");
            }

            // 3. Key
            if (pkcs8PubHex.substr(a1[1], 2) != "03")
                throw "malformed PKCS8 public key(code:004)"; // Key is not bit string

            result.key = ASN1HEX.getHexOfV_AtObj(pkcs8PubHex, a1[1]).substr(2);
            
            // 4. return result assoc array
            return result;
        },

        /**
         * (DEPRECATED) provide hexadecimal string of unencrypted PKCS#8 private key and returns RSAKey object
         * @name getRSAKeyFromPublicPKCS8Hex
         * @memberOf KEYUTIL
         * @function
         * @param {String} pkcs8PubHex hexadecimal string of unencrypted PKCS#8 public key
         * @return {RSAKey} loaded RSAKey object of RSA public key
         * @since pkcs5pkey 1.0.4
         * @deprecated From jsrsasign 4.2.1 please use {@link KEYUTIL.getKey#}.
         */
        getRSAKeyFromPublicPKCS8Hex: function(pkcs8PubHex) {
            var a1 = ASN1HEX.getPosArrayOfChildren_AtObj(pkcs8PubHex, 0);
            if (a1.length != 2)
                throw "outer DERSequence shall have 2 elements: " + a1.length;

            var algIdTLV =ASN1HEX.getHexOfTLV_AtObj(pkcs8PubHex, a1[0]);
            if (algIdTLV != "300d06092a864886f70d0101010500") // AlgId rsaEncryption
                throw "PKCS8 AlgorithmId is not rsaEncryption";
            
            if (pkcs8PubHex.substr(a1[1], 2) != "03")
                throw "PKCS8 Public Key is not BITSTRING encapslated.";

            var idxPub = ASN1HEX.getStartPosOfV_AtObj(pkcs8PubHex, a1[1]) + 2; // 2 for unused bit
            
            if (pkcs8PubHex.substr(idxPub, 2) != "30")
                throw "PKCS8 Public Key is not SEQUENCE.";

            var a2 = ASN1HEX.getPosArrayOfChildren_AtObj(pkcs8PubHex, idxPub);
            if (a2.length != 2)
                throw "inner DERSequence shall have 2 elements: " + a2.length;

            if (pkcs8PubHex.substr(a2[0], 2) != "02") 
                throw "N is not ASN.1 INTEGER";
            if (pkcs8PubHex.substr(a2[1], 2) != "02") 
                throw "E is not ASN.1 INTEGER";
            
            var hN = ASN1HEX.getHexOfV_AtObj(pkcs8PubHex, a2[0]);
            var hE = ASN1HEX.getHexOfV_AtObj(pkcs8PubHex, a2[1]);

            var pubKey = new RSAKey();
            pubKey.setPublic(hN, hE);
            
            return pubKey;
        },

        //addAlgorithm: function(functionObject, algName, keyLen, ivLen) {
        //}
    };
}();

// -- MAJOR PUBLIC METHODS -------------------------------------------------------
/**
 * get private or public key object from any arguments
 * @name getKey
 * @memberOf KEYUTIL
 * @function
 * @static
 * @param {Object} param parameter to get key object. see description in detail.
 * @param {String} passcode (OPTION) parameter to get key object. see description in detail.
 * @param {String} hextype (OPTOIN) parameter to get key object. see description in detail.
 * @return {Object} {@link RSAKey}, {@link KJUR.crypto.ECDSA} or {@link KJUR.crypto.ECDSA} object
 * @since keyutil 1.0.0
 * @description
 * This method gets private or public key object({@link RSAKey}, {@link KJUR.crypto.DSA} or {@link KJUR.crypto.ECDSA})
 * for RSA, DSA and ECC.
 * Arguments for this methods depends on a key format you specify.
 * Following key representations are supported.
 * <ul>
 * <li>ECC private/public key object(as is): param=KJUR.crypto.ECDSA</li>
 * <li>DSA private/public key object(as is): param=KJUR.crypto.DSA</li>
 * <li>RSA private/public key object(as is): param=RSAKey </li>
 * <li>ECC private key parameters: param={d: d, curve: curveName}</li>
 * <li>RSA private key parameters: param={n: n, e: e, d: d, p: p, q: q, dp: dp, dq: dq, co: co}<br/>
 * NOTE: Each value shall be hexadecimal string of key spec.</li>
 * <li>DSA private key parameters: param={p: p, q: q, g: g, y: y, x: x}<br/>
 * NOTE: Each value shall be hexadecimal string of key spec.</li>
 * <li>ECC public key parameters: param={xy: xy, curve: curveName}<br/>
 * NOTE: ECC public key 'xy' shall be concatination of "04", x-bytes-hex and y-bytes-hex.</li>
 * <li>DSA public key parameters: param={p: p, q: q, g: g, y: y}<br/>
 * NOTE: Each value shall be hexadecimal string of key spec.</li>
 * <li>RSA public key parameters: param={n: n, e: e} </li>
 * <li>X.509 PEM certificate (RSA/DSA/ECC): param=pemString</li>
 * <li>PKCS#8 hexadecimal RSA/ECC public key: param=pemString, null, "pkcs8pub"</li>
 * <li>PKCS#8 PEM RSA/DSA/ECC public key: param=pemString</li>
 * <li>PKCS#5 plain hexadecimal RSA private key: param=hexString, null, "pkcs5prv"</li>
 * <li>PKCS#5 plain PEM DSA/RSA private key: param=pemString</li>
 * <li>PKCS#8 plain PEM RSA/ECDSA private key: param=pemString</li>
 * <li>PKCS#5 encrypted PEM RSA/DSA private key: param=pemString, passcode</li>
 * <li>PKCS#8 encrypted PEM RSA/ECDSA private key: param=pemString, passcode</li>
 * </ul>
 * Please note following limitation on encrypted keys:
 * <ul>
 * <li>Encrypted PKCS#8 only supports PBKDF2/HmacSHA1/3DES</li>
 * <li>Encrypted PKCS#5 supports DES-CBC, DES-EDE3-CBC, AES-{128,192.256}-CBC</li>
 * <li>JWT plain RSA/ECC private/public key</li>
 * </ul>
 * NOTE: <a href="https://tools.ietf.org/html/rfc7517">RFC 7517 JSON Web Key(JWK)</a> support for RSA/ECC private/public key from jsrsasign 4.8.1.
 */
KEYUTIL.getKey = function(param, passcode, hextype) {
    // 1. by key RSAKey/KJUR.crypto.ECDSA/KJUR.crypto.DSA object
    if (typeof RSAKey != 'undefined' && param instanceof RSAKey)
        return param;
    if (typeof KJUR.crypto.ECDSA != 'undefined' && param instanceof KJUR.crypto.ECDSA)
        return param;
    if (typeof KJUR.crypto.DSA != 'undefined' && param instanceof KJUR.crypto.DSA)
        return param;

    // 2. by parameters of key
    // 2.1. ECC private key
    if (param.d !== undefined && param.curve !== undefined) {
        return new KJUR.crypto.ECDSA({prv: param.d, curve: param.curve});
    }
    // 2.2. bare RSA private key
    if (param.n !== undefined &&
	param.e !== undefined &&
	param.d !== undefined &&
        param.p !== undefined &&
	param.q !== undefined &&
        param.dp !== undefined &&
	param.dq !== undefined &&
	param.co !== undefined &&
        param.qi === undefined) {
        var key = new RSAKey();
        key.setPrivateEx(param.n, param.e, param.d, param.p, param.q,
                         param.dp, param.dq, param.co);
        return key;
    }
    // 2.3. DSA private key
    if (param.p !== undefined && param.q !== undefined && param.g !== undefined && 
        param.y !== undefined && param.x !== undefined) {
        var key = new KJUR.crypto.DSA();
        key.setPrivate(param.p, param.q, param.g, param.y, param.x);
        return key;
    }

    // 2.4. ECC public key
    if (param.xy !== undefined && param.d === undefined && param.curve !== undefined) {
        return new KJUR.crypto.ECDSA({pub: param.xy, curve: param.curve});
    }
    // 2.5. bare RSA public key
    if (param.kty === undefined && param.n !== undefined && param.e) {
        var key = new RSAKey();
        key.setPublic(param.n, param.e);
        return key;
    }
    // 2.6. DSA public key
    if (param.p !== undefined && param.q !== undefined && param.g !== undefined && 
        param.y !== undefined && param.x === undefined) {
        var key = new KJUR.crypto.DSA();
        key.setPublic(param.p, param.q, param.g, param.y);
        return key;
    }

    // 2.7. JWK RSA public key
    if (param.kty === "RSA" &&
	param.n !== undefined &&
	param.e !== undefined &&
	param.d === undefined) {
	var key = new RSAKey();
	key.setPublic(b64utohex(param.n), b64utohex(param.e));
	return key;
    }

    // 2.8. JWK RSA private key
    if (param.kty === "RSA" &&
	param.n !== undefined &&
	param.e !== undefined &&
	param.d !== undefined &&
	param.p !== undefined &&
	param.q !== undefined &&
	param.dp !== undefined &&
	param.dq !== undefined &&
	param.qi !== undefined) {
	var key = new RSAKey();
        key.setPrivateEx(b64utohex(param.n),
			 b64utohex(param.e),
			 b64utohex(param.d),
			 b64utohex(param.p),
			 b64utohex(param.q),
                         b64utohex(param.dp),
			 b64utohex(param.dq),
			 b64utohex(param.qi));
	return key;
    }

    // 2.9. JWK ECC public key
    if (param.kty === "EC" &&
	param.crv !== undefined &&
	param.x !== undefined &&
	param.y !== undefined &&
        param.d === undefined) {
	var ec = new KJUR.crypto.ECDSA({"curve": param.crv});
	var charlen = ec.ecparams.keylen / 4;
        var hX   = ("0000000000" + b64utohex(param.x)).slice(- charlen);
        var hY   = ("0000000000" + b64utohex(param.y)).slice(- charlen);
        var hPub = "04" + hX + hY;
	ec.setPublicKeyHex(hPub);
	return ec;
    }

    // 2.10. JWK ECC private key
    if (param.kty === "EC" &&
	param.crv !== undefined &&
	param.x !== undefined &&
	param.y !== undefined &&
        param.d !== undefined) {
	var ec = new KJUR.crypto.ECDSA({"curve": param.crv});
	var charlen = ec.ecparams.keylen / 4;
        var hPrv = ("0000000000" + b64utohex(param.d)).slice(- charlen);
	ec.setPrivateKeyHex(hPrv);
	return ec;
    }
    
    // 3. by PEM certificate (-----BEGIN ... CERTIFITE----)
    if (param.indexOf("-END CERTIFICATE-", 0) != -1 ||
        param.indexOf("-END X509 CERTIFICATE-", 0) != -1 ||
        param.indexOf("-END TRUSTED CERTIFICATE-", 0) != -1) {
        return X509.getPublicKeyFromCertPEM(param);
    }

    // 4. public key by PKCS#8 hexadecimal string
    if (hextype === "pkcs8pub") {
        return KEYUTIL.getKeyFromPublicPKCS8Hex(param);
    }

    // 5. public key by PKCS#8 PEM string
    if (param.indexOf("-END PUBLIC KEY-") != -1) {
        return KEYUTIL.getKeyFromPublicPKCS8PEM(param);
    }
    
    // 6. private key by PKCS#5 plain hexadecimal RSA string
    if (hextype === "pkcs5prv") {
        var key = new RSAKey();
        key.readPrivateKeyFromASN1HexString(param);
        return key;
    }

    // 7. private key by plain PKCS#5 hexadecimal RSA string
    if (hextype === "pkcs5prv") {
        var key = new RSAKey();
        key.readPrivateKeyFromASN1HexString(param);
        return key;
    }

    // 8. private key by plain PKCS#5 PEM RSA string 
    //    getKey("-----BEGIN RSA PRIVATE KEY-...")
    if (param.indexOf("-END RSA PRIVATE KEY-") != -1 &&
        param.indexOf("4,ENCRYPTED") == -1) {
        var hex = KEYUTIL.getHexFromPEM(param, "RSA PRIVATE KEY");
        return KEYUTIL.getKey(hex, null, "pkcs5prv");
    }

    // 8.2. private key by plain PKCS#5 PEM DSA string
    if (param.indexOf("-END DSA PRIVATE KEY-") != -1 &&
        param.indexOf("4,ENCRYPTED") == -1) {

        var hKey = this.getHexFromPEM(param, "DSA PRIVATE KEY");
        var p = ASN1HEX.getVbyList(hKey, 0, [1], "02");
        var q = ASN1HEX.getVbyList(hKey, 0, [2], "02");
        var g = ASN1HEX.getVbyList(hKey, 0, [3], "02");
        var y = ASN1HEX.getVbyList(hKey, 0, [4], "02");
        var x = ASN1HEX.getVbyList(hKey, 0, [5], "02");
        var key = new KJUR.crypto.DSA();
        key.setPrivate(new BigInteger(p, 16),
                       new BigInteger(q, 16),
                       new BigInteger(g, 16),
                       new BigInteger(y, 16),
                       new BigInteger(x, 16));
        return key;
    }

    // 9. private key by plain PKCS#8 PEM ECC/RSA string
    if (param.indexOf("-END PRIVATE KEY-") != -1) {
        return KEYUTIL.getKeyFromPlainPrivatePKCS8PEM(param);
    }

    // 10. private key by encrypted PKCS#5 PEM RSA string
    if (param.indexOf("-END RSA PRIVATE KEY-") != -1 &&
        param.indexOf("4,ENCRYPTED") != -1) {
        return KEYUTIL.getRSAKeyFromEncryptedPKCS5PEM(param, passcode);
    }

    // 10.2. private key by encrypted PKCS#5 PEM ECDSA string
    if (param.indexOf("-END EC PRIVATE KEY-") != -1 &&
        param.indexOf("4,ENCRYPTED") != -1) {
        var hKey = KEYUTIL.getDecryptedKeyHex(param, passcode);

        var key = ASN1HEX.getVbyList(hKey, 0, [1], "04");
        var curveNameOidHex = ASN1HEX.getVbyList(hKey, 0, [2,0], "06");
        var pubkey = ASN1HEX.getVbyList(hKey, 0, [3,0], "03").substr(2);
        var curveName = "";

        if (KJUR.crypto.OID.oidhex2name[curveNameOidHex] !== undefined) {
            curveName = KJUR.crypto.OID.oidhex2name[curveNameOidHex];
        } else {
            throw "undefined OID(hex) in KJUR.crypto.OID: " + curveNameOidHex;
        }

        var ec = new KJUR.crypto.ECDSA({'name': curveName});
        ec.setPublicKeyHex(pubkey);
        ec.setPrivateKeyHex(key);
        ec.isPublic = false;
        return ec;
    }

    // 10.3. private key by encrypted PKCS#5 PEM DSA string
    if (param.indexOf("-END DSA PRIVATE KEY-") != -1 &&
        param.indexOf("4,ENCRYPTED") != -1) {
        var hKey = KEYUTIL.getDecryptedKeyHex(param, passcode);
        var p = ASN1HEX.getVbyList(hKey, 0, [1], "02");
        var q = ASN1HEX.getVbyList(hKey, 0, [2], "02");
        var g = ASN1HEX.getVbyList(hKey, 0, [3], "02");
        var y = ASN1HEX.getVbyList(hKey, 0, [4], "02");
        var x = ASN1HEX.getVbyList(hKey, 0, [5], "02");
        var key = new KJUR.crypto.DSA();
        key.setPrivate(new BigInteger(p, 16),
                       new BigInteger(q, 16),
                       new BigInteger(g, 16),
                       new BigInteger(y, 16),
                       new BigInteger(x, 16));
        return key;
    }

    // 11. private key by encrypted PKCS#8 hexadecimal RSA/ECDSA string
    if (param.indexOf("-END ENCRYPTED PRIVATE KEY-") != -1) {
        return KEYUTIL.getKeyFromEncryptedPKCS8PEM(param, passcode);
    }

    throw "not supported argument";
};

/**
 * @name generateKeypair
 * @memberOf KEYUTIL
 * @function
 * @static
 * @param {String} alg 'RSA' or 'EC'
 * @param {Object} keylenOrCurve key length for RSA or curve name for EC
 * @return {Array} associative array of keypair which has prvKeyObj and pubKeyObj parameters
 * @since keyutil 1.0.1
 * @description
 * This method generates a key pair of public key algorithm.
 * The result will be an associative array which has following
 * parameters:
 * <ul>
 * <li>prvKeyObj - RSAKey or ECDSA object of private key</li>
 * <li>pubKeyObj - RSAKey or ECDSA object of public key</li>
 * </ul>
 * NOTE1: As for RSA algoirthm, public exponent has fixed
 * value '0x10001'.
 * NOTE2: As for EC algorithm, supported names of curve are
 * secp256r1, secp256k1 and secp384r1.
 * NOTE3: DSA is not supported yet.
 * @example
 * var rsaKeypair = KEYUTIL.generateKeypair("RSA", 1024);
 * var ecKeypair = KEYUTIL.generateKeypair("EC", "secp256r1");
 *
 */
KEYUTIL.generateKeypair = function(alg, keylenOrCurve) {
    if (alg == "RSA") {
        var keylen = keylenOrCurve;
        var prvKey = new RSAKey();
        prvKey.generate(keylen, '10001');
        prvKey.isPrivate = true;
        prvKey.isPublic = true;
        
        var pubKey = new RSAKey();
        var hN = prvKey.n.toString(16);
        var hE = prvKey.e.toString(16);
        pubKey.setPublic(hN, hE);
        pubKey.isPrivate = false;
        pubKey.isPublic = true;
        
        var result = {};
        result.prvKeyObj = prvKey;
        result.pubKeyObj = pubKey;
        return result;
    } else if (alg == "EC") {
        var curve = keylenOrCurve;
        var ec = new KJUR.crypto.ECDSA({curve: curve});
        var keypairHex = ec.generateKeyPairHex();

        var prvKey = new KJUR.crypto.ECDSA({curve: curve});
        prvKey.setPrivateKeyHex(keypairHex.ecprvhex);
        prvKey.isPrivate = true;
        prvKey.isPublic = false;

        var pubKey = new KJUR.crypto.ECDSA({curve: curve});
        pubKey.setPublicKeyHex(keypairHex.ecpubhex);
        pubKey.isPrivate = false;
        pubKey.isPublic = true;

        var result = {};
        result.prvKeyObj = prvKey;
        result.pubKeyObj = pubKey;
        return result;
    } else {
        throw "unknown algorithm: " + alg;
    }
};

/**
 * get PEM formatted private or public key file from a RSA/ECDSA/DSA key object
 * @name getPEM
 * @memberOf KEYUTIL
 * @function
 * @static
 * @param {Object} keyObjOrHex key object {@link RSAKey}, {@link KJUR.crypto.ECDSA} or {@link KJUR.crypto.DSA} to encode to
 * @param {String} formatType (OPTION) output format type of "PKCS1PRV", "PKCS5PRV" or "PKCS8PRV" for private key
 * @param {String} passwd (OPTION) password to protect private key
 * @param {String} encAlg (OPTION) encryption algorithm for PKCS#5. currently supports DES-CBC, DES-EDE3-CBC and AES-{128,192,256}-CBC
 * @since keyutil 1.0.4
 * @description
 * <dl>
 * <dt><b>NOTE1:</b>
 * <dd>
 * PKCS#5 encrypted private key protection algorithm supports DES-CBC, 
 * DES-EDE3-CBC and AES-{128,192,256}-CBC
 * <dt><b>NOTE2:</b>
 * <dd>
 * OpenSSL supports
 * </dl>
 * @example
 * KEUUTIL.getPEM(publicKey) =&gt; generates PEM PKCS#8 public key 
 * KEUUTIL.getPEM(privateKey, "PKCS1PRV") =&gt; generates PEM PKCS#1 plain private key
 * KEUUTIL.getPEM(privateKey, "PKCS5PRV", "pass") =&gt; generates PEM PKCS#5 encrypted private key 
 *                                                          with DES-EDE3-CBC (DEFAULT)
 * KEUUTIL.getPEM(privateKey, "PKCS5PRV", "pass", "DES-CBC") =&gt; generates PEM PKCS#5 encrypted 
 *                                                                 private key with DES-CBC
 * KEUUTIL.getPEM(privateKey, "PKCS8PRV") =&gt; generates PEM PKCS#8 plain private key
 * KEUUTIL.getPEM(privateKey, "PKCS8PRV", "pass") =&gt; generates PEM PKCS#8 encrypted private key
 *                                                      with PBKDF2_HmacSHA1_3DES
 */
KEYUTIL.getPEM = function(keyObjOrHex, formatType, passwd, encAlg, hexType) {
    var ns1 = KJUR.asn1;
    var ns2 = KJUR.crypto;

    function _rsaprv2asn1obj(keyObjOrHex) {
        var asn1Obj = KJUR.asn1.ASN1Util.newObject({
            "seq": [
                {"int": 0 },
                {"int": {"bigint": keyObjOrHex.n}},
                {"int": keyObjOrHex.e},
                {"int": {"bigint": keyObjOrHex.d}},
                {"int": {"bigint": keyObjOrHex.p}},
                {"int": {"bigint": keyObjOrHex.q}},
                {"int": {"bigint": keyObjOrHex.dmp1}},
                {"int": {"bigint": keyObjOrHex.dmq1}},
                {"int": {"bigint": keyObjOrHex.coeff}}
            ]
        });
        return asn1Obj;
    };

    function _ecdsaprv2asn1obj(keyObjOrHex) {
        var asn1Obj2 = KJUR.asn1.ASN1Util.newObject({
            "seq": [
                {"int": 1 },
                {"octstr": {"hex": keyObjOrHex.prvKeyHex}},
                {"tag": ['a0', true, {'oid': {'name': keyObjOrHex.curveName}}]},
                {"tag": ['a1', true, {'bitstr': {'hex': '00' + keyObjOrHex.pubKeyHex}}]}
            ]
        });
        return asn1Obj2;
    };

    function _dsaprv2asn1obj(keyObjOrHex) {
        var asn1Obj = KJUR.asn1.ASN1Util.newObject({
            "seq": [
                {"int": 0 },
                {"int": {"bigint": keyObjOrHex.p}},
                {"int": {"bigint": keyObjOrHex.q}},
                {"int": {"bigint": keyObjOrHex.g}},
                {"int": {"bigint": keyObjOrHex.y}},
                {"int": {"bigint": keyObjOrHex.x}}
            ]
        });
        return asn1Obj;
    };

    // 1. public key

    // x. PEM PKCS#8 public key of RSA/ECDSA/DSA public key object
    if (((typeof RSAKey != "undefined" && keyObjOrHex instanceof RSAKey) ||
         (typeof ns2.DSA != "undefined" && keyObjOrHex instanceof ns2.DSA) ||
         (typeof ns2.ECDSA != "undefined" && keyObjOrHex instanceof ns2.ECDSA)) &&
        keyObjOrHex.isPublic == true &&
        (formatType === undefined || formatType == "PKCS8PUB")) {
        var asn1Obj = new KJUR.asn1.x509.SubjectPublicKeyInfo(keyObjOrHex);
        var asn1Hex = asn1Obj.getEncodedHex();
        return ns1.ASN1Util.getPEMStringFromHex(asn1Hex, "PUBLIC KEY");
    }
    
    // 2. private

    // x. PEM PKCS#1 plain private key of RSA private key object
    if (formatType == "PKCS1PRV" &&
        typeof RSAKey != "undefined" &&
        keyObjOrHex instanceof RSAKey &&
        (passwd === undefined || passwd == null) &&
        keyObjOrHex.isPrivate  == true) {

        var asn1Obj = _rsaprv2asn1obj(keyObjOrHex);
        var asn1Hex = asn1Obj.getEncodedHex();
        return ns1.ASN1Util.getPEMStringFromHex(asn1Hex, "RSA PRIVATE KEY");
    }

    // x. PEM PKCS#1 plain private key of ECDSA private key object
    if (formatType == "PKCS1PRV" &&
        typeof RSAKey != "undefined" &&
        keyObjOrHex instanceof KJUR.crypto.ECDSA &&
        (passwd === undefined || passwd == null) &&
        keyObjOrHex.isPrivate  == true) {

        var asn1Obj1 = new KJUR.asn1.DERObjectIdentifier({'name': keyObjOrHex.curveName});
        var asn1Hex1 = asn1Obj1.getEncodedHex();
        var asn1Obj2 = _ecdsaprv2asn1obj(keyObjOrHex);
        var asn1Hex2 = asn1Obj2.getEncodedHex();

        var s = "";
        s += ns1.ASN1Util.getPEMStringFromHex(asn1Hex1, "EC PARAMETERS");
        s += ns1.ASN1Util.getPEMStringFromHex(asn1Hex2, "EC PRIVATE KEY");
        return s;
    }

    // x. PEM PKCS#1 plain private key of DSA private key object
    if (formatType == "PKCS1PRV" &&
        typeof KJUR.crypto.DSA != "undefined" &&
        keyObjOrHex instanceof KJUR.crypto.DSA &&
        (passwd === undefined || passwd == null) &&
        keyObjOrHex.isPrivate  == true) {

        var asn1Obj = _dsaprv2asn1obj(keyObjOrHex);
        var asn1Hex = asn1Obj.getEncodedHex();
        return ns1.ASN1Util.getPEMStringFromHex(asn1Hex, "DSA PRIVATE KEY");
    }

    // 3. private

    // x. PEM PKCS#5 encrypted private key of RSA private key object
    if (formatType == "PKCS5PRV" &&
        typeof RSAKey != "undefined" &&
        keyObjOrHex instanceof RSAKey &&
        (passwd !== undefined && passwd != null) &&
        keyObjOrHex.isPrivate  == true) {

        var asn1Obj = _rsaprv2asn1obj(keyObjOrHex);
        var asn1Hex = asn1Obj.getEncodedHex();

        if (encAlg === undefined) encAlg = "DES-EDE3-CBC";
        return this.getEncryptedPKCS5PEMFromPrvKeyHex("RSA", asn1Hex, passwd, encAlg);
    }

    // x. PEM PKCS#5 encrypted private key of ECDSA private key object
    if (formatType == "PKCS5PRV" &&
        typeof KJUR.crypto.ECDSA != "undefined" &&
        keyObjOrHex instanceof KJUR.crypto.ECDSA &&
        (passwd !== undefined && passwd != null) &&
        keyObjOrHex.isPrivate  == true) {

        var asn1Obj = _ecdsaprv2asn1obj(keyObjOrHex);
        var asn1Hex = asn1Obj.getEncodedHex();

        if (encAlg === undefined) encAlg = "DES-EDE3-CBC";
        return this.getEncryptedPKCS5PEMFromPrvKeyHex("EC", asn1Hex, passwd, encAlg);
    }

    // x. PEM PKCS#5 encrypted private key of DSA private key object
    if (formatType == "PKCS5PRV" &&
        typeof KJUR.crypto.DSA != "undefined" &&
        keyObjOrHex instanceof KJUR.crypto.DSA &&
        (passwd !== undefined && passwd != null) &&
        keyObjOrHex.isPrivate  == true) {

        var asn1Obj = _dsaprv2asn1obj(keyObjOrHex);
        var asn1Hex = asn1Obj.getEncodedHex();

        if (encAlg === undefined) encAlg = "DES-EDE3-CBC";
        return this.getEncryptedPKCS5PEMFromPrvKeyHex("DSA", asn1Hex, passwd, encAlg);
    }

    // x. ======================================================================

    var _getEncryptedPKCS8 = function(plainKeyHex, passcode) {
        var info = _getEencryptedPKCS8Info(plainKeyHex, passcode);
        //alert("iv=" + info.encryptionSchemeIV);
        //alert("info.ciphertext2[" + info.ciphertext.length + "=" + info.ciphertext);
        var asn1Obj = new KJUR.asn1.ASN1Util.newObject({
            "seq": [
                {"seq": [
                    {"oid": {"name": "pkcs5PBES2"}},
                    {"seq": [
                        {"seq": [
                            {"oid": {"name": "pkcs5PBKDF2"}},
                            {"seq": [
                                {"octstr": {"hex": info.pbkdf2Salt}},
                                {"int": info.pbkdf2Iter}
                            ]}
                        ]},
                        {"seq": [
                            {"oid": {"name": "des-EDE3-CBC"}},
                            {"octstr": {"hex": info.encryptionSchemeIV}}
                        ]}
                    ]}
                ]},
                {"octstr": {"hex": info.ciphertext}}
            ]
        });
        return asn1Obj.getEncodedHex();
    };

    var _getEencryptedPKCS8Info = function(plainKeyHex, passcode) {
        var pbkdf2Iter = 100;
        var pbkdf2SaltWS = CryptoJS.lib.WordArray.random(8);
        var encryptionSchemeAlg = "DES-EDE3-CBC";
        var encryptionSchemeIVWS = CryptoJS.lib.WordArray.random(8);
        // PBKDF2 key
        var pbkdf2KeyWS = CryptoJS.PBKDF2(passcode, 
                                          pbkdf2SaltWS, { "keySize": 192/32,
                                                          "iterations": pbkdf2Iter });
        // ENCRYPT
        var plainKeyWS = CryptoJS.enc.Hex.parse(plainKeyHex);
        var encryptedKeyHex = 
            CryptoJS.TripleDES.encrypt(plainKeyWS, pbkdf2KeyWS, { "iv": encryptionSchemeIVWS }) + "";

        //alert("encryptedKeyHex=" + encryptedKeyHex);

        var info = {};
        info.ciphertext = encryptedKeyHex;
        //alert("info.ciphertext=" + info.ciphertext);
        info.pbkdf2Salt = CryptoJS.enc.Hex.stringify(pbkdf2SaltWS);
        info.pbkdf2Iter = pbkdf2Iter;
        info.encryptionSchemeAlg = encryptionSchemeAlg;
        info.encryptionSchemeIV = CryptoJS.enc.Hex.stringify(encryptionSchemeIVWS);
        return info;
    };

    // x. PEM PKCS#8 plain private key of RSA private key object
    if (formatType == "PKCS8PRV" &&
        typeof RSAKey != "undefined" &&
        keyObjOrHex instanceof RSAKey &&
        keyObjOrHex.isPrivate  == true) {

        var keyObj = _rsaprv2asn1obj(keyObjOrHex);
        var keyHex = keyObj.getEncodedHex();

        var asn1Obj = KJUR.asn1.ASN1Util.newObject({
            "seq": [
                {"int": 0},
                {"seq": [{"oid": {"name": "rsaEncryption"}},{"null": true}]},
                {"octstr": {"hex": keyHex}}
            ]
        });
        var asn1Hex = asn1Obj.getEncodedHex();

        if (passwd === undefined || passwd == null) {
            return ns1.ASN1Util.getPEMStringFromHex(asn1Hex, "PRIVATE KEY");
        } else {
            var asn1Hex2 = _getEncryptedPKCS8(asn1Hex, passwd);
            return ns1.ASN1Util.getPEMStringFromHex(asn1Hex2, "ENCRYPTED PRIVATE KEY");
        }
    }

    // x. PEM PKCS#8 plain private key of ECDSA private key object
    if (formatType == "PKCS8PRV" &&
        typeof KJUR.crypto.ECDSA != "undefined" &&
        keyObjOrHex instanceof KJUR.crypto.ECDSA &&
        keyObjOrHex.isPrivate  == true) {

        var keyObj = new KJUR.asn1.ASN1Util.newObject({
            "seq": [
                {"int": 1},
                {"octstr": {"hex": keyObjOrHex.prvKeyHex}},
                {"tag": ['a1', true, {"bitstr": {"hex": "00" + keyObjOrHex.pubKeyHex}}]}
            ]
        });
        var keyHex = keyObj.getEncodedHex();

        var asn1Obj = KJUR.asn1.ASN1Util.newObject({
            "seq": [
                {"int": 0},
                {"seq": [
                    {"oid": {"name": "ecPublicKey"}},
                    {"oid": {"name": keyObjOrHex.curveName}}
                ]},
                {"octstr": {"hex": keyHex}}
            ]
        });

        var asn1Hex = asn1Obj.getEncodedHex();
        if (passwd === undefined || passwd == null) {
            return ns1.ASN1Util.getPEMStringFromHex(asn1Hex, "PRIVATE KEY");
        } else {
            var asn1Hex2 = _getEncryptedPKCS8(asn1Hex, passwd);
            return ns1.ASN1Util.getPEMStringFromHex(asn1Hex2, "ENCRYPTED PRIVATE KEY");
        }
    }

    // x. PEM PKCS#8 plain private key of DSA private key object
    if (formatType == "PKCS8PRV" &&
        typeof KJUR.crypto.DSA != "undefined" &&
        keyObjOrHex instanceof KJUR.crypto.DSA &&
        keyObjOrHex.isPrivate  == true) {

        var keyObj = new KJUR.asn1.DERInteger({'bigint': keyObjOrHex.x});
        var keyHex = keyObj.getEncodedHex();

        var asn1Obj = KJUR.asn1.ASN1Util.newObject({
            "seq": [
                {"int": 0},
                {"seq": [
                    {"oid": {"name": "dsa"}},
                    {"seq": [
                        {"int": {"bigint": keyObjOrHex.p}},
                        {"int": {"bigint": keyObjOrHex.q}},
                        {"int": {"bigint": keyObjOrHex.g}}
                    ]}
                ]},
                {"octstr": {"hex": keyHex}}
            ]
        });

        var asn1Hex = asn1Obj.getEncodedHex();
        if (passwd === undefined || passwd == null) {
            return ns1.ASN1Util.getPEMStringFromHex(asn1Hex, "PRIVATE KEY");
        } else {
            var asn1Hex2 = _getEncryptedPKCS8(asn1Hex, passwd);
            return ns1.ASN1Util.getPEMStringFromHex(asn1Hex2, "ENCRYPTED PRIVATE KEY");
        }
    }

    throw "unsupported object nor format";
};

// -- PUBLIC METHODS FOR CSR -------------------------------------------------------

/**
 * get RSAKey/DSA/ECDSA public key object from PEM formatted PKCS#10 CSR string
 * @name getKeyFromCSRPEM
 * @memberOf KEYUTIL
 * @function
 * @param {String} csrPEM PEM formatted PKCS#10 CSR string
 * @return {Object} RSAKey/DSA/ECDSA public key object
 * @since keyutil 1.0.5
 */
KEYUTIL.getKeyFromCSRPEM = function(csrPEM) {
    var csrHex = KEYUTIL.getHexFromPEM(csrPEM, "CERTIFICATE REQUEST");
    var key = KEYUTIL.getKeyFromCSRHex(csrHex);
    return key;
};

/**
 * get RSAKey/DSA/ECDSA public key object from hexadecimal string of PKCS#10 CSR
 * @name getKeyFromCSRHex
 * @memberOf KEYUTIL
 * @function
 * @param {String} csrHex hexadecimal string of PKCS#10 CSR
 * @return {Object} RSAKey/DSA/ECDSA public key object
 * @since keyutil 1.0.5
 */
KEYUTIL.getKeyFromCSRHex = function(csrHex) {
    var info = KEYUTIL.parseCSRHex(csrHex);
    var key = KEYUTIL.getKey(info.p8pubkeyhex, null, "pkcs8pub");
    return key;
};

/**
 * parse hexadecimal string of PKCS#10 CSR (certificate signing request)
 * @name parseCSRHex
 * @memberOf KEYUTIL
 * @function
 * @param {String} csrHex hexadecimal string of PKCS#10 CSR
 * @return {Array} associative array of parsed CSR
 * @since keyutil 1.0.5
 * @description
 * Resulted associative array has following properties:
 * <ul>
 * <li>p8pubkeyhex - hexadecimal string of subject public key in PKCS#8</li>
 * </ul>
 */
KEYUTIL.parseCSRHex = function(csrHex) {
    var result = {};
    var h = csrHex;

    // 1. sequence
    if (h.substr(0, 2) != "30")
        throw "malformed CSR(code:001)"; // not sequence

    var a1 = ASN1HEX.getPosArrayOfChildren_AtObj(h, 0);
    if (a1.length < 1)
        throw "malformed CSR(code:002)"; // short length

    // 2. 2nd sequence
    if (h.substr(a1[0], 2) != "30")
        throw "malformed CSR(code:003)"; // not sequence

    var a2 = ASN1HEX.getPosArrayOfChildren_AtObj(h, a1[0]);
    if (a2.length < 3)
        throw "malformed CSR(code:004)"; // 2nd seq short elem

    result.p8pubkeyhex = ASN1HEX.getHexOfTLV_AtObj(h, a2[2]);

    return result;
};
