/**
 * @author CyberChefCloud
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { set_gcp_credentials, get_gcp_credentials } from "../lib/GoogleCloud.mjs";
import { isWorkerEnvironment } from "../Utils.mjs";

/**
 * Authenticate Google Cloud operation
 */
class AuthenticateGoogleCloud extends Operation {

    /**
     * AuthenticateGoogleCloud constructor
     */
    constructor() {
        super();

        this.name = "Authenticate Google Cloud";
        this.module = "Cloud";
        this.description = [
            "Authenticates with Google Cloud Platform.",
            "<br><br>",
            "This operation should be placed at the top of your recipe. It securely manages credentials for downstream Google Cloud operations (e.g. List Bucket, Read File, Speech-to-Text).",
            "<br><br>",
            "You can authenticate using:",
            "<ul>",
            "<li><b>OAuth 2.0 (Web Application: PKCE)</b>: The recommended, secure method. Provide your Web Application Client ID. CyberChef will popup a secure Google login window. The token is stored per-session and cleared when you close the tab.</li>",
            "<li><b>Personal Access Token (PAT)</b>: Provide a short-lived bearer token (e.g. from <code>gcloud auth print-access-token</code>).</li>",
            "<li><b>API Key</b>: Provide a Google Cloud API key. (Less secure, ensure it is restricted).</li>",
            "</ul>"
        ].join("\n");
        this.infoURL = "https://cloud.google.com/docs/authentication";
        this.inputType = "string";
        this.outputType = "string";
        this.manualBake = true; // AutoBake must be disabled to prevent spamming the OAuth API
        this.args = [
            {
                "name": "Auth Type",
                "type": "option",
                "value": ["OAuth 2.0 (Web Application: PKCE)", "Personal Access Token (PAT)", "API Key"]
            },
            {
                "name": "Credentials (Client ID, PAT, or API Key)",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["UTF8", "Latin1", "Base64", "Hex"]
            },
            {
                "name": "Quota Project (OAuth only)",
                "type": "string",
                "value": ""
            },
            {
                "name": "Output Logs",
                "type": "boolean",
                "value": true
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const [authType, credObj, quotaProject, outputLogs] = args;
        const credString = typeof credObj === "string" ? credObj : (credObj.string || "");

        if (!credString) {
            throw new OperationError("Please provide Google Cloud credentials (Client ID, PAT, or API Key).");
        }

        let logs = "";
        const log = (msg) => {
            if (outputLogs) logs += msg + "\n";
            // Also send to the UI status bar if in worker
            if (isWorkerEnvironment()) self.sendStatusMessage(msg);
        };

        log("Starting Google Cloud Authentication...");

        // If not using the Web App PKCE Flow, just cache the PAT/API Key and return.
        if (authType !== "OAuth 2.0 (Web Application: PKCE)") {
            set_gcp_credentials({
                authType: authType,
                authString: credString,
                quotaProject: quotaProject
            });
            log(`Successfully configured ${authType}.`);
            return logs ? (logs + "\n" + input) : input;
        }

        // --- OAuth 2.0 Web Application (PKCE) Flow ---

        // 1. Check if we already have a valid token for this Client ID in the session
        const existingCreds = get_gcp_credentials();
        if (existingCreds && existingCreds.authType === "OAuth 2.0 (Web Application: PKCE)" && existingCreds.clientId === credString) {
            if (existingCreds.expiresAt > Date.now()) {
                log("Reusing valid existing OAuth session token.");
                return logs ? (logs + "\n" + input) : input;
            }
            log("Existing OAuth token expired. A new authorization is required.");
        }

        // 2. Pause the Web Worker and ask the Main UI to pop the GIS login window
        log("Requesting Google Login Popup (Check your browser windows)...");

        // We use a Promise to halt the `run` method until the UI sends back the token
        const tokenData = await new Promise((resolve, reject) => {

            // Temporary message listener to catch the response from the UI
            const messageHandler = function (e) {
                const r = e.data;
                if (r.action === "gcpAuthResponse") {
                    self.removeEventListener("message", messageHandler);
                    if (r.data.error) {
                        reject(new OperationError(`Google OAuth Error: ${r.data.error}`));
                    } else if (r.data.token) {
                        resolve(r.data);
                    } else {
                        reject(new OperationError("Google OAuth Error: UI returned unexpected empty token payload."));
                    }
                }
            };
            self.addEventListener("message", messageHandler);

            // Trigger the UI
            // Assuming this operation is executed within a ChefWorker, we bubble up `gcpAuthRequest`
            // and we must include `inputNum` so WorkerWaiter knows which worker to send the response back to.
            if (!isWorkerEnvironment()) {
                reject(new OperationError("OAuth PKCE Flow can only run in a Web Worker environment. For manual node testing, use PAT or API Key auth types."));
                return;
            }

            self.postMessage({
                action: "gcpAuthRequest",
                data: {
                    clientId: credString,
                    inputNum: self.inputNum || 0
                }
            });
        });

        log("Authorization successful!");
        log(`Access token retrieved. Expires in ${tokenData.expires_in} seconds.`);

        // 3. Cache the credentials for downstream operations
        set_gcp_credentials({
            authType: "OAuth 2.0 (Web Application: PKCE)",
            authString: tokenData.token,
            quotaProject: quotaProject,
            clientId: credString,
            expiresAt: Date.now() + (tokenData.expires_in * 1000)
        });

        return logs ? (logs + "\n" + input) : input;
    }

}

export default AuthenticateGoogleCloud;
