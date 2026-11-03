import type { QuestionSlide } from "../../types/slide.ts";
import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { resolveVisualSource } from "../../visuals/visual-source-resolver.ts";
import { theme } from "../theme.ts";
import { fitImageContain } from "../image.ts";
import { addContentDecorations } from "../decorations.ts";

export function renderQuestionSlide(
  presentation: Presentation,
  spec: QuestionSlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  addContentDecorations(slide);

  const imagePath = resolveVisualSource(spec.visual);

  slide.addText(spec.question, {
    x: theme.layout.contentX,
    y: 0.8,
    w: 10.33,
    h: 0.9,
    fontFace: theme.fonts.arabic,
    fontSize: theme.typography.headline,
    color: theme.colors.arabic,
    bold: true,
    align: "center",
    valign: "middle",
    rtlMode: true,
    margin: 0,
  });

  slide.addImage(
    fitImageContain(imagePath, {
      x: 3.1,
      y: 1.9,
      w: 7.1,
      h: 3.8,
    }),
  );

  return slide;
}
