import assert from "node:assert/strict";
import test from "node:test";

test("renders product metadata without starter preview markers", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /<title>AI Cognition Sphere \| From Capabilities to Conditions<\/title>/i);
  assert.match(html, /<meta[^>]+property="og:image"[^>]+content="http:\/\/localhost(?::3000)?\/og\.png"/i);
  assert.match(html, /<html[^>]+lang=["']en["']/i);

  const readableResponse = await worker.fetch(
    new Request("http://localhost/read", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(readableResponse.status, 200);
  const readableHtml = await readableResponse.text();
  assert.match(readableHtml, /AI Cognition Sphere/);
  assert.match(readableHtml, /Readable Index/);
  assert.match(readableHtml, /REFERENCES/);
  assert.match(readableHtml, /Authorial interpretation/);
});
