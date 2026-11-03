import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { stringify } from "yaml";
import { sourceIntakeManifestSchema } from "../schema/source-intake.schema.ts";
import type { SourceIntakeManifest } from "../types/source-intake.ts";
import { getSourceIdentity, sourcePath } from "./source-path.ts";

export async function writeIntakeManifest(
  manifest: SourceIntakeManifest,
  outputDirectory = "output/source-intake",
): Promise<string> {
  const validated = sourceIntakeManifestSchema.parse(manifest);
  const path = resolve(join(outputDirectory, `${getSourceIdentity(validated.source)}.yaml`));
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path, stringify(validated, { lineWidth: 0 }), "utf8");
  return sourcePath(path);
}
