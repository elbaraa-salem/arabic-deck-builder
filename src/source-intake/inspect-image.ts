import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { imageSize } from "image-size";
import type { SourceIntakePage } from "../types/source-intake.ts";
import { sourcePath } from "./source-path.ts";

const imageFormats: Record<string, string> = {
  ".png": "png",
  ".jpg": "jpg",
  ".jpeg": "jpg",
  ".webp": "webp",
};

export function isSupportedImage(path: string): boolean {
  return Object.hasOwn(imageFormats, extname(path).toLowerCase());
}

export async function inspectImage(path: string, pageIndex: number): Promise<SourceIntakePage> {
  try {
    const { width, height, type } = imageSize(await readFile(path));
    if (!width || !height || type !== imageFormats[extname(path).toLowerCase()]) {
      throw new Error("Image content does not match a supported file format");
    }
    return {
      pageIndex,
      sourceFile: sourcePath(path),
      imageFile: sourcePath(path),
      width,
      height,
      dimensionUnit: "pixels",
      embeddedTextAvailable: false,
      embeddedTextCharacterCount: 0,
      suggestedExtraction: "vision",
    };
  } catch (error) {
    throw new Error(`Could not inspect image "${sourcePath(path)}": ${error instanceof Error ? error.message : String(error)}`);
  }
}
