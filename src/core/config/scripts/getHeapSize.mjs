/**
 * Prints the Node V8 heap size limit in MB.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

/* eslint no-console: ["off"] */

import v8 from "v8";

console.log(`node heap limit = ${v8.getHeapStatistics().heap_size_limit / (1024 * 1024)} Mb`);
