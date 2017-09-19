/**
 * Imports all modules for builds which do not load modules separately.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import OpModules from "./Default.js";
import CharEncModule from "./CharEnc.js";
import CipherModule from "./Ciphers.js";
import CodeModule from "./Code.js";
import CompressionModule from "./Compression.js";
import DiffModule from "./Diff.js";
import EncodingModule from "./Encodings.js";
import HashingModule from "./Hashing.js";
import HTTPModule from "./HTTP.js";
import ImageModule from "./Image.js";
import JSBNModule from "./JSBN.js";
import PublicKeyModule from "./PublicKey.js";

Object.assign(
    OpModules,
    CharEncModule,
    CipherModule,
    CodeModule,
    CompressionModule,
    DiffModule,
    EncodingModule,
    HashingModule,
    HTTPModule,
    ImageModule,
    JSBNModule,
    PublicKeyModule
);

export default OpModules;
