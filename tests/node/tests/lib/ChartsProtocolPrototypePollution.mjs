import TestRegister from "../../../lib/TestRegister.mjs";
import {getSeriesValues} from "../../../../src/core/lib/Charts.mjs";
import {objToTable} from "../../../../src/core/lib/Protocol.mjs";
import SeriesChart from "../../../../src/core/operations/SeriesChart.mjs";
import ParseUDP from "../../../../src/core/operations/ParseUDP.mjs";
import it from "../../assertionHandler.mjs";
import assert from "assert";

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

TestRegister.addApiTests([
    it("Charts: should not pollute Object.prototype from a __proto__ series name", () => {
        const xVal = "<img src=x onerror=alert(1)>";
        delete Object.prototype[xVal];

        try {
            const result = getSeriesValues(`__proto__,${xVal},1`, "\n", ",", false);

            assert.equal(Object.prototype[xVal], undefined);
            assert.deepEqual(result.xValues, [xVal]);
            assert.equal(result.series.length, 1);
            assert.equal(result.series[0].name, "__proto__");
            assert.equal(Object.getPrototypeOf(result.series[0].data), null);
            assert(hasOwn(result.series[0].data, xVal));
            assert.equal(result.series[0].data[xVal], 1);
        } finally {
            delete Object.prototype[xVal];
        }
    }),

    it("Charts: should keep __proto__ x-axis names as own data keys", () => {
        const result = getSeriesValues("safe,__proto__,1", "\n", ",", false);

        assert.equal(result.series.length, 1);
        assert.equal(Object.getPrototypeOf(result.series[0].data), null);
        assert(hasOwn(result.series[0].data, "__proto__"));
        assert.equal(result.series[0].data.__proto__, 1);
    }),

    it("Protocol: should ignore inherited properties when rendering tables", () => {
        const inheritedKey = "<img src=x onerror=alert(1)>";
        delete Object.prototype[inheritedKey];

        try {
            Object.prototype[inheritedKey] = "polluted";

            const html = objToTable({safe: "value"});

            assert(!html.includes(inheritedKey));
            assert(!html.includes("polluted"));
            assert(html.includes("safe"));
            assert(html.includes("value"));
        } finally {
            delete Object.prototype[inheritedKey];
        }
    }),

    it("Protocol: should escape table keys and scalar values", () => {
        const obj = {
            "<b>field</b>": "<img src=x onerror=alert(1)>",
        };

        const html = objToTable(obj);

        assert(!html.includes("<b>field</b>"));
        assert(!html.includes("<img src=x onerror=alert(1)>"));
        assert(html.includes("&lt;b&gt;field&lt;/b&gt;"));
        assert(html.includes("&lt;img src=x onerror=alert(1)&gt;"));
    }),

    it("Series chart and Parse UDP: should not expose polluted prototype data as HTML", () => {
        const xVal = "<img src=x onerror=alert(document.domain)>";
        delete Object.prototype[xVal];

        try {
            const chartHtml = new SeriesChart().run(
                `__proto__,${xVal},1`,
                ["Line feed", "Comma", "", 1, "red"]
            );
            assert.equal(Object.prototype[xVal], undefined);

            const parseUDP = new ParseUDP();
            const tableHtml = parseUDP.present(parseUDP.run(chartHtml, ["Raw"]));

            assert(!/<img|onerror|alert\(/.test(tableHtml));
        } finally {
            delete Object.prototype[xVal];
        }
    }),
]);
