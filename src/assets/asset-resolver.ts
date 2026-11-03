import { existsSync } from "node:fs";
import { join } from "node:path";


const IMAGES_DIR = join(process.cwd(), "assets", "images");

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

export function resolveImagePath(imageKey: string): string {
  for (const extension of IMAGE_EXTENSIONS) {
    const candidatePath = join(IMAGES_DIR, `${imageKey}${extension}`);

    if (existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  throw new Error(
    `Image asset not found for key "${imageKey}". Expected file in ${IMAGES_DIR} with one of these extensions: ${IMAGE_EXTENSIONS.join(", ")}`,
  );
}
