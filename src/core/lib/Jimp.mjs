/**
 * Jimp image library with additional plugins.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import { Jimp as BaseJimp, JimpMime, PNGFilterType, ResizeStrategy, EdgeAction } from "jimp";
import webp from "@jimp/wasm-webp";

/**
 * Configure Jimp with WebP support
 */
const Jimp = new BaseJimp({
    plugins: [webp],
    formats: [webp]
});

export { Jimp, JimpMime, PNGFilterType, ResizeStrategy, EdgeAction };
export default Jimp;
