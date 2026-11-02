import type { TransformSlide } from "../../types/slide.ts";

import { resolveImagePath } from "../../assets/asset-resolver.ts";

import { fitImageContain } from "../image.ts";

import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { theme } from "../theme.ts";
import { addContentDecorations } from "../decorations.ts";

export function renderTransformSlide(
  presentation: Presentation,
  spec: TransformSlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  addContentDecorations(slide);

  slide.addText(spec.instruction, {
    x: 1.5,
    y: 0.35,
    w: 10.3,
    h: 0.55,

    fontFace: theme.fonts.arabic,
    fontSize: theme.typography.instructionStrong,

    color: theme.colors.choice,

    align: "center",
    rtlMode: true,

    margin: 0,
  });

  slide.addText(spec.model, {
    x: 1.5,
    y: 1.15,
    w: 10.3,
    h: 0.8,

    fontFace: theme.fonts.arabic,
    fontSize: theme.typography.arabicLarge,

    color: theme.colors.arabic,

    bold: true,

    align: "center",
    rtlMode: true,

    margin: 0,
  });

  slide.addText("↓", {
    x: 6.15,
    y: 2.05,
    w: 1,
    h: 0.5,

    fontFace: theme.fonts.translation,
    fontSize: theme.typography.arabicText,

    color: theme.colors.accent,

    align: "center",

    margin: 0,
  });

  let cueY = 2.65;

  if (spec.cue.image) {
    const imagePath = resolveImagePath(spec.cue.image);

    slide.addImage(
      fitImageContain(imagePath, {
        x: 5.15,
        y: 2.45,
        w: 3,
        h: 2,
      }),
    );

    cueY = 4.55;
  }

  slide.addText(spec.cue.text, {
    x: 2,
    y: cueY,
    w: 9.3,
    h: 0.65,

    fontFace: theme.fonts.arabic,
    fontSize: theme.typography.answerEmphasis,

    color: theme.colors.accent,

    bold: true,

    align: "center",
    rtlMode: true,

    margin: 0,
  });

  if (spec.support.translation) {
    slide.addText(spec.support.translation, {
      x: 2,
      y: 5.2,
      w: 9.3,
      h: 0.35,

      fontFace: theme.fonts.translation,

      fontSize: theme.typography.translation,

      color: theme.colors.translation,

      align: "center",

      margin: 0,
    });
  }

  if (spec.support.hint) {
    slide.addText(spec.support.hint, {
      x: 2,
      y: 5.65,
      w: 9.3,
      h: 0.5,

      fontFace: theme.fonts.arabic,

      fontSize: theme.typography.supportStrong,

      color: theme.colors.choice,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  if (spec.showAnswer) {
    slide.addText(spec.answer, {
      x: 1.5,
      y: 5.35,
      w: 10.3,
      h: 0.8,

      fontFace: theme.fonts.arabic,

      fontSize: theme.typography.answerStrong,

      color: theme.colors.accent,

      bold: true,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  return slide;
}
