import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { stringify } from "yaml";
import { sourceIntakeManifestSchema } from "../schema/source-intake.schema.ts";
import type { SourceIntakeManifest } from "../types/source-intake.ts";
import { sourcePath } from "./source-path.ts";

export async function writeIntakeManifest(
  manifest: SourceIntakeManifest,
  outputDirectory = "output/source-intake",
): Promise<string> {
  const validated = sourceIntakeManifestSchema.parse(manifest);
  const name = basename(validated.source.path);
  const stem = validated.source.kind === "image_directory" ? name : basename(name, extname(name));
  const safeName = stem.replace(/[^\p{L}\p{N}._-]+/gu, "-").replace(/^[.-]+|[.-]+$/g, "") || "source";
  const key = createHash("sha256").update(JSON.stringify(validated.source)).digest("hex").slice(0, 12);
  const path = resolve(join(outputDirectory, `${safeName}-${key}.yaml`));
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path, stringify(validated, { lineWidth: 0 }), "utf8");
  return sourcePath(path);
}
