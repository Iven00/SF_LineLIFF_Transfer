import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildLineAppUrl,
  buildLiffOpenUrl,
  buildQrCodeImageUrl,
  isMobileUserAgent,
  shouldPromptLineAppOpen
} from "../assets/js/line-open.mjs";

test("prompts to open LINE app when outside LIFF client and not logged in", () => {
  assert.equal(shouldPromptLineAppOpen({ isInClient: false, isLoggedIn: false }), true);
});

test("does not prompt when already inside LIFF client", () => {
  assert.equal(shouldPromptLineAppOpen({ isInClient: true, isLoggedIn: false }), false);
});

test("does not prompt when external browser is already logged in", () => {
  assert.equal(shouldPromptLineAppOpen({ isInClient: false, isLoggedIn: true }), false);
});

test("builds LIFF open URL with source parameter", () => {
  assert.equal(
    buildLiffOpenUrl("2010021052-HtEE4Ehv", "mom_FB"),
    "https://liff.line.me/2010021052-HtEE4Ehv/?source=mom_FB"
  );
});

test("builds dynamic QR code image URL for the current LIFF source", () => {
  assert.equal(
    buildQrCodeImageUrl("2010021052-HtEE4Ehv", "v202605151137"),
    "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https%3A%2F%2Fliff.line.me%2F2010021052-HtEE4Ehv%2F%3Fsource%3Dv202605151137"
  );
});

test("detects Facebook in-app browser on iPhone as mobile", () => {
  const userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/468.0.0.0.49;]";
  assert.equal(isMobileUserAgent(userAgent), true);
});

test("does not detect desktop Chrome as mobile", () => {
  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
  assert.equal(isMobileUserAgent(userAgent), false);
});

test("builds LINE app deep link with source parameter", () => {
  assert.equal(
    buildLineAppUrl("2010021052-HtEE4Ehv", "v202605151131"),
    "line://app/2010021052-HtEE4Ehv?source=v202605151131"
  );
});
