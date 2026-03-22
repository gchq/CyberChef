import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import forge from "node-forge";

const { asn1, pki, util } = forge;

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
            const indexBase64 = match.index + match[0].length;
            const footer = `-----END ${match[1]}-----`;
            const indexFooter = input.indexOf(footer, indexBase64);
            if (indexFooter === -1) {
                throw new OperationError(`CSR footer '${footer}' not found`);
            }
            const csrString = input.substring(match.index, indexFooter + footer.length);

            let pubKeyPem;
            try {
                // RSA
                const csr = pki.certificationRequestFromPem(csrString);
                pubKeyPem = pki.publicKeyToPem(csr.publicKey);
            } catch (e) {
                if (!e.message.includes("OID is not RSA")) {
                    throw new OperationError(`Failed to parse CSR or extract public key: ${e}`);
                }
                // EC
                try {
                    const csrDer = util.decode64(
                        csrString
                            .replace("-----BEGIN CERTIFICATE REQUEST-----", "")
                            .replace("-----END CERTIFICATE REQUEST-----", "")
                            .replace(/\s+/g, "")
                    );
                    const csrAsn1 = asn1.fromDer(csrDer);
                    const certReqInfo = csrAsn1.value[0];
                    const spki = certReqInfo.value[2];
                    const spkiDer = asn1.toDer(spki).getBytes();
                    const spkiB64 = util.encode64(spkiDer);
                    pubKeyPem = `-----BEGIN PUBLIC KEY-----\n${spkiB64.match(/.{1,64}/g).join("\n")}\n-----END PUBLIC KEY-----\n`;
                } catch (err) {
                    throw new OperationError(`Failed to parse CSR or extract public key: ${err}`);
                }
            }

            output += pubKeyPem;
        }
        return output;
    }
}

export default PubKeyFromCSR;
