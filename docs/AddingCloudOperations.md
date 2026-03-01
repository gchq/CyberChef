# Guide: Adding New Google Cloud Operations to CyberChef

With the introduction of the Google Identity Services (GIS) Web Application PKCE flow and strict Content Security Policies (CSP), adding new Google Cloud operations requires a few extra steps compared to standard CyberChef operations.

This guide outlines the exact process for creating, securing, and testing a new Google Cloud integration.

## 1. Create the Operation File
Create your new operation in `src/core/operations/` (e.g., `GCloudVisionAnalyze.mjs`).
Include the standard CyberChef operation scaffolding and ensure you import the authentication utilities from `GoogleCloud.mjs`:

```javascript
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { applyGCPAuth } from "../lib/GoogleCloud.mjs";

class GCloudVisionAnalyze extends Operation {
    constructor() {
        super();
        this.name = "GCloud Vision Analyze";
        this.module = "Cloud";
        this.description = "Analyzes an image using Google Cloud Vision.";
        this.infoURL = "https://cloud.google.com/vision/docs";
        this.inputType = "ArrayBuffer";
        this.outputType = "JSON";
        this.args = [
            /* Your args */
        ];
    }
```

## 2. Leverage `applyGCPAuth`
**Do not** add authentication fields (like API keys or tokens) directly into your new operation's `args`. 
Instead, instruct the user (via the `description`) to place the `Authenticate Google Cloud` operation at the top of their recipe. 

Inside your `run` method, use `applyGCPAuth` to seamlessly inject the credentials. This handles API Keys, Personal Access Tokens (PATs), and the GIS OAuth Tokens interchangeably:

```javascript
    async run(input, args) {
        let url = "https://vision.googleapis.com/v1/images:annotate";
        let headers = { "Content-Type": "application/json" };
        
        // 1. Inject Auth into URL or Headers
        try {
            [url, headers] = applyGCPAuth(url, headers);
        } catch (e) {
            throw new OperationError(e.message);
        }

        // 2. Perform Fetch
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ /* payload */ })
        });

        // 3. Handle response...
    }
```

## 3. Update Content Security Policy (CSP)
CyberChef utilizes strict CSP headers to prevent XSS attacks from exfiltrating the OAuth tokens stored in `sessionStorage`.
If your new operation contacts a new Google API endpoint, **the request will be blocked by the browser** unless you whitelist it.

1. Open `src/web/html/index.html`.
2. Locate the `<meta http-equiv="Content-Security-Policy">` tag in the `<head>`.
3. Find the `connect-src` directive.
4. Append your new API endpoint (e.g., `https://vision.googleapis.com`).

Example:
```html
<meta http-equiv="Content-Security-Policy" content="... connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com https://storage.googleapis.com https://speech.googleapis.com https://translation.googleapis.com https://vision.googleapis.com;" />
```

## 4. Testing End-to-End (Nightwatch)

Because the PKCE OAuth flow relies on a popup protected by anti-bot measures (reCAPTCHA) from Google Identity Services, **it cannot be fully automated** with headless browsers like Nightwatch. 

For E2E tests, you **must use** either an API Key or a PAT (`CYBERCHEF_GCP_TEST_KEY` or `CYBERCHEF_GCP_TEST_TOKEN`).

1. Open `tests/browser/03_cloud_ops.js`.
2. Create your test suite.
3. Use the PAT or API Key fallback logic present in other tests to inject credentials into your dummy recipe:

```javascript
    "GCloud Vision Analyze: Translates image to text": function (browser) {
        let testToken = process.env.CYBERCHEF_GCP_TEST_TOKEN;
        
        // Fallback to gcloud SDK if CYBERCHEF_GCP_TEST_TOKEN isn't set manually
        if (!testToken || testToken === "YOUR_OAUTH_TOKEN_HERE") {
            try {
                testToken = require("child_process").execSync("gcloud auth print-access-token", { stdio: "pipe", encoding: "utf-8" }).trim();
            } catch (e) {
                console.log("No valid token found. Skipping live Vision API test.");
                return;
            }
        }

        browserUtils.loadRecipeConfig(browser, [
            {
                op: "Authenticate Google Cloud",
                args: [
                    "Personal Access Token (PAT)",
                    { option: "UTF8", string: testToken },
                    "cyberchefcloud",
                    true
                ]
            },
            {
                op: "GCloud Vision Analyze",
                args: []
            }
        ], "Dummy Input data...");

        browser.waitForElementNotVisible("#snackbar-container", 6000);
        browserUtils.bake(browser);
        browser.pause(5000);
        
        // Assert output
    }
```

Run tests with `npm run test:browser` or `npx nightwatch tests/browser/03_cloud_ops.js` (while `npm run start` is running locally).
