import type { IntroduceSlide } from "../../types/slide.ts";

import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { theme } from "../theme.ts";

export function renderIntroduceSlide(
  presentation: Presentation,
  spec: IntroduceSlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  slide.addText(spec.arabic, {
    x: 2,
    y: 2.1,
    w: 9.33,
    h: 1,
    fontFace: theme.fonts.arabic,
    fontSize: 48,
    color: theme.colors.arabic,
    bold: true,
    align: "center",
    valign: "middle",
    rtlMode: true,
    margin: 0,
  });

  slide.addText(spec.russian, {
    x: 2,
    y: 3.35,
    w: 9.33,
    h: 0.6,
    fontFace: theme.fonts.russian,
    fontSize: 22,
    color: theme.colors.russian,
    align: "center",
    valign: "middle",
    margin: 0,
  });

  return slide;
}
