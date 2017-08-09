import Image from "../../operations/Image.js";


/**
 * Image module.
 *
 * Libraries:
 *  - exif-parser
 *  - remove-exif
 *  - ./FileType.js
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
let OpModules = self.OpModules || {};

OpModules.Image = {
    "Extract EXIF": Image.runExtractEXIF,
    "Remove EXIF":  Image.runRemoveEXIF,
    "Render Image": Image.runRenderImage,

};

export default OpModules;
