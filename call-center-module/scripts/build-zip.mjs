/**
 * Build script — creates an installable call_center-{version}.zip package.
 */

import AdmZip from "adm-zip";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "manifest.json"), "utf-8"),
);

const outputName = `call_center-${manifest.version}.zip`;
const outputDir = path.join(root, "dist");
const outputPath = path.join(outputDir, outputName);

fs.mkdirSync(outputDir, { recursive: true });

const zip = new AdmZip();
zip.addLocalFile(path.join(root, "manifest.json"));

const migrationsDir = path.join(root, "migrations");
if (fs.existsSync(migrationsDir)) {
  const sqlFiles = fs.readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of sqlFiles) {
    zip.addLocalFile(path.join(migrationsDir, file), "migrations");
    console.log(`  + migrations/${file}`);
  }
}

const readmePath = path.join(root, "README.md");
if (fs.existsSync(readmePath)) {
  zip.addLocalFile(readmePath);
  console.log("  + README.md");
}

const packageJsonPath = path.join(root, "package.json");
if (fs.existsSync(packageJsonPath)) {
  zip.addLocalFile(packageJsonPath);
  console.log("  + package.json");
}

const tsconfigPath = path.join(root, "tsconfig.json");
if (fs.existsSync(tsconfigPath)) {
  zip.addLocalFile(tsconfigPath);
  console.log("  + tsconfig.json");
}

const srcDir = path.join(root, "src");
if (fs.existsSync(srcDir)) {
  zip.addLocalFolder(srcDir, "src");
  console.log("  + src/");
}

zip.writeZip(outputPath);

console.log(`\nPackage built: dist/${outputName}`);
console.log(`Size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);
