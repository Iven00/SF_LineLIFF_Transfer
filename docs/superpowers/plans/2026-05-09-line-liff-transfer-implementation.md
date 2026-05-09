# LINE LIFF Transfer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a GitHub Pages static LIFF landing flow that records LINE user profile and QR source data into Google Sheets through Google Apps Script, then redirects to the configured LINE OA URL.

**Architecture:** The app is static HTML/CSS/JS served from GitHub Pages under `/SF_LineLIFF_Transfer/`. The `/join/index.html` page loads LIFF, reads `source`, saves the profile payload to an Apps Script Web App, and redirects to LINE OA. Apps Script owns spreadsheet writes to the confirmed Google Sheet.

**Tech Stack:** Plain HTML, CSS, JavaScript, LINE LIFF SDK, Google Apps Script, Google Sheets, GitHub Pages, Node.js built-in test runner for local static checks.

---

## File Structure

- Create: `index.html`
  - Redirects users from the repository root to `join/` while preserving query parameters.
- Create: `join/index.html`
  - Static LIFF landing page markup.
- Create: `assets/css/styles.css`
  - Operational loading/error UI styling.
- Create: `assets/js/config.js`
  - Editable deployment values: LIFF ID, Apps Script Web App URL, OA URL, supported sources.
- Create: `assets/js/join.js`
  - Main LIFF flow, source parsing, Apps Script POST, redirect, and error rendering.
- Create: `apps-script/Code.gs`
  - Apps Script Web App handler that appends LIFF join rows to the confirmed spreadsheet.
- Create: `tests/static.test.mjs`
  - Local tests that verify required files, configuration keys, source list, Sheet ID, and route references.
- Create: `package.json`
  - Provides `npm test` using Node's built-in test runner.
- Create: `README.md`
  - Setup guide for LIFF, Apps Script, GitHub Pages, and QR source URLs.
- Create: `.gitignore`
  - Keeps local scratch files out of git.

---

### Task 1: Static Page Skeleton

**Files:**
- Create: `index.html`
- Create: `join/index.html`
- Create: `assets/css/styles.css`
- Create: `.gitignore`

- [ ] **Step 1: Add `.gitignore`**

Create `.gitignore`:

```gitignore
.DS_Store
Thumbs.db
node_modules/
.superpowers/
```

- [ ] **Step 2: Add root redirect page**

Create `index.html`:

```html
<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>LINE 加入好友導向</title>
    <meta http-equiv="refresh" content="0; url=join/">
    <script>
      const target = new URL("join/", location.href);
      target.search = location.search;
      location.replace(target.href);
    </script>
  </head>
  <body>
    <p>正在前往 LINE 加入好友頁面...</p>
  </body>
</html>
```

- [ ] **Step 3: Add join page markup**

Create `join/index.html`:

```html
<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>LINE 加入好友導向</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <script src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
    <script src="../assets/js/config.js" defer></script>
    <script src="../assets/js/join.js" defer></script>
  </head>
  <body>
    <main class="page-shell" aria-live="polite">
      <section class="status-panel">
        <div class="brand-mark">SF</div>
        <h1>正在連接 LINE</h1>
        <p id="status-message">請稍候，我們正在準備加入好友流程。</p>
        <p id="source-label" class="source-label"></p>
        <div class="loader" aria-hidden="true"></div>
        <a id="manual-link" class="manual-link" href="https://lin.ee/RbgiWMT" hidden>前往 LINE 官方帳號</a>
      </section>
    </main>
  </body>
</html>
```

- [ ] **Step 4: Add CSS**

Create `assets/css/styles.css`:

