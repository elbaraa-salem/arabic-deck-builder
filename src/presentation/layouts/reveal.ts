import type { RevealSlide } from "../../types/slide.ts";
import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { resolveImagePath } from "../../assets/asset-resolver.ts";
import { theme } from "../theme.ts";
import { fitImageContain } from "../image.ts";
import { addContentDecorations } from "../decorations.ts";

export function renderRevealSlide(
  presentation: Presentation,
  spec: RevealSlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  addContentDecorations(slide);

  const imagePath = resolveImagePath(spec.image);

  slide.addText(spec.question, {
    x: 1.5,
    y: 0.5,
    w: 10.33,
    h: 0.8,
    fontFace: theme.fonts.arabic,
    fontSize: 28,
    color: theme.colors.arabic,
    align: "center",
    valign: "middle",
    rtlMode: true,
    margin: 0,
  });

  slide.addImage(
    fitImageContain(imagePath, {
      x: 3.3,
      y: 1.45,
      w: 6.7,
      h: 3.4,
    }),
  );

  slide.addText(spec.answer, {
    x: 1.5,
    y: 5.2,
    w: 10.33,
    h: 0.8,
    fontFace: theme.fonts.arabic,
    fontSize: 30,
    color: theme.colors.accent,
    bold: true,
    align: "center",
    valign: "middle",
    rtlMode: true,
    margin: 0,
  });

  return slide;
}
