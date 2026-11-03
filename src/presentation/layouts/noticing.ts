import type { NoticingSlide } from "../../types/slide.ts";

import { resolveVisualSource } from "../../visuals/visual-source-resolver.ts";

import { fitImageContain } from "../image.ts";

import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { theme } from "../theme.ts";
import { addContentDecorations } from "../decorations.ts";

export function renderNoticingSlide(
  presentation: Presentation,
  spec: NoticingSlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  addContentDecorations(slide);

  slide.addText(spec.instruction, {
    x: theme.layout.contentX,
    y: 0.3,
    w: theme.layout.contentWidth,
    h: 0.45,

    fontFace: theme.fonts.arabic,
    fontSize: theme.typography.instructionCompact,

    color: theme.colors.choice,

    align: "center",
    rtlMode: true,

    margin: 0,
  });

  const itemCount = spec.items.length;

  const itemWidth = 10.2 / itemCount;

  const startX = 1.55;

  for (let index = 0; index < spec.items.length; index++) {
    const item = spec.items[index];

    const x = startX + index * itemWidth;

    if (item.visual) {
      const imagePath = resolveVisualSource(item.visual);

      slide.addImage(
        fitImageContain(imagePath, {
          x: x + 0.25,
          y: 1.15,
          w: itemWidth - 0.5,
          h: 2.2,
        }),
      );
    }

    slide.addText(item.text, {
      x,
      y: item.visual ? 3.55 : 2.0,

      w: itemWidth,
      h: 0.7,

      fontFace: theme.fonts.arabic,

      fontSize: theme.typography.exampleText,

      color: theme.colors.arabic,

      bold: true,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  slide.addText(spec.question, {
    x: theme.layout.contentX,
    y: 4.45,
    w: theme.layout.contentWidth,
    h: 0.65,

    fontFace: theme.fonts.arabic,

    fontSize: theme.typography.promptCompact,

    color: theme.colors.choice,

    bold: true,

    align: "center",
    rtlMode: true,

    margin: 0,
  });

  let supportY = 5.25;

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

    supportY += 0.45;
  }

  if (spec.support.hint) {
    slide.addText(spec.support.hint, {
      x: theme.layout.innerContentX,
      y: supportY,
      w: theme.layout.innerContentWidth,
      h: 0.45,

      fontFace: theme.fonts.arabic,

      fontSize: theme.typography.supportMedium,

      color: theme.colors.accent,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  if (spec.showInsight) {
    slide.addText(spec.insight, {
      x: theme.layout.contentX,
      y: 5.55,
      w: theme.layout.contentWidth,
      h: 0.8,

      fontFace: theme.fonts.arabic,

      fontSize: theme.typography.answerEmphasis,

      color: theme.colors.accent,

      bold: true,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  return slide;
}
