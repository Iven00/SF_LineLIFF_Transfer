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
