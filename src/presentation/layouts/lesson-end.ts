import type { LessonEndSlide } from "../../types/slide.ts";

import { addFullDecorations } from "../decorations.ts";

import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { theme } from "../theme.ts";

export function renderLessonEndSlide(
  presentation: Presentation,
  spec: LessonEndSlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  addFullDecorations(slide, {
    dividerY: 4.15,
  });

  slide.addText(spec.title, {
    x: theme.layout.contentX,
    y: 2.0,
    w: theme.layout.contentWidth,
    h: 1.1,

    fontFace: theme.fonts.arabic,

    fontSize: theme.typography.lessonTitle,

    color: theme.colors.accent,

    bold: true,

    align: "center",
    valign: "middle",

    rtlMode: true,

    margin: 0,
  });

  if (spec.subtitle) {
    slide.addText(spec.subtitle, {
      x: theme.layout.contentX,
      y: 3.4,
      w: theme.layout.contentWidth,
      h: 0.75,

      fontFace: theme.fonts.arabic,

      fontSize: theme.typography.activityTitle,

      color: theme.colors.arabic,

      bold: true,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  if (spec.translation) {
    slide.addText(spec.translation, {
      x: theme.layout.innerContentX,
      y: 4.5,
      w: theme.layout.innerContentWidth,
      h: 0.5,

      fontFace: theme.fonts.translation,

      fontSize: theme.typography.translation,

      color: theme.colors.translation,

      align: "center",

      margin: 0,
    });
  }

  return slide;
}
