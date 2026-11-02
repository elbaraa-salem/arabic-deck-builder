import type { ErrorCorrectionSlide } from "../../types/slide.ts";

import { resolveImagePath } from "../../assets/asset-resolver.ts";

import { fitImageContain } from "../image.ts";

import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { theme } from "../theme.ts";

export function renderErrorCorrectionSlide(
  presentation: Presentation,
  spec: ErrorCorrectionSlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  slide.addText(spec.instruction, {
    x: 1.5,
    y: 0.35,
    w: 10.3,
    h: 0.5,

    fontFace: theme.fonts.arabic,
    fontSize: 19,

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
    x: 1.5,
    y: incorrectY,
    w: 10.3,
    h: 0.9,

    fontFace: theme.fonts.arabic,
    fontSize: 34,

    color: theme.colors.arabic,

    bold: true,

    align: "center",
    rtlMode: true,

    margin: 0,
  });

  let supportY = incorrectY + 1.15;

  if (spec.support.translation) {
    slide.addText(spec.support.translation, {
      x: 2,
      y: supportY,
      w: 9.3,
      h: 0.35,

      fontFace: theme.fonts.translation,

      fontSize: 15,

      color: theme.colors.translation,

      align: "center",

      margin: 0,
    });

    supportY += 0.5;
  }

  if (spec.support.hint) {
    slide.addText(spec.support.hint, {
      x: 2,
      y: supportY,
      w: 9.3,
      h: 0.5,

      fontFace: theme.fonts.arabic,

      fontSize: 20,

      color: theme.colors.accent,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  if (spec.showCorrection) {
    slide.addText(spec.correction, {
      x: 1.5,
      y: 5.1,
      w: 10.3,
      h: 0.8,

      fontFace: theme.fonts.arabic,

      fontSize: 31,

      color: theme.colors.accent,

      bold: true,

      align: "center",
      rtlMode: true,

      margin: 0,
    });

    if (spec.explanation) {
      slide.addText(spec.explanation, {
        x: 2,
        y: 6.0,
        w: 9.3,
        h: 0.55,

        fontFace: theme.fonts.arabic,

        fontSize: 17,

        color: theme.colors.choice,

        align: "center",
        rtlMode: true,

        margin: 0,
      });
    }
  }

  return slide;
}
