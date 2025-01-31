/**
 * @file Developed by {@link https://configuredthings.com Configured Things} with funding from the {@link https://www.ukri.org UKRI}
 *     {@link https://www.dsbd.tech Digital Security by Design} program.
 * @author Configured Things Ltd. <getconfigured@configuredthings.com>
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import mqtt from "mqtt";

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * MQTT Publish operation
 */
class MQTTPublish extends Operation {

    /**
     * MQTTPublish constructor
     */
    constructor() {
        super();

        this.name = "MQTT Publish";
        this.module = "MQTT";
        this.description = "Publishes a message to an MQTT broker";
        this.infoURL = "https://en.wikipedia.org/wiki/MQTT";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.args = [
            {
                name: "MQTT broker URL",
                type: "string",
                value: ""
            },
            {
                name: "Topic",
                type: "string",
                value: ""
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        const [broker, topic] = args;
        const mqttUrlRegex = /^(ws|mqtt)s?:\/\/(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]))*|([01]?[0-9][0-9]?|2[0-4][0-9]|25[0-5])(\.([01]?[0-9][0-9]?|2[0-4][0-9]|25[0-5])){3}|(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])))(:([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?/;
        const mqttTopicRegex = /^[\u0000-\uFFFF]+(\/[\u0000-\uFFFF]+)+$/;
        if (mqttUrlRegex.test(broker)) {
            if (mqttTopicRegex.test(broker)) {
                const client = mqtt.connect(broker);
                client.on("connect", () => {
                    client.publish(topic, Buffer.from(input));
                    client.end();
                });
            } else throw new OperationError(`Invalid MQTT topic name - ${topic}`);
        } else throw new OperationError(`Invalid MQTT broker URL - ${broker}`);
        return input;
    }
}

export default MQTTPublish;
