/**
 * JWT Decode and Verify operation.
 *
 * Shows the decoded header, decoded payload, and signature verification
 * status (valid / invalid / not verified) in a single JSON output.
 *
 * @author hl6226
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import jwt from "jsonwebtoken";
import r from "jsrsasign";
import OperationError from "../errors/OperationError.mjs";
import {JWT_ALGORITHMS} from "../lib/JWT.mjs";

/**
 * JWT Decode and Verify operation
 */
class JWTDecodeAndVerify extends Operation {

    /**
     * JWTDecodeAndVerify constructor
     */
    constructor() {
        super();

        this.name = "JWT Decode and Verify";
        this.module = "Ciphers";
        this.description = "Decodes a JSON Web Token and displays the <b>header</b>, <b>payload</b>, and <b>signature verification status</b>.<br><br>Provide a secret (for HMAC), PEM-encoded public key (for RSA/ECDSA) or JSON format public key (for JWKS) to verify the signature. Leave the key blank to decode without verification.<br><br>Output includes the decoded header, payload, and signature status: verified, invalid, or not checked.";
        this.infoURL = "https://wikipedia.org/wiki/JSON_Web_Token";
        this.inputType = "string";
        this.outputType = "JSON";
        this.presentType = "html";
        this.args = [
            {
                name: "Public/Secret Key (optional)",
                type: "text",
                value: "",
                hint: "Leave blank to decode without verifying the signature. To verify the signature, enter the public key as a secret (for HMAC), PEM-encoded public key (for RSA/ECDSA) or JSON format public key (for JWKS)"
            }
        ];
        this.checks = [
            {
                // Standard JWT: header.payload.signature (all base64url)
                pattern: "^ey[A-Za-z0-9_-]+\\.ey[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]*$",
                flags: "",
                args: [""]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {Object}
     */
    run(input, args) {
        const [key] = args;
        input = input.trim();

        // Decode without verification first to extract header + payload
        let decoded;
        try {
            decoded = jwt.decode(input, { complete: true, json: true });
        } catch (err) {
            throw new OperationError(`Failed to decode JWT: ${err.message}`);
        }

        if (!decoded) {
            throw new OperationError(
                "Invalid JWT: could not decode token. " +
                "Ensure the input is a valid base64url-encoded JWT."
            );
        }

        const result = {
            header: decoded.header,
            payload: decoded.payload,
            signatureVerified: "not verified",
            signatureWarning: "No key provided — signature was not checked."
        };

        // Attempt signature verification if a key was supplied
        if (key && key.trim() !== "") {
            const algos = JWT_ALGORITHMS.map(a => (a === "None" ? "none" : a));
            try {
                const alg = decoded.header.alg || "";
                let resolvedKey = key.trim();
                if (resolvedKey.startsWith("{") || resolvedKey.startsWith("[")) {
                    const parsed = JSON.parse(resolvedKey);
                    resolvedKey = Array.isArray(parsed) ? parsed[0] :
                        Array.isArray(parsed.keys) ? parsed.keys[0] : parsed;
                }
                const verifyKey = alg.startsWith("HS") ? { utf8: key.trim() } : r.KEYUTIL.getKey(resolvedKey);
                const valid = r.KJUR.jws.JWS.verify(input, verifyKey, algos);
                if (!valid) throw new Error("invalid signature");
                result.signatureVerified = true;
                result.signatureWarning = "Signature verified successfully.";
            } catch (err) {
                result.signatureVerified = false;
                result.signatureWarning = `Signature verification failed: ${err.message}`;
            }
        }

        return result;
    }

    /**
     * Presents the result as a formatted, human-readable string.
     *
     * @param {Object} data
     * @param {Object[]} args
     * @returns {string}
     */
    present(data, args) {
        if (typeof data !== "object" || data === null) return String(data);

        const G = "#52af6d";  // green  — signature
        const O = "#e08030";  // orange — header
        const P = "#b090d0";  // purple — payload
        const R = "#761c17";  // red   — failed

        const esc = s => String(s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        const colorJson = obj => esc(JSON.stringify(obj, null, 2))
            .replace(/\n/g, "<br>")
            .replace(/ /g, "&nbsp;");

        // Expiry notes
        let expiryNote = "";
        if (data.payload && typeof data.payload.exp === "number") {
            const expDate = new Date(data.payload.exp * 1000);
            const expired = expDate.getTime() < Date.now();
            expiryNote += `<br>&nbsp;&nbsp;exp&nbsp;&nbsp;: <span style="color:${P}">${esc(expDate.toUTCString())}${expired ? "&nbsp;&nbsp;⚠ TOKEN EXPIRED" : "&nbsp;&nbsp;✓ not yet expired"}</span>`;
        }
        if (data.payload && typeof data.payload.nbf === "number") {
            const nbfDate = new Date(data.payload.nbf * 1000);
            const notYet  = nbfDate.getTime() > Date.now();
            expiryNote += `<br>&nbsp;&nbsp;nbf&nbsp;&nbsp;: <span style="color:${P}">${esc(nbfDate.toUTCString())}${notYet ? "&nbsp;&nbsp;⚠ TOKEN NOT YET VALID" : "&nbsp;&nbsp;✓ valid"}</span>`;
        }
        if (data.payload && typeof data.payload.iat === "number") {
            const iatDate = new Date(data.payload.iat * 1000);
            expiryNote += `<br>&nbsp;&nbsp;iat&nbsp;&nbsp;: <span style="color:${P}">${esc(iatDate.toUTCString())}</span>`;
        }

        const sigIcon = data.signatureVerified === true ? "✓" :
            data.signatureVerified === false ? "✗" : "?";
        const sigColor = data.signatureVerified === true ? G :
            data.signatureVerified === false ? R : "";
        const sigMsg = sigColor ?
            `<span style="color:${sigColor}">${esc(data.signatureWarning)}</span>` :
            esc(data.signatureWarning);

        const hr = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

        return [
            hr, " <h4 style='color:#e08030'>HEADER</h4>", hr,
            `<span style="color:${O}">${colorJson(data.header)}</span>`,
            "",
            hr, " <h4 style='color:#b090d0'>PAYLOAD</h4>", hr,
            `<span style="color:${P}">${colorJson(data.payload)}</span>`,
            expiryNote ? `<br>Time-based claims:${expiryNote}` : "",
            "",
            hr, ` <h4 style="color:${G}">SIGNATURE&nbsp;&nbsp;${sigIcon}</h4>`, hr,
            sigMsg, ""
        ].join("<br>");
    }
}

export default JWTDecodeAndVerify;
