import type { NoticingSlide } from "../../types/slide.ts";

import { resolveImagePath } from "../../assets/asset-resolver.ts";

import { fitImageContain } from "../image.ts";

import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { theme } from "../theme.ts";

export function renderNoticingSlide(
  presentation: Presentation,
  spec: NoticingSlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  slide.addText(spec.instruction, {
    x: 1.5,
    y: 0.3,
    w: 10.3,
    h: 0.45,

    fontFace: theme.fonts.arabic,
    fontSize: 18,

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

    if (item.image) {
      const imagePath = resolveImagePath(item.image);

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
      y: item.image ? 3.55 : 2.0,

      w: itemWidth,
      h: 0.7,

      fontFace: theme.fonts.arabic,

      fontSize: 28,

      color: theme.colors.arabic,

      bold: true,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  slide.addText(spec.question, {
    x: 1.5,
    y: 4.45,
    w: 10.3,
    h: 0.65,

    fontFace: theme.fonts.arabic,

    fontSize: 25,

    color: theme.colors.choice,

    bold: true,

    align: "center",
    rtlMode: true,

    margin: 0,
  });

  let supportY = 5.25;

  if (spec.support.translation) {
    slide.addText(spec.support.translation, {
      x: 2,
      y: supportY,
      w: 9.3,
      h: 0.35,

      fontFace: theme.fonts.translation,

      fontSize: 15,

      color: theme.colors.translation,

      align: "center",

      margin: 0,
    });

    supportY += 0.45;
  }

  if (spec.support.hint) {
    slide.addText(spec.support.hint, {
      x: 2,
      y: supportY,
      w: 9.3,
      h: 0.45,

      fontFace: theme.fonts.arabic,

      fontSize: 19,

      color: theme.colors.accent,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  if (spec.showInsight) {
    slide.addText(spec.insight, {
      x: 1.5,
      y: 5.55,
      w: 10.3,
      h: 0.8,

      fontFace: theme.fonts.arabic,

      fontSize: 27,

      color: theme.colors.accent,

      bold: true,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  return slide;
}
