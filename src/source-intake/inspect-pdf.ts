import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { SourceIntakePage } from "../types/source-intake.ts";
import { sourcePath } from "./source-path.ts";

const run = promisify(execFile);

async function runPdfTool(command: "pdfinfo" | "pdftotext", args: string[]): Promise<string> {
  try {
    const { stdout } = await run(command, args, {
      encoding: "utf8",
      env: { ...process.env, LC_ALL: "C" },
      timeout: 30_000,
      maxBuffer: 16 * 1024 * 1024,
    });
    return stdout;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error(`PDF intake requires Poppler's pdfinfo and pdftotext on PATH. Missing: ${command}. Install poppler-utils (Debian/Ubuntu) or poppler (Arch/macOS).`);
    }
    throw error;
  }
}

export async function inspectPdf(path: string): Promise<SourceIntakePage[]> {
  // Fail clearly for either missing tool, even for an empty/protected PDF.
  await Promise.all([runPdfTool("pdfinfo", ["-v"]), runPdfTool("pdftotext", ["-v"])]);

  try {
    const info = await runPdfTool("pdfinfo", ["-enc", "UTF-8", path]);
    const count = Number(/^Pages:\s+(\d+)\s*$/m.exec(info)?.[1]);
    if (!Number.isSafeInteger(count) || count < 1) {
      throw new Error("No readable PDF pages found");
    }
    const sizes = await runPdfTool("pdfinfo", ["-f", "1", "-l", String(count), path]);
    const dimensions = new Map<number, { width: number; height: number }>();
    for (const match of sizes.matchAll(/^Page\s+(\d+) size:\s+([\d.]+) x ([\d.]+) pts/gm)) {
      dimensions.set(Number(match[1]), { width: Number(match[2]), height: Number(match[3]) });
    }

    const pages: SourceIntakePage[] = [];
    for (let pageIndex = 1; pageIndex <= count; pageIndex++) {
      const size = dimensions.get(pageIndex);
      if (!size || !(size.width > 0 && size.height > 0)) {
        throw new Error(`Could not read dimensions for PDF page ${pageIndex}`);
      }
      // Per-page requests avoid ambiguous form-feed splitting and keep buffers bounded.
      const text = await runPdfTool("pdftotext", [
        "-f", String(pageIndex), "-l", String(pageIndex),
        "-enc", "UTF-8", "-nopgbrk", path, "-",
      ]);
      const embeddedTextCharacterCount = (text.match(/[\p{L}\p{N}]/gu) ?? []).length;
      // A page number or a few glyphs alone are insufficient evidence of usable text.
      const embeddedTextAvailable = embeddedTextCharacterCount >= 20;
      pages.push({
        pageIndex,
        sourceFile: sourcePath(path),
        ...size,
        dimensionUnit: "points",
        embeddedTextAvailable,
        embeddedTextCharacterCount,
        suggestedExtraction: embeddedTextAvailable ? "embedded_text" : "vision",
      });
    }
    return pages;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not inspect PDF "${sourcePath(path)}": ${message}`);
  }
}
