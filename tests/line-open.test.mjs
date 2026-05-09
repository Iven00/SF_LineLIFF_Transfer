import { test } from "node:test";
import assert from "node:assert/strict";
import { buildLiffOpenUrl, shouldPromptLineAppOpen } from "../assets/js/line-open.mjs";

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
