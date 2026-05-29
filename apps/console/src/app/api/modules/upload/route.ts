import { NextRequest, NextResponse } from "next/server";
import AdmZip from "adm-zip";
import path from "node:path";
import fs from "node:fs/promises";
import { db } from "@sbc/database";
import { modules } from "@sbc/database";
import { eq } from "drizzle-orm";
import { z } from "zod";

// ── Manifest schema validation ────────────────────────────────────────────────
const ManifestSchema = z.object({
  name:        z.string().regex(/^[a-z][a-z0-9_]*$/, "Module name must be snake_case"),
  title:       z.string().min(1),
  description: z.string().min(1),
  version:     z.string().regex(/^\d+\.\d+\.\d+$/, "Version must be semver (x.y.z)"),
  author:      z.string().min(1),
  category:    z.string().min(1),
  depends:     z.array(z.string()).default([]),
  permissions: z.array(z.object({ key: z.string(), label: z.string() })).default([]),
  menus:       z.array(z.any()).default([]),
  settings:    z.array(z.any()).default([]),
  installable: z.boolean().default(true),
  application: z.boolean().default(true),
});

// External modules live next to the Next.js app at runtime
const EXTERNAL_MODULES_DIR = path.join(process.cwd(), "external-modules");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }
    if (!file.name.endsWith(".zip")) {
      return NextResponse.json({ error: "File must be a .zip archive." }, { status: 400 });
    }
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be under 50 MB." }, { status: 400 });
    }

    // Read buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse zip
    let zip: AdmZip;
    try {
      zip = new AdmZip(buffer);
    } catch {
      return NextResponse.json({ error: "Invalid or corrupted zip file." }, { status: 400 });
    }

    // Validate manifest.json
    const manifestEntry = zip.getEntry("manifest.json");
    if (!manifestEntry) {
      return NextResponse.json({ error: "manifest.json not found at the root of the zip." }, { status: 400 });
    }

    let manifest: z.infer<typeof ManifestSchema>;
    try {
      const raw = JSON.parse(manifestEntry.getData().toString("utf-8"));
      manifest = ManifestSchema.parse(raw);
    } catch (err) {
      const msg = err instanceof z.ZodError
        ? err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
        : "JSON parse error";
      return NextResponse.json({ error: `Invalid manifest.json — ${msg}` }, { status: 400 });
    }

    // Guard against path traversal
    const safeName = manifest.name.replace(/[^a-z0-9_]/g, "");
    const moduleDir = path.join(EXTERNAL_MODULES_DIR, safeName);

    // Extract to disk
    await fs.mkdir(moduleDir, { recursive: true });
    zip.extractAllTo(moduleDir, /* overwrite */ true);

    // Register / update in DB
    const existing = await db.query.modules.findFirst({
      where: eq(modules.name, manifest.name),
    });

    if (!existing) {
      await db.insert(modules).values({
        name:    manifest.name,
        title:   manifest.title,
        version: manifest.version,
        state:   "discovered",
      });
    } else if (["uninstalled", "error", "discovered"].includes(existing.state)) {
      await db
        .update(modules)
        .set({ title: manifest.title, version: manifest.version, state: "discovered", error: null, updatedAt: new Date() })
        .where(eq(modules.name, manifest.name));
    }

    return NextResponse.json({ success: true, manifest });
  } catch (err) {
    console.error("[module-upload]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 },
    );
  }
}
