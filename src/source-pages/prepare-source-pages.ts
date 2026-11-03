import { mkdir, readFile, rm, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parse } from "yaml";
import { ZodError } from "zod";
import { sourceIntakeManifestSchema } from "../schema/source-intake.schema.ts";
import { inspectImage } from "../source-intake/inspect-image.ts";
import { getSourceIdentity, sourcePath } from "../source-intake/source-path.ts";
import type { SourceIntakeManifest } from "../types/source-intake.ts";
import type { SourcePageArtifact, SourcePageBundle } from "../types/source-page-bundle.ts";
import { checkPdfRenderer, renderPdfPage } from "./render-pdf.ts";
import { writePageBundle } from "./write-bundle.ts";

async function loadIntakeManifest(path: string): Promise<SourceIntakeManifest> {
  let yaml: string;
  try {
    yaml = await readFile(path, "utf8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error(`Intake manifest not found: ${sourcePath(path)}`);
    }
    throw error;
  }
  try {
    return sourceIntakeManifestSchema.parse(parse(yaml));
  } catch (error) {
    const message = error instanceof ZodError
      ? error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")
      : error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid intake manifest "${sourcePath(path)}": ${message}`);
  }
}

export async function prepareSourcePages(
  manifestPath: string,
  outputRoot = "output/source-pages",
): Promise<{ source: string; bundle: SourcePageBundle; outputDirectory: string; manifestPath: string }> {
  const intake = await loadIntakeManifest(resolve(manifestPath));
  const sourceFile = resolve(intake.source.path);
  try {
    const info = await stat(sourceFile);
    if (intake.source.kind === "image_directory" ? !info.isDirectory() : !info.isFile()) {
      throw new Error("Source kind no longer matches the original file/directory");
    }
  } catch (error) {
    throw new Error(`Original source missing or unavailable: ${intake.source.path}. ${error instanceof Error ? error.message : String(error)}`);
  }

  const visualPages = intake.pages.filter((page) => page.suggestedExtraction !== "embedded_text");
  if (intake.source.kind === "pdf" && visualPages.length > 0) {
    await checkPdfRenderer();
  }
  const outputDirectory = resolve(outputRoot, getSourceIdentity(intake.source));
  await mkdir(outputDirectory, { recursive: true });
  // A failed rerun must not leave an earlier manifest appearing to certify it.
  await rm(join(outputDirectory, "manifest.yaml"), { force: true });
  const pages: SourcePageArtifact[] = [];
  for (const page of visualPages) {
    const pdf = intake.source.kind === "pdf";
    const imageFile = pdf
      ? await renderPdfPage(sourceFile, page.pageIndex, outputDirectory)
      : resolve(page.imageFile ?? page.sourceFile);
    const image = await inspectImage(imageFile, page.pageIndex);
    pages.push({
      pageIndex: page.pageIndex,
      imageFile: sourcePath(imageFile),
      width: image.width,
      height: image.height,
      renderMethod: pdf ? "pdftoppm" : "existing_image",
    });
  }
  const bundle: SourcePageBundle = {
    schemaVersion: "1.0",
    sourceManifest: sourcePath(manifestPath),
    pages,
  };
  const bundlePath = await writePageBundle(bundle, outputDirectory);
  return { source: intake.source.path, bundle, outputDirectory: sourcePath(outputDirectory), manifestPath: bundlePath };
}
