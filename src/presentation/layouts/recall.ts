import type { RecallSlide } from "../../types/slide.ts";

import { resolveImagePath } from "../../assets/asset-resolver.ts";

import { fitImageContain } from "../image.ts";

import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { theme } from "../theme.ts";
import { addContentDecorations } from "../decorations.ts";

export function renderRecallSlide(
  presentation: Presentation,
  spec: RecallSlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  addContentDecorations(slide);

  slide.addText(spec.question, {
    x: theme.layout.contentX,
    y: 0.5,
    w: theme.layout.contentWidth,
    h: 0.7,

    fontFace: theme.fonts.arabic,
    fontSize: theme.typography.prompt,

    color: theme.colors.arabic,

    bold: true,

    align: "center",
    rtlMode: true,

    margin: 0,
  });

  if (spec.image) {
    const imagePath = resolveImagePath(spec.image);

    slide.addImage(
      fitImageContain(imagePath, {
        x: 4.65,
        y: 1.45,
        w: 4,
        h: 3.45,
      }),
    );
  }

  if (spec.support.translation) {
    slide.addText(spec.support.translation, {
      x: theme.layout.innerContentX,
      y: 5.05,
      w: theme.layout.innerContentWidth,
      h: 0.4,

      fontFace: theme.fonts.translation,

      fontSize: theme.typography.translationMedium,

      color: theme.colors.translation,

      align: "center",

      margin: 0,
    });
  }

  if (spec.support.hint) {
    slide.addText(spec.support.hint, {
      x: theme.layout.innerContentX,
      y: 5.55,
      w: theme.layout.innerContentWidth,
      h: 0.45,

      fontFace: theme.fonts.arabic,

      fontSize: theme.typography.supportStrong,

      color: theme.colors.accent,

      bold: true,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  if (spec.showAnswer) {
    slide.addText(spec.answer, {
      x: theme.layout.innerContentX,
      y: 5.3,
      w: theme.layout.innerContentWidth,
      h: 0.85,

      fontFace: theme.fonts.arabic,

      fontSize: theme.typography.answerReveal,

      color: theme.colors.accent,

      bold: true,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  return slide;
}
