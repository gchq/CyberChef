/**
 * @author gchq77703 []
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";

/**
 * Play Audio operation
 */
class PlayAudio extends Operation {

    /**
     * PlayAudio constructor
     */
    constructor() {
        super();

        this.name = "Play Audio";
        this.module = "Default";
        this.description = "Plays an audio file from a base 64 encoded data URI.  URI must contain a valid audio mediatype.";
        this.infoURL = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs";
        this.inputType = "string";
        this.outputType = "string";
        this.presentType = "html";
        this.args = [];
    }

    /**
     * Presents a given Data URI as an audio element.
     *
     * @param {String} input
     * @returns {String}
     */
    present(input) {
        const type = input.split(";")[0].split(":")[1];
        const binary = Utils.convertDataURIToBinary(input);
        const blob = new Blob([binary], { type: type });
        const src = URL.createObjectURL(blob);


        return `<audio id="audio" controls>
                    <source id="audioSource" src="${src}" type="${type}"/>
                </audio>`;
    }

    /**
     * @param {String} input
     * @param {Object[]} args
     * @returns {String}
     */
    run(input, args) {
        return input;
    }

}

export default PlayAudio;
