# LINE LIFF QR Code Transfer Landing Page Design

## Purpose

Build a one-page GitHub Pages landing flow for QR codes that opens LINE LIFF, captures the LINE user ID, records the QR source into Google Sheets through Google Apps Script, then redirects the visitor to the official LINE account add-friend URL.

The project will be deployed to:

`https://iven00.github.io/SF_LineLIFF_Transfer/`

## Confirmed Inputs

- Repository: `https://github.com/Iven00/SF_LineLIFF_Transfer.git`
- GitHub Pages base URL: `https://iven00.github.io/SF_LineLIFF_Transfer/`
- Google Sheet ID: `1YKUInNATvHY1VNoFngw0NmROjkn1uSC-fX3iyOK0qgk`
- Google Sheet URL: `https://docs.google.com/spreadsheets/d/1YKUInNATvHY1VNoFngw0NmROjkn1uSC-fX3iyOK0qgk/edit?usp=sharing`
- LINE OA redirect URL: `https://lin.ee/RbgiWMT`
- LIFF ID: not created yet; the project will expose this as a configuration value.
- Apps Script Web App URL: not created yet; the project will expose this as a configuration value.
- Local computer is already logged in to GitHub for pushing the finished repository.

## Supported QR Source URLs

The landing page must support these QR code entry URLs:

- `https://iven00.github.io/SF_LineLIFF_Transfer/join?source=poster`
- `https://iven00.github.io/SF_LineLIFF_Transfer/join?source=card`
- `https://iven00.github.io/SF_LineLIFF_Transfer/join?source=mom_wang`
- `https://iven00.github.io/SF_LineLIFF_Transfer/join?source=mom_FB`
- `https://iven00.github.io/SF_LineLIFF_Transfer/join?source=mom_IG`
- `https://iven00.github.io/SF_LineLIFF_Transfer/join?source=mom_YT`

The page should still accept unknown future `source` values, but the README will document the confirmed values above.

## Recommended Architecture

Use a static GitHub Pages frontend plus a Google Apps Script Web App.

This avoids a separate Node.js server while still allowing the frontend to write records into Google Sheets. GitHub Pages serves the LIFF page, LIFF obtains the LINE profile, and Apps Script handles trusted spreadsheet writes.

## Data Flow

1. User scans a QR code.
2. Browser opens `/join?source=<source>`.
3. Frontend stores the source in local storage and starts LIFF.
4. If the visitor is not logged in to LINE, LIFF triggers login.
5. After login, LIFF returns to the same page.
6. Frontend calls `liff.getProfile()`.
7. Frontend POSTs profile and source data to the Apps Script Web App.
8. Apps Script appends a row to the configured Google Sheet.
9. Frontend redirects the visitor to `https://lin.ee/RbgiWMT`.
10. LINE OA webhook binding happens outside this static page after the user joins the official account.

## Frontend Design

The frontend will be a small static web app that can run on GitHub Pages.

### Routes

GitHub Pages does not run a server router. To support `/join?source=...`, the project will include a `join/index.html` page. The effective deployed URL will be:

`https://iven00.github.io/SF_LineLIFF_Transfer/join?source=poster`

### Runtime Configuration

The frontend will keep editable deployment values in one configuration file:

- `LIFF_ID`
- `APPS_SCRIPT_WEB_APP_URL`
- `LINE_OA_URL`
- `ALLOWED_SOURCES`

Because LIFF and Apps Script are not created yet, the first implementation will include obvious placeholder values and visible error states if configuration is missing.

### User Experience

The page should be simple and operational rather than marketing-heavy. It should show a clear loading state while LINE login, profile fetch, and save are happening.

If configuration is missing or saving fails, the page should show a clear error message instead of silently redirecting. If saving succeeds, the page should redirect automatically to the LINE OA URL.

## Google Apps Script Design

The repository will include an `apps-script/Code.gs` file for the user to copy into Apps Script.

The script will:

- Open the confirmed spreadsheet by ID.
- Ensure a target sheet exists, such as `join_logs`.
- Append one row per successful LIFF profile capture.
- Return JSON responses for success and failure.
- Include CORS-compatible handling for browser POST requests.

### Sheet Columns

The expected Google Sheet columns are:

- `timestamp`
- `lineUserId`
- `source`
- `displayName`
- `pictureUrl`
- `statusMessage`
- `userAgent`
- `pageUrl`

## Error Handling

Frontend error cases:

- Missing `LIFF_ID`
- Missing `APPS_SCRIPT_WEB_APP_URL`
- Missing or empty `source`
- LIFF initialization failure
- LINE login/profile failure
- Apps Script save failure

Apps Script error cases:

- Invalid JSON body
- Missing `userId`
- Spreadsheet access failure
- Row append failure

Errors should be visible during testing and logged to the browser console. Successful production flow should redirect to the OA URL.

## Testing And Verification

Local/static verification:

- Confirm project files exist.
- Confirm `/join/index.html` references the configuration and app scripts correctly.
- Confirm default placeholders produce a visible configuration error.

Deployment verification after LIFF and Apps Script setup:

- Open each supported QR source URL.
- Confirm LIFF login starts.
- Confirm LINE profile can be read.
- Confirm a row is appended to Google Sheet.
- Confirm redirect goes to `https://lin.ee/RbgiWMT`.

## GitHub Deployment

Implementation will:

- Initialize the repository if needed.
- Add the remote `https://github.com/Iven00/SF_LineLIFF_Transfer.git`.
- Commit the completed static site, Apps Script template, and README.
- Push to GitHub.

GitHub Pages itself must be enabled in the repository settings if it is not already enabled.

## Out Of Scope

- Implementing LINE OA webhook binding logic.
- Hosting a Node.js backend.
- Creating the LIFF app automatically in LINE Developers.
- Deploying Apps Script automatically.
- Generating QR code image files.

## Open Setup Steps After Implementation

The finished repository will still require these user-side setup steps:

1. Create a LIFF app in LINE Developers.
2. Set the LIFF endpoint URL to the deployed GitHub Pages join page.
3. Paste the LIFF ID into the frontend configuration.
4. Create and deploy the Apps Script Web App.
5. Paste the Apps Script Web App URL into the frontend configuration.
6. Enable GitHub Pages for the repository.
