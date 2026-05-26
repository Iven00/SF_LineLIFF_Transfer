export function shouldPromptLineAppOpen({ isInClient, isLoggedIn }) {
  return !isInClient && !isLoggedIn;
}

export function buildLiffOpenUrl(liffId, source) {
  const url = new URL(`https://liff.line.me/${liffId}/`);
  if (source) {
    url.searchParams.set("source", source);
  }
  return url.href;
}

export function buildQrCodeImageUrl(liffId, source) {
  const url = new URL("https://api.qrserver.com/v1/create-qr-code/");
  url.searchParams.set("size", "400x400");
  url.searchParams.set("data", buildLiffOpenUrl(liffId, source));
  return url.href;
}
