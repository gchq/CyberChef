/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import {FORMATS, convertCoordinates} from "../lib/ConvertCoordinates";
import OperationError from "../errors/OperationError";

/**
 * Show on map operation
 */
class ShowOnMap extends Operation {

    /**
     * ShowOnMap constructor
     */
    constructor() {
        super();

        this.name = "Show on map";
        this.module = "Hashing";
        this.description = "Displays co-ordinates on an OpenStreetMap slippy map.<br><br>Co-ordinates will be converted to decimal degrees before being shown on the map.<br><br>Supported formats:<ul><li>Degrees Minutes Seconds (DMS)</li><li>Degrees Decimal Minutes (DDM)</li><li>Decimal Degrees (DD)</li><li>Geohash</li><li>Military Grid Reference System (MGRS)</li><li>Ordnance Survey National Grid (OSNG)</li><li>Universal Transverse Mercator (UTM)</li></ul><br>This operation will not work offline.";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "string";
        this.presentType = "html";
        this.args = [
            {
                name: "Zoom Level",
                type: "number",
                value: 13
            },
            {
                name: "Input Format",
                type: "option",
                value: ["Auto"].concat(FORMATS)
            },
            {
                name: "Input Delimiter",
                type: "option",
                value: [
                    "Auto",
                    "Direction Preceding",
                    "Direction Following",
                    "\\n",
                    "Comma",
                    "Semi-colon",
                    "Colon"
                ]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        // Pass the input through, don't need to do anything to it here
        return input;
    }

    /**
     * @param {string} data
     * @param {Object[]} args
     * @returns {string}
     */
    async present(data, args) {
        if (data.replace(/\s+/g, "") !== "") {
            const [zoomLevel, inFormat, inDelim] = args;
            let latLong;
            try {
                latLong = convertCoordinates(data, inFormat, inDelim, "Decimal Degrees", "Comma", "None", 5);
            } catch (error) {
                throw new OperationError(error);
            }
            latLong = latLong.replace(/[,]$/, "");
            latLong = latLong.replace(/°/g, "");
            const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                tileAttribution = "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
                leafletUrl = "https://unpkg.com/leaflet@1.4.0/dist/leaflet.js",
                leafletCssUrl = "https://unpkg.com/leaflet@1.4.0/dist/leaflet.css";
            return `<link rel="stylesheet" href="${leafletCssUrl}" crossorigin=""/>
<style>#output-html { white-space: normal; }</style>
<div id="presentedMap" style="width: 100%; height: 100%;"></div>
<script type="text/javascript">
    var mapscript = document.createElement('script');
    document.body.appendChild(mapscript);
    mapscript.onload = function() {
        var presentMap = L.map('presentedMap').setView([${latLong}], ${zoomLevel});
        L.tileLayer('${tileUrl}', {
            attribution: '${tileAttribution}'
        }).addTo(presentMap);

        L.marker([${latLong}]).addTo(presentMap)
            .bindPopup('${latLong}')
            .openPopup();
    };
    mapscript.src = "${leafletUrl}";
</script>`;
        } else {
            // Don't do anything if there's no input
            return "";
        }
    }
}

export default ShowOnMap;
