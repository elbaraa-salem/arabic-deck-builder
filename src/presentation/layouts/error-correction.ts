import type { ErrorCorrectionSlide } from "../../types/slide.ts";

import { resolveImagePath } from "../../assets/asset-resolver.ts";

import { fitImageContain } from "../image.ts";

import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { theme } from "../theme.ts";
import { addContentDecorations } from "../decorations.ts";

export function renderErrorCorrectionSlide(
  presentation: Presentation,
  spec: ErrorCorrectionSlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  addContentDecorations(slide);

  slide.addText(spec.instruction, {
    x: theme.layout.contentX,
    y: 0.35,
    w: theme.layout.contentWidth,
    h: 0.5,

    fontFace: theme.fonts.arabic,
    fontSize: theme.typography.instruction,

    color: theme.colors.choice,

    align: "center",
    rtlMode: true,

    margin: 0,
  });

  let incorrectY = 1.65;

  if (spec.image) {
    const imagePath = resolveImagePath(spec.image);

    slide.addImage(
      fitImageContain(imagePath, {
        x: 4.9,
        y: 1.0,
        w: 3.5,
        h: 2.3,
      }),
    );

    incorrectY = 3.45;
  }

  slide.addText(spec.incorrect, {
    x: theme.layout.contentX,
    y: incorrectY,
    w: theme.layout.contentWidth,
    h: 0.9,

    fontFace: theme.fonts.arabic,
    fontSize: theme.typography.headline,

    color: theme.colors.arabic,

    bold: true,

    align: "center",
    rtlMode: true,

    margin: 0,
  });

  let supportY = incorrectY + 1.15;

  if (spec.support.translation) {
    slide.addText(spec.support.translation, {
      x: theme.layout.innerContentX,
      y: supportY,
      w: theme.layout.innerContentWidth,
      h: 0.35,

      fontFace: theme.fonts.translation,

      fontSize: theme.typography.translation,

      color: theme.colors.translation,

      align: "center",

      margin: 0,
    });

    supportY += 0.5;
  }

  if (spec.support.hint) {
    slide.addText(spec.support.hint, {
      x: theme.layout.innerContentX,
      y: supportY,
      w: theme.layout.innerContentWidth,
      h: 0.5,

      fontFace: theme.fonts.arabic,

      fontSize: theme.typography.supportDense,

      color: theme.colors.accent,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  if (spec.showCorrection) {
    slide.addText(spec.correction, {
      x: theme.layout.contentX,
      y: 5.1,
      w: theme.layout.contentWidth,
      h: 0.8,

      fontFace: theme.fonts.arabic,

      fontSize: theme.typography.answer,

      color: theme.colors.accent,

      bold: true,

      align: "center",
      rtlMode: true,

      margin: 0,
    });

    if (spec.explanation) {
      slide.addText(spec.explanation, {
        x: theme.layout.innerContentX,
        y: 6.0,
        w: theme.layout.innerContentWidth,
        h: 0.55,

        fontFace: theme.fonts.arabic,

        fontSize: theme.typography.explanation,

        color: theme.colors.choice,

        align: "center",
        rtlMode: true,

        margin: 0,
      });
    }
  }

  return slide;
}
