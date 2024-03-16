/**
 * @author cod [sysenter.dev@gmail.com]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { WEBSOCKET_OPCODE } from "../lib/WebSocket.mjs";

/** WebSocket */
class WebSocketDecode extends Operation {

    /**
     * Default constructor
     */
    constructor() {
        super();

        this.name = "WebSocket Decode";
        this.module = "Code";
        this.description = "Converts a WebSocket encoded to JSON. WebSocket is computer communitions protocol, providing simultaneous two-way communication channels";
        this.infoURL = "https://wikipedia.org/wiki/WebSocket";
        this.inputType = "ArrayBuffer";
        this.outputType = "JSON";
        this.args = [];
    }

        /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    run(input, args) {
        try {
            let pos = 0;
            const buf = Buffer.from(new Uint8Array(input));

            if (buf.length < 2) {
                throw new OperationError("Expected size: 2 bytes");
            }

            let b0 = buf[0];
            let b1 = buf[1];

            const fin = (b0 & 0x80) === 0x80 ? true : false;
            const opcode = WEBSOCKET_OPCODE[b0 & 0x7f];
            let payloadLength = (b1 & 0x7f);

            pos = 2;
            const mask = (b1 & 0x80) === 0x80 ? true : false;
            const mask_size = (mask) ? 4 : 0;

            if (payloadLength < 126) {
                /** payload is less of 126 bytes */
                if (buf.length < (pos + payloadLength + mask_size))
                    throw new OperationError(`Expected size: ${(pos + payloadLength + mask_size)}`);
            } else if (payloadLength == 126) {
                /** payload is 2 bytes */
                pos += 2;
                payloadLength = buf.readUInt16BE(2);

                if (buf.length < (pos + payloadLength + mask_size))
                    throw new OperationError(`Expected size: ${(pos + payloadLength + mask_size)}`);

            } else if (payloadLength == 127) {
                pos += 8;
                payloadLength = buf.readUInt64BE(2);

                if (buf.length < (pos + payloadLength + mask_size))
                    throw new OperationError(`Expected size: ${(pos + payloadLength + mask_size)}`);
            }

            let maskBytes = Buffer.alloc(4);

            if (mask) {
                maskBytes[0] = buf[pos];
                maskBytes[1] = buf[pos+1];
                maskBytes[2] = buf[pos+2];
                maskBytes[3] = buf[pos+3];
                pos += 4;
            }

            let payload = buf.slice(pos, buf.length);

            if (mask) {
                for(var i = 0; i < payload.length; i++) {
                    payload[i] = payload[i] ^ maskBytes[i % 4];
                }
            }

            let content;

            if ((b0 & 1) === 1) {
                content = payload.toString();
            } else {
                content = payload.toString('hex');
            }

            const ws = {
                fin: fin,
                opcode: opcode,
                mask_present: mask,
                mask: maskBytes.toString('hex'),
                payloadLength: payloadLength,
                payload: content
            };

            return ws;
        } catch (err) {
            throw new OperationError(`Could not decode WebSocket to JSON: ${err}`);
        }
    }
}

export default WebSocketDecode;
