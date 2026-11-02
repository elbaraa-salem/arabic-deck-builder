import type { PersonalizeSlide } from "../../types/slide.ts";

import { resolveImagePath } from "../../assets/asset-resolver.ts";

import { fitImageContain } from "../image.ts";

import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { theme } from "../theme.ts";

export function renderPersonalizeSlide(
  presentation: Presentation,
  spec: PersonalizeSlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  let questionY = 1.2;

  if (spec.model) {
    slide.addText(spec.model, {
      x: 1.5,
      y: 0.55,
      w: 10.3,
      h: 0.65,

      fontFace: theme.fonts.arabic,
      fontSize: 22,

      color: theme.colors.choice,

      align: "center",
      rtlMode: true,

      margin: 0,
    });

    questionY = 1.45;
  }

  slide.addText(spec.question, {
    x: 1.5,
    y: questionY,
    w: 10.3,
    h: 0.8,

    fontFace: theme.fonts.arabic,
    fontSize: 31,

    color: theme.colors.arabic,

    bold: true,

    align: "center",
    rtlMode: true,

    margin: 0,
  });

  let supportStartY = 4.8;

  if (spec.image) {
    const imagePath = resolveImagePath(spec.image);

    slide.addImage(
      fitImageContain(imagePath, {
        x: 4.65,
        y: 2.35,
        w: 4,
        h: 2.5,
      }),
    );

    supportStartY = 5.15;
  }

  if (spec.support.translation) {
    slide.addText(spec.support.translation, {
      x: 2,
      y: supportStartY,
      w: 9.3,
      h: 0.4,

      fontFace: theme.fonts.translation,

      fontSize: 16,

      color: theme.colors.translation,

      align: "center",

      margin: 0,
    });

    supportStartY += 0.55;
  }

  if (spec.support.hint) {
    slide.addText(spec.support.hint, {
      x: 2,
      y: supportStartY,
      w: 9.3,
      h: 0.6,

      fontFace: theme.fonts.arabic,

      fontSize: 24,

      color: theme.colors.accent,

      bold: true,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  return slide;
}
