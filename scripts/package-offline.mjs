import { createHash } from "node:crypto";
import { copyFile, cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = "1.0.0";
const packageName = `AI-Cognition-Sphere-v${version}-Universal-Offline`;
const packageRoot = path.join(projectRoot, "dist", packageName);
const mainFile = `AI-Cognition-Sphere-v${version}.html`;
const readableFile = "read.html";

await rm(packageRoot, { recursive: true, force: true });
await mkdir(path.join(packageRoot, "LICENSES"), { recursive: true });
await mkdir(path.join(packageRoot, "public"), { recursive: true });

const copies = [
  [path.join(projectRoot, "dist", mainFile), path.join(packageRoot, mainFile)],
  [path.join(projectRoot, "dist", readableFile), path.join(packageRoot, readableFile)],
  [path.join(projectRoot, "README.md"), path.join(packageRoot, "README.md")],
  [path.join(projectRoot, "README.zh-CN.md"), path.join(packageRoot, "README.zh-CN.md")],
  [path.join(projectRoot, "LICENSE.md"), path.join(packageRoot, "LICENSE.md")],
  [path.join(projectRoot, "TRADEMARKS.md"), path.join(packageRoot, "TRADEMARKS.md")],
  [path.join(projectRoot, "LICENSES", "MIT.txt"), path.join(packageRoot, "LICENSES", "MIT.txt")],
  [path.join(projectRoot, "LICENSES", "CC-BY-4.0.txt"), path.join(packageRoot, "LICENSES", "CC-BY-4.0.txt")],
];
await Promise.all(copies.map(([from, to]) => copyFile(from, to)));
await cp(
  path.join(projectRoot, "public", "readme"),
  path.join(packageRoot, "public", "readme"),
  { recursive: true },
);

const instructions = `AI Cognition Sphere v${version} — Universal Offline Edition

ENGLISH
1. Open ${mainFile} in a current desktop browser.
2. Use TEXT INDEX inside the sphere, or open ${readableFile} directly.
3. The sphere, concept notes, and readable index work without a network connection.
4. External reference links require an internet connection.

Supported experience: current Chrome, Edge, Safari, or another browser with WebGL enabled.
No installation, administrator access, or Node.js is required.

简体中文
1. 使用当前版本的桌面浏览器打开 ${mainFile}。
2. 可在球体中点击“文字索引”，也可以直接打开 ${readableFile}。
3. 球体、概念内容和文字索引均可在无网络环境下使用。
4. 打开外部参考来源时仍然需要网络连接。

建议使用启用了 WebGL 的新版 Chrome、Edge 或 Safari。
无需安装软件、无需管理员权限，也无需 Node.js。
`;
await writeFile(path.join(packageRoot, "START-HERE.txt"), instructions, "utf8");

const checksumFiles = [mainFile, readableFile, "START-HERE.txt"];
const checksums = [];
for (const file of checksumFiles) {
  const contents = await readFile(path.join(packageRoot, file));
  checksums.push(`${createHash("sha256").update(contents).digest("hex")}  ${file}`);
}
await writeFile(path.join(packageRoot, "SHA256SUMS.txt"), `${checksums.join("\n")}\n`, "utf8");

const packagedFiles = await readdir(packageRoot, { recursive: true });
console.log(JSON.stringify({ packageRoot, files: packagedFiles.length }));
