import AdmZip from "adm-zip";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf-8"));
const outputName = `bitcoin_market-${manifest.version}.zip`;
const outputDir = path.join(root, "dist");
const outputPath = path.join(outputDir, outputName);

fs.mkdirSync(outputDir, { recursive: true });

const zip = new AdmZip();
zip.addLocalFile(path.join(root, "manifest.json"));

for (const extra of ["README.md", "package.json", "tsconfig.json"]) {
  const target = path.join(root, extra);
  if (fs.existsSync(target)) {
    zip.addLocalFile(target);
  }
}

const srcDir = path.join(root, "src");
if (fs.existsSync(srcDir)) {
  zip.addLocalFolder(srcDir, "src");
}

zip.writeZip(outputPath);

console.log(`Package built: dist/${outputName}`);