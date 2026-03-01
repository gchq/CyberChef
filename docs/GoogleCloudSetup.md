# Google Cloud Setup Guide for CyberChef

To use Google Cloud capabilities (like Google Translate, Speech-to-Text, or Cloud Storage) within CyberChef, you need to configure a Google Cloud Project and obtain an authentication string. We strongly recommend using **OAuth 2.0 (Web Application: PKCE)** as it is the most secure method for browser-based applications like CyberChef.

By setting up a personal Cloud Project, your CyberChef instance communicates directly with your Google Cloud without a middleman. 

## Method 1: OAuth 2.0 (Web Application: PKCE) - Highly Recommended

This method uses your Google account and Google Identity Services to grant CyberChef temporary, secure access to your Google Cloud Project. Because CyberChef is a client-side architecture web app without a backend server, we use the Authorization Code Flow with Proof Key for Code Exchange (PKCE).

### Step 1: Create a Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click on the project dropdown at the top and select **New Project**.
3. Name your project (e.g., `cyberchef-personal`) and click **Create**.

### Step 2: Enable Required APIs
You must enable the APIs for any operation you intend to use.
1. In the Cloud Console search bar, type the name of the API and select it, then click **Enable**.
   - For **Google Translate**: Enable "Cloud Translation API" (requires billing enabled).
   - For **Speech-to-Text**: Enable "Cloud Speech-to-Text API".
   - For **Read/List Bucket**: Enable "Cloud Storage JSON API" (usually enabled by default).

### Step 3: Configure the OAuth Consent Screen
1. Navigate to **APIs & Services > OAuth consent screen** in the left sidebar.
2. Select **External** user type and click **Create**.
3. Fill in the required fields (App Name, User Support Email, Developer Contact Info). You can use your own email for all of these. Click **Save and Continue**.
4. Skip the **Scopes** section by clicking **Save and Continue**.
5. **CRITICAL STEP: Configure Test Users**.
   - Navigate to **APIs & Services > OAuth consent screen** > **Audience** > **Test Users** > **Add Users**
   - Type your own Google email address here (the one you use to login to the Cloud Console).
   - *(Since we will leave the app in "Testing" state forever, only users listed here can authenticate).*
   - **WARNING**: Do **NOT** click "Publish App". Leave the publishing status as "Testing". If you publish it, Google will require your app to undergo a verification process.

### Step 4: Create OAuth Client ID
1. Navigate to **APIs & Services > Credentials** in the left sidebar.
2. Click **+ CREATE CREDENTIALS** at the top and select **OAuth client ID**.
3. For **Application type**, select **Web application**. 
4. Name it something like "CyberChef PKCE Client".
5. Under **Authorized JavaScript origins**, click **ADD URI**.
   - For local testing, add: `http://localhost:8080`
   - For production, add your deployed CyberChef URL (e.g., `https://gchq.github.io`).
6. Click **Create**.
7. A box will appear with your **Client ID**. Copy this string. *(Note: You do not need the Client Secret).*

### Step 5: Authenticate in CyberChef
1. In CyberChef, add the **Authenticate Google Cloud** operation to the TOP of your recipe.
2. Set "Auth Type" to **OAuth 2.0 (Web Application: PKCE)**.
3. Paste your Client ID into the "Credentials" box.
4. Click **Bake**. CyberChef will popup a secure Google Login window. Your session token is now securely stored in your browser's Session Storage for the duration of the tab being open.

---

## Method 2: Temporary Personal Access Token (PAT)

If you have the Google Cloud SDK (`gcloud`) installed locally and you are authorized in your project, you can generate a short-lived token to use. This is secure because the token expires automatically.

1. Ensure you are logged into your `gcloud` CLI:
   ```bash
   gcloud auth login
   ```
2. Generate an access token:
   ```bash
   gcloud auth print-access-token
   ```
3. In CyberChef's **Authenticate Google Cloud** operation, set "Auth Type" to **Personal Access Token (PAT)** and paste the token output into the Credentials box.

---

## Method 3: API Key (For Simple APIs only)

*Warning: API Keys are not recommended for operations that access private data like Cloud Storage. They are best suited for simple APIs like Translation.*

1. **Create the API Key:**
    - Navigate to **APIs & Services > Credentials** in the left sidebar.
    - Click **+ CREATE CREDENTIALS** at the top and select **API Key**.
    - Your API Key will be generated. Copy this key.

2. **Secure the API Key (CRITICAL):**
    - Since CyberChef runs entirely in your browser, your API Key will be visible to anyone you share your CyberChef recipe with or who inspects the network traffic. you **MUST** restrict it.
    - Click on the newly created API Key to edit its settings.
    - Under **Application restrictions**, select **Websites**.
    - Under **Website restrictions**, click **ADD**.
    - Enter the URLs where your CyberChef instance is hosted (e.g., `https://gchq.github.io/CyberChef/*` or `http://localhost:8080/*` for local testing).
    - Under **API restrictions**, select **Restrict key** and check the relevant API (e.g., **Cloud Translation API**).
    - Click **SAVE**.

3. In CyberChef's **Authenticate Google Cloud** operation, set "Auth Type" to **API Key** and paste the key into the Credentials box.
