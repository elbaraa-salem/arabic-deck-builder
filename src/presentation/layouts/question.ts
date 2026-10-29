import type {
  IntroduceSlide,
  QuestionSlide,
  RevealSlide,
} from "../../types/slide.ts";

import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { theme } from "../theme.ts";

export function renderQuestionSlide(
  presentation: Presentation,
  spec: QuestionSlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  slide.addText(spec.question, {
    x: 2,
    y: 1,
    w: 9.33,
    h: 1,
    fontFace: theme.fonts.arabic,
    fontSize: 38,
    color: theme.colors.arabic,
    bold: true,
    align: "center",
    valign: "middle",
    rtlMode: true,
    margin: 0,
  });

  slide.addText(`[ ${spec.image} ]`, {
    x: 4.2,
    y: 2.7,
    w: 4.9,
    h: 2,
    fontFace: theme.fonts.russian,
    fontSize: 24,
    color: theme.colors.russian,
    align: "center",
    valign: "middle",
    margin: 0,
  });

  return slide;
}
