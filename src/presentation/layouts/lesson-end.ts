import type { LessonEndSlide } from "../../types/slide.ts";

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

  slide.addText(spec.title, {
    x: 1.5,
    y: 2.0,
    w: 10.3,
    h: 1.1,

    fontFace: theme.fonts.arabic,

    fontSize: 42,

    color: theme.colors.accent,

    bold: true,

    align: "center",
    valign: "middle",

    rtlMode: true,

    margin: 0,
  });

  if (spec.subtitle) {
    slide.addText(spec.subtitle, {
      x: 1.5,
      y: 3.4,
      w: 10.3,
      h: 0.75,

      fontFace: theme.fonts.arabic,

      fontSize: 28,

      color: theme.colors.arabic,

      bold: true,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  if (spec.translation) {
    slide.addText(spec.translation, {
      x: 2,
      y: 4.5,
      w: 9.3,
      h: 0.5,

      fontFace: theme.fonts.translation,

      fontSize: 17,

      color: theme.colors.translation,

      align: "center",

      margin: 0,
    });
  }

  return slide;
}
