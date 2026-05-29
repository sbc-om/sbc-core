import { db } from "@sbc/database";
import { sql } from "drizzle-orm";
import path from "node:path";
import fs from "node:fs/promises";

/**
 * Runs .sql migration files from a directory in sorted order.
 * Statements within each file are split on semicolons and executed individually.
 * "already exists" errors are silently swallowed so re-runs are idempotent.
 */
export async function runSqlFileMigrations(
  moduleName: string,
  migrationsDir: string,
): Promise<number> {
  let files: string[];
  try {
    const entries = await fs.readdir(migrationsDir);
    files = entries.filter((f) => f.endsWith(".sql")).sort();
  } catch {
    return 0; // migrations dir absent — nothing to run
  }

  let ran = 0;
  for (const file of files) {
    const content = await fs.readFile(path.join(migrationsDir, file), "utf-8");

    // Strip single-line comments from each chunk, then split on semicolons
    const statements = content
      .split(";")
      .map((chunk) =>
        chunk
          .split("\n")
          .filter((line) => !line.trim().startsWith("--"))
          .join("\n")
          .trim(),
      )
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        await db.execute(sql.raw(stmt));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // Idempotent: skip if the object already exists
        if (
          msg.toLowerCase().includes("already exists") ||
          msg.toLowerCase().includes("duplicate")
        ) {
          continue;
        }
        throw new Error(`[${moduleName}] Migration ${file} failed: ${msg}`);
      }
    }

    console.log(`[kernel] ${moduleName}: applied ${file}`);
    ran++;
  }

  return ran;
}
