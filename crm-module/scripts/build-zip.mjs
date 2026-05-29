/**
 * Build script — creates an installable crm-{version}.zip package.
 *
 * Usage:
 *   npm install          # install adm-zip
 *   node scripts/build-zip.mjs
 *
 * Output:
 *   dist/crm-1.0.0.zip   ← upload this to the SBC marketplace
 */

import AdmZip from "adm-zip";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Read manifest to get the version
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "manifest.json"), "utf-8"),
);

const outputName = `crm-${manifest.version}.zip`;
const outputDir  = path.join(root, "dist");
const outputPath = path.join(outputDir, outputName);

// Ensure output directory exists
fs.mkdirSync(outputDir, { recursive: true });

const zip = new AdmZip();

// ── manifest.json (required) ───────────────────────────────────────────────
zip.addLocalFile(path.join(root, "manifest.json"));

// ── migrations/*.sql (optional but highly recommended) ─────────────────────
const migrationsDir = path.join(root, "migrations");
if (fs.existsSync(migrationsDir)) {
  const sqlFiles = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of sqlFiles) {
    zip.addLocalFile(path.join(migrationsDir, file), "migrations");
    console.log(`  + migrations/${file}`);
  }
}

// ── icon.png (optional, displayed in marketplace) ─────────────────────────
const iconPath = path.join(root, "icon.png");
if (fs.existsSync(iconPath)) {
  zip.addLocalFile(iconPath);
  console.log("  + icon.png");
}

// ── README.md (optional) ──────────────────────────────────────────────────
const readmePath = path.join(root, "README.md");
if (fs.existsSync(readmePath)) {
  zip.addLocalFile(readmePath);
  console.log("  + README.md");
}

zip.writeZip(outputPath);

console.log(`\n✅ Package built: dist/${outputName}`);
console.log(`   Size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);
console.log("\nUpload this file in SBC Core → Marketplace → Upload Module");
