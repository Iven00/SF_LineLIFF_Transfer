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
