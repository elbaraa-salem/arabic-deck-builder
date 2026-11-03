import type { SlideSpec } from "./slide.ts";

export type PreflightResult = {
  lessonPath: string;
  ok: boolean;
  slideCount: number;
  imageCount: number;
  missingImages: string[];
  errors: string[];
};

export type PreparedLesson = {
  slides: SlideSpec[];
  imageKeys: string[];
};
