import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sphereHtml = await readFile(
  new URL("../dist/AI-Cognition-Sphere-v1.0.0.html", import.meta.url),
  "utf8",
);
const readableHtml = await readFile(new URL("../dist/read.html", import.meta.url), "utf8");

function assertSelfContainedHtml(html, name) {
  assert.match(html, /^<!doctype html>/i, `${name} should be a complete HTML document`);
  assert.match(html, /<style>[\s\S]+<\/style>/i, `${name} should inline its stylesheet`);
  assert.match(html, /<script>[\s\S]+<\/script>/i, `${name} should inline its JavaScript`);
  assert.doesNotMatch(html, /<script[^>]+\bsrc=/i, `${name} should not load an external script`);
  assert.doesNotMatch(
    html,
    /<link[^>]+\brel=["']stylesheet["']/i,
    `${name} should not load an external stylesheet`,
  );
}

test("the offline sphere and readable index are self-contained documents", () => {
  assertSelfContainedHtml(sphereHtml, "sphere");
  assertSelfContainedHtml(readableHtml, "readable index");
  assert.ok(Buffer.byteLength(sphereHtml) > 500_000);
  assert.ok(Buffer.byteLength(readableHtml) > 250_000);
});

test("offline navigation remains inside the downloaded folder", () => {
  assert.match(sphereHtml, /read\.html/);
  assert.match(readableHtml, /AI-Cognition-Sphere-v1\.0\.0\.html/);
  assert.match(readableHtml, /Readable Index/);
  assert.match(readableHtml, /\\u6587\\u5b57\\u7d22\\u5f15/i);
});
