import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import forge from "node-forge";

/**
 * Public Key from CSR operation
 */
class PubKeyFromCSR extends Operation {

    /**
     * PubKeyFromCSR constructor
     */
    constructor() {
        super();

        this.name = "Public Key from CSR";
        this.module = "PublicKey";
        this.description = "Extracts the Public Key from a Certificate Signing Request.";
        this.infoURL = "https://en.wikipedia.org/wiki/Certificate_signing_request";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
        this.checks = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        let output = "";
        let match;
        const regex = /-----BEGIN (CERTIFICATE REQUEST)-----/g;
        while ((match = regex.exec(input)) !== null) {
            // find corresponding end tag
            const indexBase64 = match.index + match[0].length;
            const footer = `-----END ${match[1]}-----`;
            const indexFooter = input.indexOf(footer, indexBase64);
            if (indexFooter === -1) {
                throw new OperationError(`CSR footer '${footer}' not found`);
            }
            const csrString = input.substring(match.index, indexFooter + footer.length);
            let pubKey;
            try {
                // Parse the CSR and extract the public key.
                pubKey = forge.pki.certificationRequestFromPem(csrString).publicKey;
            } catch (err) {
                throw new OperationError(`Failed to parse CSR or extract public key: ${err}`);
            }

            // Convert the extracted public key object to PEM format.
            const pubKeyPem = forge.pki.publicKeyToPem(pubKey);
            output += pubKeyPem;
        }
        return output;
    }
}

export default PubKeyFromCSR;
