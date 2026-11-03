import { execFile } from "node:child_process";
import { access, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

async function runRenderer(args: string[]): Promise<void> {
  try {
    await run("pdftoppm", args, {
      encoding: "utf8",
      env: { ...process.env, LC_ALL: "C" },
      timeout: 60_000,
      maxBuffer: 1024 * 1024,
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error("PDF page rendering requires Poppler's pdftoppm on PATH. Install poppler-utils (Debian/Ubuntu) or poppler (Arch/macOS).");
    }
    throw error;
  }
}

export async function checkPdfRenderer(): Promise<void> {
  await runRenderer(["-v"]);
}

export async function renderPdfPage(sourceFile: string, pageIndex: number, outputDirectory: string): Promise<string> {
  const name = `page-${String(pageIndex).padStart(4, "0")}`;
  const prefix = join(outputDirectory, `.${name}-render`);
  const temporaryImage = `${prefix}.png`;
  const imageFile = join(outputDirectory, `${name}.png`);
  // A stale image cannot masquerade as successful output from this invocation.
  await rm(temporaryImage, { force: true });
  try {
    await runRenderer([
      "-f", String(pageIndex), "-l", String(pageIndex),
      "-singlefile", "-png", "-scale-to", "3000",
      "-aa", "yes", "-aaVector", "yes", sourceFile, prefix,
    ]);
    try {
      await access(temporaryImage);
    } catch {
      throw new Error(`Output image missing for PDF page ${pageIndex}`);
    }
    await rename(temporaryImage, imageFile);
    return imageFile;
  } catch (error) {
    throw new Error(`Rendering failed for PDF page ${pageIndex}: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await rm(temporaryImage, { force: true });
  }
}
