import { mkdir, rename, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { stringify } from "yaml";
import { sourcePageBundleSchema } from "../schema/source-page-bundle.schema.ts";
import { inspectImage } from "../source-intake/inspect-image.ts";
import { sourcePath } from "../source-intake/source-path.ts";
import type { SourcePageBundle } from "../types/source-page-bundle.ts";

export async function writePageBundle(bundle: SourcePageBundle, outputDirectory: string): Promise<string> {
  const validated = sourcePageBundleSchema.parse(bundle);
  for (const page of validated.pages) {
    // Verify actual files and dimensions rather than trusting manifest declarations.
    const actual = await inspectImage(resolve(page.imageFile), page.pageIndex);
    if (actual.width !== page.width || actual.height !== page.height) {
      throw new Error(`Page ${page.pageIndex} image dimensions changed before bundle writing`);
    }
  }
  await mkdir(outputDirectory, { recursive: true });
  const path = join(outputDirectory, "manifest.yaml");
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, stringify(validated, { lineWidth: 0 }), "utf8");
  await rename(temporaryPath, path);
  return sourcePath(path);
}
