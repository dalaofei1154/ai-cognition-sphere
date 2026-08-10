import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const english = await readFile(path.join(projectRoot, "README.md"), "utf8");
const chinese = await readFile(path.join(projectRoot, "README.zh-CN.md"), "utf8");

function imageReferences(markdown) {
  return [...markdown.matchAll(/(?:!\[[^\]]*\]\(|src=")(?<path>public\/readme\/[^)"]+)/g)]
    .map((match) => match.groups.path);
}

test("both README editions expose the same five visual entry points", async () => {
  const englishImages = imageReferences(english);
  const chineseImages = imageReferences(chinese);
  assert.equal(englishImages.length, 5);
  assert.equal(chineseImages.length, 5);
  assert.ok(englishImages.every((image) => image.includes("/en-")));
  assert.ok(chineseImages.every((image) => image.includes("/zh-")));
  await Promise.all([...englishImages, ...chineseImages].map((image) => access(path.join(projectRoot, image))));
});

test("English is the default repository language and both editions cross-link", () => {
  assert.match(english, /^\*\*English\*\* \| \[简体中文\]\(README\.zh-CN\.md\)/);
  assert.match(chinese, /^\[English\]\(README\.md\) \| \*\*简体中文\*\*/);
  assert.match(english, /# AI Cognition Sphere/);
  assert.match(chinese, /# AI Cognition Sphere/);
});
