import type { IntroduceSlide } from "../../types/slide.ts";
import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { resolveImagePath } from "../../assets/asset-resolver.ts";
import { theme } from "../theme.ts";

export function renderIntroduceSlide(
  presentation: Presentation,
  spec: IntroduceSlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  const imagePath = resolveImagePath(spec.image);

  slide.addImage({
    path: imagePath,
    x: 3.35,
    y: 0.8,
    w: 6.6,
    h: 3.4,
  });

  slide.addText(spec.arabic, {
    x: 1.5,
    y: 4.55,
    w: 10.33,
    h: 0.9,
    fontFace: theme.fonts.arabic,
    fontSize: 30,
    color: theme.colors.arabic,
    bold: true,
    align: "center",
    valign: "middle",
    rtlMode: true,
    margin: 0,
  });

  if (spec.russian) {
    slide.addText(spec.russian, {
      x: 1.5,
      y: 5.35,
      w: 10.33,
      h: 0.5,
      fontFace: theme.fonts.russian,
      fontSize: 18,
      color: theme.colors.russian,
      align: "center",
      valign: "middle",
      margin: 0,
    });
  }

  return slide;
}
