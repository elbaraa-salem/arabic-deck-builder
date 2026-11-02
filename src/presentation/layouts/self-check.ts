import type { SelfCheckSlide } from "../../types/slide.ts";

import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { theme } from "../theme.ts";

export function renderSelfCheckSlide(
  presentation: Presentation,
  spec: SelfCheckSlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  slide.addText(spec.title, {
    x: 1.5,
    y: 0.55,
    w: 10.3,
    h: 0.75,

    fontFace: theme.fonts.arabic,

    fontSize: 30,

    color: theme.colors.arabic,

    bold: true,

    align: "center",
    rtlMode: true,

    margin: 0,
  });

  const startY = 1.65;

  const availableHeight = 5.2;

  const rowHeight = Math.min(0.95, availableHeight / spec.items.length);

  for (let index = 0; index < spec.items.length; index++) {
    const item = spec.items[index];

    const y = startY + index * rowHeight;

    slide.addText("□", {
      x: 10.85,
      y: y + 0.05,
      w: 0.45,
      h: 0.45,

      fontFace: theme.fonts.translation,

      fontSize: 22,

      color: theme.colors.accent,

      align: "center",

      margin: 0,
    });

    slide.addText(item.text, {
      x: 4.9,
      y,
      w: 5.7,
      h: 0.5,

      fontFace: theme.fonts.arabic,

      fontSize: 21,

      color: theme.colors.arabic,

      bold: true,

      align: "right",
      rtlMode: true,

      margin: 0,
    });

    if (item.prompt) {
      slide.addText(item.prompt, {
        x: 1.3,
        y,
        w: 3.2,
        h: 0.5,

        fontFace: theme.fonts.arabic,

        fontSize: 18,

        color: theme.colors.choice,

        align: "right",
        rtlMode: true,

        margin: 0,
      });
    }
  }

  return slide;
}
