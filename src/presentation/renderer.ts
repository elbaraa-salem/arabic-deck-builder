import type { SlideSpec } from "../types/slide.ts";
import { renderDialogueSlide } from "./layouts/dialogue.ts";
import { renderDiscriminateSlide } from "./layouts/discriminate.ts";
import { renderErrorCorrectionSlide } from "./layouts/error-correction.ts";
import { renderInformationGapSlide } from "./layouts/information-gap.ts";
import { renderInterpretSlide } from "./layouts/interpret.ts";

import { renderIntroduceSlide } from "./layouts/introduce.ts";
import { renderNoticingSlide } from "./layouts/noticing.ts";
import { renderPersonalizeSlide } from "./layouts/personalize.ts";
import { renderQuestionSlide } from "./layouts/question.ts";
import { renderRecallSlide } from "./layouts/recall.ts";
import { renderRevealSlide } from "./layouts/reveal.ts";
import { renderRolePlaySlide } from "./layouts/role-play.ts";
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
    case "interpret":
      return renderInterpretSlide(presentation, slide);
    case "information_gap":
      return renderInformationGapSlide(presentation, slide);
    case "role_play":
      return renderRolePlaySlide(presentation, slide);
    case "noticing":
      return renderNoticingSlide(presentation, slide);
    case "error_correction":
      return renderErrorCorrectionSlide(presentation, slide);
  }
}