```css
:root {
  color-scheme: light;
  --ink: #17202a;
  --muted: #59636e;
  --line: #06c755;
  --surface: #ffffff;
  --background: #f5f7f4;
  --error: #b42318;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--ink);
  background:
    radial-gradient(circle at top left, rgba(6, 199, 85, 0.16), transparent 32rem),
    var(--background);
}

.page-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.status-panel {
  width: min(100%, 420px);
  padding: 32px 28px;
  border: 1px solid rgba(23, 32, 42, 0.08);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: 0 16px 48px rgba(23, 32, 42, 0.10);
  text-align: center;
}

.brand-mark {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  margin: 0 auto 18px;
  border-radius: 8px;
  background: var(--line);
  color: white;
  font-weight: 800;
  letter-spacing: 0;
}

h1 {
  margin: 0 0 12px;
  font-size: 28px;
  line-height: 1.2;
}

p {
  margin: 0;
  color: var(--muted);
  line-height: 1.7;
}

.source-label {
  margin-top: 12px;
  font-size: 14px;
}

.loader {
  width: 34px;
  height: 34px;
  margin: 24px auto 0;
  border: 3px solid rgba(6, 199, 85, 0.18);
  border-top-color: var(--line);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.manual-link {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 44px;
  margin-top: 22px;
  padding: 0 18px;
  border-radius: 8px;
  background: var(--line);
  color: white;
  font-weight: 700;
  text-decoration: none;
}

.status-panel.is-error h1,
.status-panel.is-error p {
  color: var(--error);
}

.status-panel.is-error .loader {
  display: none;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

- [ ] **Step 5: Commit skeleton**

Run:

```powershell
git add index.html join/index.html assets/css/styles.css .gitignore
git commit -m "feat: add static landing page skeleton"
```

Expected: commit succeeds with the four created files.

---

### Task 2: LIFF Frontend Flow

**Files:**
- Create: `assets/js/config.js`
- Create: `assets/js/join.js`
- Modify: `join/index.html`

- [ ] **Step 1: Add runtime configuration**

Create `assets/js/config.js`:

```javascript
window.SF_LINE_TRANSFER_CONFIG = {
  LIFF_ID: "REPLACE_WITH_LIFF_ID",
  APPS_SCRIPT_WEB_APP_URL: "REPLACE_WITH_APPS_SCRIPT_WEB_APP_URL",
  LINE_OA_URL: "https://lin.ee/RbgiWMT",
  ALLOWED_SOURCES: ["poster", "card", "mom_wang", "mom_FB", "mom_IG", "mom_YT"]
};
```

- [ ] **Step 2: Add LIFF join logic**

Create `assets/js/join.js`:

```javascript
(function () {
  const config = window.SF_LINE_TRANSFER_CONFIG || {};
  const statusPanel = document.querySelector(".status-panel");
  const statusMessage = document.querySelector("#status-message");
  const sourceLabel = document.querySelector("#source-label");
  const manualLink = document.querySelector("#manual-link");

  function setStatus(message) {
    statusMessage.textContent = message;
  }

  function showError(message) {
    statusPanel.classList.add("is-error");
    document.querySelector("h1").textContent = "流程暫時無法完成";
    setStatus(message);
    manualLink.hidden = false;
  }

  function isPlaceholder(value) {
    return !value || value.startsWith("REPLACE_WITH_");
  }

  function readSource() {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("source") || "";
    if (source) {
      localStorage.setItem("join_source", source);
      return source;
    }
    return localStorage.getItem("join_source") || "";
  }

  function validateConfig() {
    if (isPlaceholder(config.LIFF_ID)) {
      throw new Error("尚未設定 LIFF ID，請先更新 assets/js/config.js。");
    }
    if (isPlaceholder(config.APPS_SCRIPT_WEB_APP_URL)) {
      throw new Error("尚未設定 Apps Script Web App URL，請先更新 assets/js/config.js。");
    }
    if (!config.LINE_OA_URL) {
      throw new Error("尚未設定 LINE OA URL。");
    }
  }

  async function saveJoinLog(profile, source) {
    const payload = {
      userId: profile.userId,
      displayName: profile.displayName || "",
      pictureUrl: profile.pictureUrl || "",
      statusMessage: profile.statusMessage || "",
      source,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent
    };

    const response = await fetch(config.APPS_SCRIPT_WEB_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.error || "資料寫入 Google Sheet 失敗。");
    }
  }

  async function main() {
    try {
      validateConfig();
      manualLink.href = config.LINE_OA_URL;

      const source = readSource();
      if (!source) {
        throw new Error("網址缺少 source 參數，請確認 QR Code 連結。");
      }

      sourceLabel.textContent = `來源：${source}`;

      if (Array.isArray(config.ALLOWED_SOURCES) && !config.ALLOWED_SOURCES.includes(source)) {
        console.warn(`Unknown source received: ${source}`);
      }

      setStatus("正在啟動 LINE 登入...");
      await liff.init({ liffId: config.LIFF_ID });

      if (!liff.isLoggedIn()) {
        setStatus("正在前往 LINE 登入...");
        liff.login({ redirectUri: window.location.href });
        return;
      }

      setStatus("正在取得 LINE 使用者資料...");
      const profile = await liff.getProfile();

      setStatus("正在記錄加入來源...");
      await saveJoinLog(profile, source);

      setStatus("完成，正在前往 LINE 官方帳號...");
      window.location.replace(config.LINE_OA_URL);
    } catch (error) {
      console.error(error);
      showError(error.message || "發生未知錯誤，請稍後再試。");
    }
  }

  main();
})();
```

- [ ] **Step 3: Verify script references**

Run:

```powershell
Select-String -Path join\index.html -Pattern "config.js","join.js","liff"
```

Expected: output includes the LIFF SDK, `../assets/js/config.js`, and `../assets/js/join.js`.

- [ ] **Step 4: Commit LIFF flow**

Run:

```powershell
git add assets/js/config.js assets/js/join.js join/index.html
git commit -m "feat: add LIFF join flow"
```

Expected: commit succeeds.

---

### Task 3: Apps Script Sheet Writer

**Files:**
- Create: `apps-script/Code.gs`

- [ ] **Step 1: Add Apps Script Web App code**

Create `apps-script/Code.gs`:

```javascript
const SPREADSHEET_ID = '1YKUInNATvHY1VNoFngw0NmROjkn1uSC-fX3iyOK0qgk';
const SHEET_NAME = 'join_logs';
const HEADERS = [
  'timestamp',
  'lineUserId',
  'source',
  'displayName',
  'pictureUrl',
  'statusMessage',
  'userAgent',
  'pageUrl'
];

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    validatePayload_(payload);

    const sheet = getLogSheet_();
    sheet.appendRow([
      new Date(),
      payload.userId,
      payload.source || '',
      payload.displayName || '',
      payload.pictureUrl || '',
      payload.statusMessage || '',
      payload.userAgent || '',
      payload.pageUrl || ''
    ]);

    return json_({ ok: true });
  } catch (error) {
    return json_({ ok: false, error: error.message });
  }
}

