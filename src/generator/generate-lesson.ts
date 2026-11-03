import { mkdir } from "node:fs/promises";

import { basename, extname, join } from "node:path";

import { loadLesson } from "../parser/lesson.parser.ts";

import { planSlides } from "../planner/slide-planner.ts";

import { renderPresentation } from "../presentation/render-presentation.ts";
import type { GenerationResult } from "../types/generateLesson.ts";

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

  await mkdir(outputDirectory, {
    recursive: true,
  });

  const lesson = await loadLesson(lessonPath);

  const slides = planSlides(lesson);

  await renderPresentation(slides, outputPath);

  return {
    lessonPath,
    outputPath,
    slideCount: slides.length,
  };
}
