export function extractSourceFromSearch(search) {
  const params = new URLSearchParams(search || "");
  const directSource = params.get("source");
  if (directSource) {
    return directSource;
  }

  const liffState = params.get("liff.state");
  if (!liffState) {
    return "";
  }

  const stateQuery = extractQueryFromLiffState(liffState);
  if (!stateQuery) {
    return "";
  }

  return new URLSearchParams(stateQuery).get("source") || "";
}

function extractQueryFromLiffState(liffState) {
  if (liffState.startsWith("?")) {
    return liffState.slice(1);
  }

  const questionMarkIndex = liffState.indexOf("?");
  if (questionMarkIndex >= 0) {
    return liffState.slice(questionMarkIndex + 1);
  }

  if (liffState.includes("=")) {
    return liffState;
  }

  return "";
}
