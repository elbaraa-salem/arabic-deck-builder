import type { SlideSpec } from "../types/slide.ts";
import type { SupportStage } from "../types/support.ts";

type SupportPlan = {
  stages: SupportStage[];
};

export function getSupportStages(
  support: SupportPlan | undefined,
): SupportStage[] {
  return support?.stages ?? [{}];
}

export function addSupportSequence(
  slides: SlideSpec[],
  support: SupportPlan | undefined,
  buildSlide: (support: SupportStage) => SlideSpec,
  buildReveal?: () => SlideSpec,
): void {
  for (const stage of getSupportStages(support)) {
    slides.push(buildSlide(stage));
  }

  if (buildReveal) {
    slides.push(buildReveal());
  }
}
