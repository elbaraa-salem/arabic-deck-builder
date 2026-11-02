import type { SlideSpec } from "../types/slide.ts";
import { renderDialogueSlide } from "./layouts/dialogue.ts";
import { renderDiscriminateSlide } from "./layouts/discriminate.ts";

import { renderIntroduceSlide } from "./layouts/introduce.ts";
import { renderPersonalizeSlide } from "./layouts/personalize.ts";
import { renderQuestionSlide } from "./layouts/question.ts";
import { renderRecallSlide } from "./layouts/recall.ts";
import { renderRevealSlide } from "./layouts/reveal.ts";
import { renderTransformSlide } from "./layouts/transform.ts";
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
    case "dialogue":
      return renderDialogueSlide(presentation, slide);
    case "recall":
      return renderRecallSlide(presentation, slide);
    case "discriminate":
      return renderDiscriminateSlide(presentation, slide);
    case "transform":
      return renderTransformSlide(presentation, slide);
    case "personalize":
      return renderPersonalizeSlide(presentation, slide);
  }
}
