import type { PersonalizeSlide } from "../../types/slide.ts";

import { resolveVisualSource } from "../../visuals/visual-source-resolver.ts";

import { fitImageContain } from "../image.ts";

import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { theme } from "../theme.ts";
import { addContentDecorations } from "../decorations.ts";

export function renderPersonalizeSlide(
  presentation: Presentation,
  spec: PersonalizeSlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  addContentDecorations(slide);

  let questionY = 1.2;

  if (spec.model) {
    slide.addText(spec.model, {
      x: theme.layout.contentX,
      y: 0.55,
      w: theme.layout.contentWidth,
      h: 0.65,

      fontFace: theme.fonts.arabic,
      fontSize: theme.typography.arabicSmall,

      color: theme.colors.choice,

      align: "center",
      rtlMode: true,

      margin: 0,
    });

    questionY = 1.45;
  }

  slide.addText(spec.question, {
    x: theme.layout.contentX,
    y: questionY,
    w: theme.layout.contentWidth,
    h: 0.8,

    fontFace: theme.fonts.arabic,
    fontSize: theme.typography.promptLarge,

    color: theme.colors.arabic,

    bold: true,

    align: "center",
    rtlMode: true,

    margin: 0,
  });

  let supportStartY = 4.8;

  if (spec.visual) {
    const imagePath = resolveVisualSource(spec.visual);

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
      x: theme.layout.innerContentX,
      y: supportStartY,
      w: theme.layout.innerContentWidth,
      h: 0.4,

      fontFace: theme.fonts.translation,

      fontSize: theme.typography.translationMedium,

      color: theme.colors.translation,

      align: "center",

      margin: 0,
    });

    supportStartY += 0.55;
  }

  if (spec.support.hint) {
    slide.addText(spec.support.hint, {
      x: theme.layout.innerContentX,
      y: supportStartY,
      w: theme.layout.innerContentWidth,
      h: 0.6,

      fontFace: theme.fonts.arabic,

      fontSize: theme.typography.arabicText,

      color: theme.colors.accent,

      bold: true,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  return slide;
}
