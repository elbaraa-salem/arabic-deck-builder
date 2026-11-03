import { readdir, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { sourceIntakeManifestSchema } from "../schema/source-intake.schema.ts";
import type { SourceIntakeKind, SourceIntakeManifest, SourceIntakePage } from "../types/source-intake.ts";
import { inspectImage, isSupportedImage } from "./inspect-image.ts";
import { sourcePath } from "./source-path.ts";
import { inspectPdf } from "./inspect-pdf.ts";

const pageOrder = new Intl.Collator("en", { numeric: true, sensitivity: "variant" });

export async function inspectSource(inputPath: string): Promise<SourceIntakeManifest> {
  const path = resolve(inputPath);
  let info;
  try {
    info = await stat(path);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error(`Input path not found: ${inputPath}`);
    }
    throw error;
  }

  let kind: SourceIntakeKind;
  let pages: SourceIntakePage[];
  if (info.isDirectory()) {
    kind = "image_directory";
    const files = (await readdir(path, { withFileTypes: true }))
      .filter((file) => file.isFile() && isSupportedImage(file.name))
      .map((file) => file.name)
      .sort((a, b) => pageOrder.compare(a, b) || (a < b ? -1 : a > b ? 1 : 0));
    if (files.length === 0) {
      throw new Error(`No supported page images in directory: ${inputPath}. Expected PNG, JPG/JPEG, or WebP.`);
    }
    pages = [];
    for (const [index, file] of files.entries()) {
      pages.push(await inspectImage(join(path, file), index + 1));
    }
  } else if (info.isFile() && extname(path).toLowerCase() === ".pdf") {
    kind = "pdf";
    pages = await inspectPdf(path);
  } else if (info.isFile() && isSupportedImage(path)) {
    kind = "image";
    pages = [await inspectImage(path, 1)];
  } else {
    throw new Error(`Unsupported input file: ${inputPath}. Expected PDF, PNG, JPG/JPEG, WebP, or a page-image directory.`);
  }

  return sourceIntakeManifestSchema.parse({ schemaVersion: "1.0", source: { kind, path: sourcePath(path) }, pages });
}
