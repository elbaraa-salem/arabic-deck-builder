import { createHash } from "node:crypto";
import { basename, extname, relative, resolve, sep } from "node:path";
import type { SourceIntakeManifest } from "../types/source-intake.ts";

// All manifest paths are relative to the invocation's working directory.
export function sourcePath(path: string): string {
  return relative(process.cwd(), resolve(path)).split(sep).join("/") || ".";
}

export function getSourceIdentity(source: SourceIntakeManifest["source"]): string {
  const name = basename(source.path);
  const stem = source.kind === "image_directory" ? name : basename(name, extname(name));
  const safeName = stem.replace(/[^\p{L}\p{N}._-]+/gu, "-").replace(/^[.-]+|[.-]+$/g, "") || "source";
  const key = createHash("sha256").update(JSON.stringify(source)).digest("hex").slice(0, 12);
  return `${safeName}-${key}`;
}
