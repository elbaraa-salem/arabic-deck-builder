import { mkdir } from "node:fs/promises";

import { basename, extname, join } from "node:path";

import { renderPresentation } from "../presentation/render-presentation.ts";

import type { GenerationResult } from "../types/generation.ts";

import { prepareLesson } from "../validation/preflight.ts";

export async function generateLesson(
  lessonPath: string,
): Promise<GenerationResult> {
  const extension = extname(lessonPath);

  if (extension !== ".yaml" && extension !== ".yml") {
    throw new Error(`Lesson file must be YAML: ${lessonPath}`);
  }

  const lessonName = basename(lessonPath, extension);

  const outputDirectory = "output";

  const outputPath = join(outputDirectory, `${lessonName}.pptx`);

  const prepared = await prepareLesson(lessonPath);

  await mkdir(outputDirectory, {
    recursive: true,
  });

  await renderPresentation(prepared.slides, outputPath);

  return {
    lessonPath,

    outputPath,

    slideCount: prepared.slides.length,
  };
}
