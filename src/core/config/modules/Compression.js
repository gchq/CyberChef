import Compress from "../../operations/Compress.js";


/**
 * Compression module.
 *
 * Libraries:
 *  - zlib.js
 *  - bzip2.js
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
let OpModules = self.OpModules || {};

OpModules.Compression = {
    "Raw Deflate":      Compress.runRawDeflate,
    "Raw Inflate":      Compress.runRawInflate,
    "Zlib Deflate":     Compress.runZlibDeflate,
    "Zlib Inflate":     Compress.runZlibInflate,
    "Gzip":             Compress.runGzip,
    "Gunzip":           Compress.runGunzip,
    "Zip":              Compress.runPkzip,
    "Unzip":            Compress.runPkunzip,
    "Bzip2 Decompress": Compress.runBzip2Decompress,
    "Tar":              Compress.runTar,
    "Untar":            Compress.runUntar,

};

export default OpModules;
