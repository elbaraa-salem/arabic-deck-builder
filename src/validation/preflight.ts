import { resolveImagePath } from "../assets/asset-resolver.ts";

import { loadLesson } from "../parser/lesson.parser.ts";

import { planSlides } from "../planner/slide-planner.ts";

import type { PreflightResult, PreparedLesson } from "../types/preflight.ts";

import { collectSlideImageKeys } from "./slide-assets.ts";

export async function prepareLesson(
  lessonPath: string,
): Promise<PreparedLesson> {
  const lesson = await loadLesson(lessonPath);

  const slides = planSlides(lesson);

  const imageKeys = collectSlideImageKeys(slides);

  const missingImages: string[] = [];

  for (const imageKey of imageKeys) {
    try {
      resolveImagePath(imageKey);
    } catch {
      missingImages.push(imageKey);
    }
  }

  if (missingImages.length > 0) {
    throw new Error(
      [
        "Missing image assets:",
        ...missingImages.map((image) => `- ${image}`),
      ].join("\n"),
    );
  }

  return {
    slides,
    imageKeys,
  };
}

export async function preflightLesson(
  lessonPath: string,
): Promise<PreflightResult> {
  try {
    const prepared = await prepareLesson(lessonPath);

    return {
      lessonPath,

      ok: true,

      slideCount: prepared.slides.length,

      imageCount: prepared.imageKeys.length,

      missingImages: [],

      errors: [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    const missingImages = message.startsWith("Missing image assets:")
      ? message
          .split("\n")
          .slice(1)
          .map((line) => line.replace(/^-\s*/, ""))
      : [];

    return {
      lessonPath,

      ok: false,

      slideCount: 0,

      imageCount: 0,

      missingImages,

      errors: [message],
    };
  }
}
