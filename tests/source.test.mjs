import { test } from "node:test";
import assert from "node:assert/strict";
import { extractSourceFromSearch } from "../assets/js/source.mjs";

test("extracts direct GitHub Pages source parameter", () => {
  assert.equal(extractSourceFromSearch("?source=poster"), "poster");
});

test("extracts source from LIFF state query parameter", () => {
  assert.equal(extractSourceFromSearch("?liff.state=%3Fsource%3Dposter"), "poster");
});

test("extracts source from LIFF state path plus query", () => {
  assert.equal(extractSourceFromSearch("?liff.state=%2Fjoin%3Fsource%3Dmom_FB"), "mom_FB");
});

test("returns empty string when no source exists", () => {
  assert.equal(extractSourceFromSearch("?liff.state=%2Fjoin"), "");
});
