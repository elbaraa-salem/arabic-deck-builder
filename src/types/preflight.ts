import type { SlideSpec } from "./slide.ts";

export type PreflightIssueType =
  | "file"
  | "yaml"
  | "schema"
  | "planning"
  | "asset"
  | "visual"
  | "unknown";

export type PreflightIssue = {
  type: PreflightIssueType;

  message: string;

  path?: string;
};

export type PreflightResult = {
  lessonPath: string;

  ok: boolean;

  slideCount: number;

  visualCount: number;

  missingImages: string[];

  issues: PreflightIssue[];
};

export type PreparedLesson = {
  slides: SlideSpec[];
};
