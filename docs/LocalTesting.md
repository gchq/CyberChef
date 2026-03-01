# Local Testing Guide for CyberChef

If you are developing new Cloud API capabilities (like the Google Translate operation) and you want to test them locally on your machine, follow these steps to spin up the local CyberChef development server.

## Prerequisites

1. **Node.js**: Ensure you have Node.js installed. CyberChef requires Node 16 or later.
   ```bash
   node -v
   ```
2. **NPM**: Ensure you have npm installed.
   ```bash
   npm -v
   ```

## Setup and Running

1. **Install Dependencies:**
   Open a terminal, navigate to the `CyberChefCloud` directory, and run:
   ```bash
   npm install
   ```
   *This might take a minute as it downloads everything required to build CyberChef.*

2. **Start the Development Server:**
   Run the following command to start the local instance:
   ```bash
   npm run start
   ```
   *This will run a Grunt task that compiles the web interface, resolves operations, and provisions a local HTTP server using Webpack Dev Server.*

3. **Access CyberChef:**
   By default, the server will host CyberChef on port 8080.
   - Open your web browser.
   - Go to `http://localhost:8080`.

## Testing the Translate Operation

1. With the local CyberChef instance open, type "Google Translate" into the **Operations** search bar in the top left.
2. Drag the `Google Translate` operation into the **Recipe** column.
3. In the **Input** column, type some text (e.g., "Hello world").
4. In the `Google Translate` operation configuration:
   - Make sure **Source Language** is correct (e.g., `en`).
   - Make sure **Target Language** is correct (e.g., `es`).
   - If using an API key, leave Auth Type as **API Key** and paste your API key into the **GCP Auth String** box.
   - *(Note: Ensure your API key restrictions at console.cloud.google.com temporarily allow `http://localhost:8080/*`).*
5. Check the **Manual Bake** checkbox at the bottom of the recipe column if it isn't checked by default, or just click **Bake!**.
6. The translated output should appear in the **Output** column.

## Advanced Testing (Command Line)

To ensure the CyberChef engine builds cleanly and passes its internal checks without UI verification, you can run the automated tests:
```bash
npm run test
```

## End-to-End Browser Testing (Nightwatch)

CyberChef is equipped with Nightwatch for end-to-end testing of features running in a real Chromium browser. This is extremely useful for Cloud Operations that cannot be easily tested within the headless NodeJS environment.

**Important Note on Authentication:** Google Identity Services (GIS), the library used for the secure **OAuth 2.0 (Web Application: PKCE)** flow, contains strict anti-automation reCAPTCHA logic. Because of this, it is nearly impossible to automate the Google Login popup using standard E2E frameworks like Nightwatch. Therefore, all automated Nightwatch tests utilize either **API Keys** or **Personal Access Tokens (PATs)** to authenticate. Manual testing is still required to verify the PKCE Popup flow works as expected for human users.

### Setting up Credentials

To prevent live API keys from being leaked in CI/CD, the Cloud API browser tests rely on local environment variables:
1. Copy the `.env.template` file to `.env`:
   ```bash
   cp .env.template .env
   ```
2. Open `.env` and replace `YOUR_API_KEY_HERE` with your actual Google Cloud API key for the `CYBERCHEF_GCP_TEST_KEY` variable. Ensure the API Key restrictions at console.cloud.google.com are set up to accept requests from `http://localhost:8080/*`.
3. If tests require a PAT, you must update `CYBERCHEF_GCP_TEST_TOKEN` with a fresh token obtained via `gcloud auth print-access-token` before running the tests.

### Running Nightwatch Tests

Once the `.env` file is prepared, you can trigger the entire browser suite:
```bash
npm run test:browser
```

Or just the Cloud Operations specifically:
```bash
npx nightwatch tests/browser/03_cloud_ops.js
```
*Note: Make sure your local CyberChef dev server (`npm run start`) is currently running on `localhost:8080`, as Nightwatch tests require a live application target!*

#### Troubleshooting (WSL/Linux Environments)
If your `nightwatch` tests immediately crash with ChromeDriver status `127` or `1`, your system may be missing Chromium's required graphical libraries. You can view exactly what is missing in `tests/browser/output/*_chromedriver.log`. You will typically need to install these packages on Ubuntu/Debian:
```bash
sudo apt update && sudo apt install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libpangocairo-1.0-0 libasound2
```
