# SF LINE LIFF Transfer

Static GitHub Pages landing page for QR code traffic. It opens LINE LIFF, captures the LINE user profile, records the QR source in Google Sheets through Google Apps Script, then redirects to the LINE official account add-friend URL.

## Deploy URL

GitHub Pages base:

`https://iven00.github.io/SF_LineLIFF_Transfer/`

Supported QR URLs:

- `https://iven00.github.io/SF_LineLIFF_Transfer/join?source=poster`
- `https://iven00.github.io/SF_LineLIFF_Transfer/join?source=card`
- `https://iven00.github.io/SF_LineLIFF_Transfer/join?source=mom_wang`
- `https://iven00.github.io/SF_LineLIFF_Transfer/join?source=mom_FB`
- `https://iven00.github.io/SF_LineLIFF_Transfer/join?source=mom_IG`
- `https://iven00.github.io/SF_LineLIFF_Transfer/join?source=mom_YT`

## Google Sheet

Sheet ID:

`1YKUInNATvHY1VNoFngw0NmROjkn1uSC-fX3iyOK0qgk`

The Apps Script writes to a sheet tab named `join_logs` with these columns:

- `timestamp`
- `lineUserId`
- `source`
- `displayName`
- `pictureUrl`
- `statusMessage`
- `userAgent`
- `pageUrl`

## Setup

### 1. Deploy Apps Script

1. Open Google Apps Script.
2. Create a new project.
3. Copy `apps-script/Code.gs` into the project.
4. Deploy as a Web App.
5. Set access to allow the web app to receive requests from the landing page.
6. Copy the Web App URL.

### 2. Create LIFF App

1. Open LINE Developers Console.
2. Create or open the provider and channel for the LINE official account.
3. Create a LIFF app.
4. Set the endpoint URL to:

   `https://iven00.github.io/SF_LineLIFF_Transfer/join/`

5. Copy the LIFF ID.

### 3. Update Frontend Config

Edit `assets/js/config.js`:

```javascript
window.SF_LINE_TRANSFER_CONFIG = {
  LIFF_ID: "your-liff-id",
  APPS_SCRIPT_WEB_APP_URL: "your-apps-script-web-app-url",
  LINE_OA_URL: "https://lin.ee/RbgiWMT",
  ALLOWED_SOURCES: ["poster", "card", "mom_wang", "mom_FB", "mom_IG", "mom_YT"]
};
```

### 4. Enable GitHub Pages

In the GitHub repository settings, enable GitHub Pages from the main branch root.

## Local Verification

Run:

```powershell
npm test
```

This checks the static route references, source values, OA URL, Apps Script Sheet ID, and expected sheet headers.
