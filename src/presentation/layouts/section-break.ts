import type { SectionBreakSlide } from "../../types/slide.ts";

import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { theme } from "../theme.ts";

export function renderSectionBreakSlide(
  presentation: Presentation,
  spec: SectionBreakSlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  slide.addText(spec.title, {
    x: 1.5,
    y: 2.3,
    w: 10.3,
    h: 1.1,

    fontFace: theme.fonts.arabic,

    fontSize: 40,

    color: theme.colors.arabic,

    bold: true,

    align: "center",
    valign: "middle",

    rtlMode: true,

    margin: 0,
  });

  if (spec.subtitle) {
    slide.addText(spec.subtitle, {
      x: 1.5,
      y: 3.55,
      w: 10.3,
      h: 0.65,

      fontFace: theme.fonts.arabic,

      fontSize: 25,

      color: theme.colors.accent,

      bold: true,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  if (spec.translation) {
    slide.addText(spec.translation, {
      x: 2,
      y: 4.45,
      w: 9.3,
      h: 0.45,

      fontFace: theme.fonts.translation,

      fontSize: 17,

      color: theme.colors.translation,

      align: "center",

      margin: 0,
    });
  }

  return slide;
}
