import type { SlideSpec } from "../types/slide.ts";

import { renderIntroduceSlide } from "./layouts/introduce.ts";
import { renderQuestionSlide } from "./layouts/question.ts";
import { renderRevealSlide } from "./layouts/reveal.ts";
import type { PowerPointSlide, Presentation } from "./pptx.ts";

export function renderSlide(
  presentation: Presentation,
  slide: SlideSpec,
): PowerPointSlide {
  switch (slide.type) {
    case "introduce":
      return renderIntroduceSlide(presentation, slide);
    case "question":
      return renderQuestionSlide(presentation, slide);
    case "reveal":
      return renderRevealSlide(presentation, slide);
  }
}
