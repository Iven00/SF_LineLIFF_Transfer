# SF LINE LIFF Transfer

Static GitHub Pages landing page for QR code traffic. It opens LINE LIFF, captures the LINE user profile, records the QR source in Google Sheets through Google Apps Script, then redirects to the LINE official account add-friend URL.

## Deploy URL

GitHub Pages base:

`https://iven00.github.io/SF_LineLIFF_Transfer/`

Recommended QR URLs:

- `https://liff.line.me/2010021052-HtEE4Ehv?source=poster`
- `https://liff.line.me/2010021052-HtEE4Ehv?source=card`
- `https://liff.line.me/2010021052-HtEE4Ehv?source=mom_wang`
- `https://liff.line.me/2010021052-HtEE4Ehv?source=mom_FB`
- `https://liff.line.me/2010021052-HtEE4Ehv?source=mom_IG`
- `https://liff.line.me/2010021052-HtEE4Ehv?source=mom_YT`

GitHub Pages fallback URLs:

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

Apps Script Web App URL:

`https://script.google.com/macros/s/AKfycby07AU7Ben8e5GFdpH-nrKcHtFgm-POApnb_5UAkvuVcfI2unjbInEy86To8qL0yRgF/exec`

1. Open Google Apps Script.
2. Create a new project.
3. Copy `apps-script/Code.gs` into the project.
4. Deploy as a Web App.
5. Set access to allow the web app to receive requests from the landing page.
6. Copy the Web App URL.

### 2. Create LIFF App

LIFF ID:

`2010021052-HtEE4Ehv`

LIFF URL:

`https://liff.line.me/2010021052-HtEE4Ehv`

1. Open LINE Developers Console.
2. Create or open the provider and channel for the LINE official account.
3. Confirm the LIFF app endpoint URL is:

   `https://iven00.github.io/SF_LineLIFF_Transfer/join/`

### 3. Update Frontend Config

Edit `assets/js/config.js`:

```javascript
window.SF_LINE_TRANSFER_CONFIG = {
  LIFF_ID: "2010021052-HtEE4Ehv",
  APPS_SCRIPT_WEB_APP_URL: "https://script.google.com/macros/s/AKfycby07AU7Ben8e5GFdpH-nrKcHtFgm-POApnb_5UAkvuVcfI2unjbInEy86To8qL0yRgF/exec",
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

## Source Parameter Handling

The frontend supports both QR entry styles:

- Direct GitHub Pages URL: `?source=poster`
- LIFF URL state forwarding: `?liff.state=%3Fsource%3Dposter`

Use the LIFF URLs for QR codes so most users open the flow inside the LINE app instead of the external browser login page.
