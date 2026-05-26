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

test("join page has a mobile-only LINE app open link", async () => {
  const html = await text("join/index.html");
  const script = await text("assets/js/join.js");
  assert.match(html, /id="line-open-link"/);
  assert.match(script, /buildLineAppUrl/);
  assert.match(script, /navigator\.userAgent/);
});

test("join page cache-busts local static assets", async () => {
  const html = await text("join/index.html");
  assert.match(html, /\.\.\/assets\/css\/styles\.css\?v=/);
  assert.match(html, /\.\.\/assets\/js\/config\.js\?v=/);
  assert.match(html, /\.\.\/assets\/js\/join\.js\?v=/);
});

test("configuration includes confirmed OA URL and source values", async () => {
  const config = await text("assets/js/config.js");
  for (const source of ["poster", "card", "mom_wang", "mom_FB", "mom_IG", "mom_YT"]) {
    assert.match(config, new RegExp(`"${source}"`));
  }
  assert.match(config, /https:\/\/lin\.ee\/Z8UFsff/);
});

test("Apps Script targets the confirmed spreadsheet and sheet", async () => {
  const script = await text("apps-script/Code.gs");
  assert.match(script, /1YKUInNATvHY1VNoFngw0NmROjkn1uSC-fX3iyOK0qgk/);
  assert.match(script, /join_logs/);
  for (const header of ["timestamp", "lineUserId", "source", "displayName", "pictureUrl", "statusMessage", "userAgent", "pageUrl"]) {
    assert.match(script, new RegExp(`'${header}'`));
  }
});

test("Apps Script Web App returns JSON for frontend response parsing", async () => {
  const script = await text("apps-script/Code.gs");
  assert.match(script, /return json_\(\{ ok: true \}\)/);
  assert.match(script, /ContentService\.MimeType\.JSON/);
  assert.doesNotMatch(script, /資料接收成功/);
});

test("root page redirects into join route", async () => {
  const html = await text("index.html");
  assert.match(html, /url=join\//);
  assert.match(html, /location\.replace\(target\.href\)/);
});

test("LINE app prompt includes a dynamic QR code image placeholder", async () => {
  const html = await text("join/index.html");
  assert.match(html, /id="line-qr-code"/);
  assert.match(html, /data-dynamic-qr="true"/);
  assert.doesNotMatch(html, /\.\.\/assets\/img\/line-qr-poster\.png/);
});

test("join flow does not show add-friend button in QR prompt", async () => {
  const html = await text("join/index.html");
  const script = await text("assets/js/join.js");
  assert.doesNotMatch(html, /line_add_friends\/btn\/zh-Hant\.png/);
  assert.doesNotMatch(script, /或是點選下方按鈕/);
  assert.doesNotMatch(script, /line-friend-button/);
});
