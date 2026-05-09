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
