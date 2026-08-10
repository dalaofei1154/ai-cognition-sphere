import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputFileName = "AI-Cognition-Sphere-v1.0.0.html";
const outputPath = path.join(projectRoot, "dist", outputFileName);
const readableOutputFileName = "read.html";
const readableOutputPath = path.join(projectRoot, "dist", readableOutputFileName);

async function bundleOfflineEntry(contents, sourcefile) {
  const result = await build({
    banner: {
      // Browser-facing dependencies still inspect process.env at runtime.
      // Standalone HTML has no Node process global, so expose only the
      // production marker required by the bundle.
      js: 'var process = { env: { NODE_ENV: "production" } };',
    },
    stdin: {
      contents,
      resolveDir: projectRoot,
      sourcefile,
      loader: "tsx",
    },
    bundle: true,
    write: false,
    outfile: sourcefile.replace(/\.tsx$/, ".js"),
    format: "iife",
    platform: "browser",
    target: ["safari15", "chrome100"],
    minify: true,
    legalComments: "eof",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
  });

  const javascript = result.outputFiles.find((file) => file.path.endsWith(".js"))?.text;
  if (!javascript) throw new Error(`${sourcefile} did not emit JavaScript`);
  // Parse without executing to catch malformed bundler output.
  new Function(javascript);
  return javascript;
}

const [sphereJavascript, readableJavascript] = await Promise.all([
  bundleOfflineEntry(`
      import React from "react";
      import { createRoot } from "react-dom/client";
      import SphereExperience from "./app/sphere-experience";
      const root = document.getElementById("root");
      if (!root) throw new Error("Missing #root mount element");
      createRoot(root).render(
        React.createElement(
          React.StrictMode,
          null,
          React.createElement(SphereExperience, { offlineMode: true }),
        ),
      );
    `, "offline-sphere-entry.tsx"),
  bundleOfflineEntry(`
      import React from "react";
      import { createRoot } from "react-dom/client";
      import ReadableIndex from "./app/readable-index";
      const root = document.getElementById("root");
      if (!root) throw new Error("Missing #root mount element");
      const language = new URLSearchParams(window.location.search).get("lang") === "zh" ? "zh" : "en";
      document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
      createRoot(root).render(
        React.createElement(
          React.StrictMode,
          null,
          React.createElement(ReadableIndex, { language, offlineMode: true }),
        ),
      );
    `, "offline-readable-entry.tsx"),
]);

const productionAssets = path.join(projectRoot, "dist", "client", "assets");
const cssFiles = (await readdir(productionAssets)).filter((file) => file.endsWith(".css"));
if (cssFiles.length !== 1) {
  throw new Error(`Expected one production CSS asset, found ${cssFiles.length}`);
}
const stylesheet = await readFile(path.join(productionAssets, cssFiles[0]), "utf8");

const safeStylesheet = stylesheet.replace(/<\/style/gi, "<\\/style");

function standaloneHtml({ title, javascript }) {
  const safeJavascript = javascript.replace(/<\/script/gi, "<\\/script");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="color-scheme" content="dark">
  <meta name="theme-color" content="#020309">
  <title>${title}</title>
  <style>${safeStylesheet}</style>
</head>
<body>
  <div id="root"></div>
  <script>${safeJavascript}</script>
</body>
</html>`;
}

const html = standaloneHtml({
  title: "AI Cognition Sphere v1.0.0",
  javascript: sphereJavascript,
});
const readableHtml = standaloneHtml({
  title: "Readable Index | AI Cognition Sphere v1.0.0",
  javascript: readableJavascript,
});

await writeFile(outputPath, html, "utf8");
await writeFile(readableOutputPath, readableHtml, "utf8");
console.log(JSON.stringify({
  outputs: [
    {
      outputPath,
      bytes: Buffer.byteLength(html),
      sha256: createHash("sha256").update(html).digest("hex"),
    },
    {
      outputPath: readableOutputPath,
      bytes: Buffer.byteLength(readableHtml),
      sha256: createHash("sha256").update(readableHtml).digest("hex"),
    },
  ],
}));