function doGet() {
  return json_({
    ok: true,
    service: 'SF LINE LIFF Transfer',
    sheetName: SHEET_NAME
  });
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Missing request body');
  }
  return JSON.parse(e.postData.contents);
}

function validatePayload_(payload) {
  if (!payload.userId) {
    throw new Error('Missing userId');
  }
}

function getLogSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  const currentHeaders = headerRange.getValues()[0];
  const hasHeaders = currentHeaders.some(Boolean);
  if (!hasHeaders) {
    headerRange.setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function json_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
```

- [ ] **Step 2: Confirm Sheet ID appears in script**

Run:

```powershell
Select-String -Path apps-script\Code.gs -Pattern "1YKUInNATvHY1VNoFngw0NmROjkn1uSC-fX3iyOK0qgk","join_logs"
```

Expected: output includes the confirmed Sheet ID and `join_logs`.

- [ ] **Step 3: Commit Apps Script template**

Run:

```powershell
git add apps-script/Code.gs
git commit -m "feat: add Apps Script sheet writer"
```

Expected: commit succeeds.

---

### Task 4: Static Verification Tests

**Files:**
- Create: `package.json`
- Create: `tests/static.test.mjs`

- [ ] **Step 1: Add package test script**

Create `package.json`:

```json
{
  "name": "sf-line-liff-transfer",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "node --test tests/static.test.mjs"
  }
}
```

- [ ] **Step 2: Add static tests**

Create `tests/static.test.mjs`:

```javascript
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

async function text(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("join page loads LIFF SDK and app scripts", async () => {
  const html = await text("join/index.html");
  assert.match(html, /static\.line-scdn\.net\/liff\/edge\/2\/sdk\.js/);
  assert.match(html, /\.\.\/assets\/js\/config\.js/);
  assert.match(html, /\.\.\/assets\/js\/join\.js/);
});

test("configuration includes confirmed OA URL and source values", async () => {
  const config = await text("assets/js/config.js");
  for (const source of ["poster", "card", "mom_wang", "mom_FB", "mom_IG", "mom_YT"]) {
    assert.match(config, new RegExp(`"${source}"`));
  }
  assert.match(config, /https:\/\/lin\.ee\/RbgiWMT/);
});

test("Apps Script targets the confirmed spreadsheet and sheet", async () => {
  const script = await text("apps-script/Code.gs");
  assert.match(script, /1YKUInNATvHY1VNoFngw0NmROjkn1uSC-fX3iyOK0qgk/);
  assert.match(script, /join_logs/);
  for (const header of ["timestamp", "lineUserId", "source", "displayName", "pictureUrl", "statusMessage", "userAgent", "pageUrl"]) {
    assert.match(script, new RegExp(`'${header}'`));
  }
});

test("root page redirects into join route", async () => {
  const html = await text("index.html");
  assert.match(html, /url=join\//);
  assert.match(html, /location\.replace\(target\.href\)/);
});
```

- [ ] **Step 3: Run tests**

Run:

```powershell
npm test
```

Expected: all four tests pass.

- [ ] **Step 4: Commit tests**

Run:

```powershell
git add package.json tests/static.test.mjs
git commit -m "test: add static project verification"
```

Expected: commit succeeds.

---

### Task 5: Setup Documentation

**Files:**
- Create: `README.md`

- [ ] **Step 1: Add README**

Create `README.md`:

```markdown
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
```

- [ ] **Step 2: Commit README**

Run:

```powershell
git add README.md
git commit -m "docs: add setup guide"
```

Expected: commit succeeds.

---

### Task 6: Final Verification And GitHub Push

**Files:**
- Modify: repository git metadata only.

- [ ] **Step 1: Run full verification**

Run:

```powershell
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Inspect git status**

Run:

```powershell
git status --short
```

Expected: no uncommitted project files.

- [ ] **Step 3: Configure GitHub remote**

Run:

```powershell
git remote add origin https://github.com/Iven00/SF_LineLIFF_Transfer.git
```

If `origin` already exists, run:

```powershell
git remote set-url origin https://github.com/Iven00/SF_LineLIFF_Transfer.git
```

Expected: `git remote -v` shows the repository URL for fetch and push.

- [ ] **Step 4: Rename branch to main**

Run:

```powershell
git branch -M main
```

Expected: current branch is `main`.

- [ ] **Step 5: Push to GitHub**

Run:

```powershell
git push -u origin main
```

Expected: push succeeds using the local GitHub login.

- [ ] **Step 6: Final handoff**

Report:

- The local tests passed.
- The repository was pushed.
- The user still needs to create LIFF, deploy Apps Script, paste both URLs into `assets/js/config.js`, commit that config update, and enable GitHub Pages.
