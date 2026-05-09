import { buildLineAppUrl, shouldPromptLineAppOpen } from "./line-open.mjs";
import { extractSourceFromSearch } from "./source.mjs";

(function () {
  const config = window.SF_LINE_TRANSFER_CONFIG || {};
  const statusPanel = document.querySelector(".status-panel");
  const statusTitle = document.querySelector("#status-title");
  const statusMessage = document.querySelector("#status-message");
  const sourceLabel = document.querySelector("#source-label");
  const lineQrCode = document.querySelector("#line-qr-code");
  const manualLink = document.querySelector("#manual-link");

  function setStatus(message) {
    statusMessage.textContent = message;
  }

  function showAction({ title, message, href, label, isError = false, showQr = false }) {
    statusPanel.classList.toggle("is-error", isError);
    statusPanel.classList.add("has-action");
    statusTitle.textContent = title;
    setStatus(message);
    lineQrCode.hidden = !showQr;
    manualLink.href = href;
    manualLink.textContent = label;
    manualLink.hidden = false;
  }

  function showError(message) {
    showAction({
      title: "流程暫時無法完成",
      message,
      href: config.LINE_OA_URL || "https://lin.ee/RbgiWMT",
      label: "前往 LINE 官方帳號",
      isError: true
    });
  }

  function isPlaceholder(value) {
    return !value || value.startsWith("REPLACE_WITH_");
  }

  function readSource() {
    const source = extractSourceFromSearch(window.location.search);
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

  function promptLineAppOpen(source) {
    showAction({
      title: "請用 LINE 開啟",
      message: "請使用 LINE 掃描下方 QR Code。\n或是點選下方按鈕。",
      href: buildLineAppUrl(config.LIFF_ID, source),
      label: "用 LINE 開啟",
      showQr: true
    });
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

      if (shouldPromptLineAppOpen({
        isInClient: liff.isInClient(),
        isLoggedIn: liff.isLoggedIn()
      })) {
        promptLineAppOpen(source);
        return;
      }

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
