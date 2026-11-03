import { YAMLParseError } from "yaml";

import { ZodError } from "zod";

import { resolveVisualSource } from "../visuals/visual-source-resolver.ts";

import { loadLesson } from "../parser/lesson.parser.ts";

import { planSlides } from "../planner/slide-planner.ts";

import type { SlideSpec } from "../types/slide.ts";

import type {
  PreflightIssue,
  PreflightResult,
  PreparedLesson,
} from "../types/preflight.ts";

import { collectSlideVisualSources } from "./slide-assets.ts";

import { formatPreflightIssue } from "./format-issue.ts";

type InspectionResult = {
  slides?: SlideSpec[];

  visualCount: number;

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
      visualCount: 0,

      missingImages: [],

      issues: classifyLoadError(error),
    };
  }

  let slides: SlideSpec[];

  try {
    slides = planSlides(lesson);
  } catch (error) {
    return {
      visualCount: 0,

      missingImages: [],

      issues: [
        {
          type: "planning",

          message: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }

  const sources = collectSlideVisualSources(slides);

  const missingImages: string[] = [];

  const issues: PreflightIssue[] = [];

  for (const source of sources) {
    try {
      resolveVisualSource(source);
    } catch (error) {
      if (source.kind === "generated") {
        issues.push({
          type: "visual",

          path: JSON.stringify(source.spec),

          message: error instanceof Error ? error.message : String(error),
        });

        continue;
      }

      missingImages.push(source.key);

      issues.push({
        type: "asset",

        path: source.key,

        message: "Image asset was not found.",
      });
    }
  }

  return {
    slides,

    visualCount: sources.length,

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

    visualCount: inspection.visualCount,

    missingImages: inspection.missingImages,

    issues: inspection.issues,
  };
}
