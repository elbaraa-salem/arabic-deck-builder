import { YAMLParseError } from "yaml";

import { ZodError } from "zod";

import { resolveImagePath } from "../assets/asset-resolver.ts";

import { loadLesson } from "../parser/lesson.parser.ts";

import { planSlides } from "../planner/slide-planner.ts";

import type { SlideSpec } from "../types/slide.ts";

import type {
  PreflightIssue,
  PreflightResult,
  PreparedLesson,
} from "../types/preflight.ts";

import { collectSlideImageKeys } from "./slide-assets.ts";

import { formatPreflightIssue } from "./format-issue.ts";

type InspectionResult = {
  slides?: SlideSpec[];

  imageKeys: string[];

  missingImages: string[];

  issues: PreflightIssue[];
};

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

function classifyLoadError(error: unknown): PreflightIssue[] {
  if (error instanceof YAMLParseError) {
    return [
      {
        type: "yaml",

        message: error.message,
      },
    ];
  }

  if (error instanceof ZodError) {
    return error.issues.map((issue) => ({
      type: "schema",

      path: issue.path.length > 0 ? issue.path.join(".") : undefined,

      message: issue.message,
    }));
  }

  if (isNodeError(error) && error.code === "ENOENT") {
    return [
      {
        type: "file",

        message: "Lesson file was not found.",
      },
    ];
  }

  return [
    {
      type: "unknown",

      message: error instanceof Error ? error.message : String(error),
    },
  ];
}

async function inspectLesson(lessonPath: string): Promise<InspectionResult> {
  let lesson;

  try {
    lesson = await loadLesson(lessonPath);
  } catch (error) {
    return {
      imageKeys: [],

      missingImages: [],

      issues: classifyLoadError(error),
    };
  }

  let slides: SlideSpec[];

  try {
    slides = planSlides(lesson);
  } catch (error) {
    return {
      imageKeys: [],

      missingImages: [],

      issues: [
        {
          type: "planning",

          message: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }

  const imageKeys = collectSlideImageKeys(slides);

  const missingImages: string[] = [];

  for (const imageKey of imageKeys) {
    try {
      resolveImagePath(imageKey);
    } catch {
      missingImages.push(imageKey);
    }
  }

  const issues: PreflightIssue[] = missingImages.map((image) => ({
    type: "asset",

    path: image,

    message: "Image asset was not found.",
  }));

  return {
    slides,

    imageKeys,

    missingImages,

    issues,
  };
}

export async function prepareLesson(
  lessonPath: string,
): Promise<PreparedLesson> {
  const inspection = await inspectLesson(lessonPath);

  if (inspection.issues.length > 0) {
    throw new Error(inspection.issues.map(formatPreflightIssue).join("\n"));
  }

  if (!inspection.slides) {
    throw new Error("Lesson preparation failed without a reported issue.");
  }

  return {
    slides: inspection.slides,

    imageKeys: inspection.imageKeys,
  };
}

export async function preflightLesson(
  lessonPath: string,
): Promise<PreflightResult> {
  const inspection = await inspectLesson(lessonPath);

  return {
    lessonPath,

    ok: inspection.issues.length === 0,

    slideCount: inspection.slides?.length ?? 0,

    imageCount: inspection.imageKeys.length,

    missingImages: inspection.missingImages,

    issues: inspection.issues,
  };
}
