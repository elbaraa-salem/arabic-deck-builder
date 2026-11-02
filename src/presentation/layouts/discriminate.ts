import type { DiscriminateSlide } from "../../types/slide.ts";

import { resolveImagePath } from "../../assets/asset-resolver.ts";

import { fitImageContain } from "../image.ts";

import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { theme } from "../theme.ts";

const choiceLabels = ["أ)", "ب)", "ج)", "د)"];

export function renderDiscriminateSlide(
  presentation: Presentation,
  spec: DiscriminateSlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  slide.addText(spec.question, {
    x: 1.5,
    y: 0.4,
    w: 10.3,
    h: 0.7,

    fontFace: theme.fonts.arabic,
    fontSize: 30,

    color: theme.colors.arabic,

    bold: true,

    align: "center",
    rtlMode: true,

    margin: 0,
  });

  if (spec.support.translation) {
    slide.addText(spec.support.translation, {
      x: 2,
      y: 1.12,
      w: 9.3,
      h: 0.35,

      fontFace: theme.fonts.translation,

      fontSize: 15,

      color: theme.colors.translation,

      align: "center",

      margin: 0,
    });
  }

  if (spec.support.hint) {
    slide.addText(spec.support.hint, {
      x: 2,
      y: 1.52,
      w: 9.3,
      h: 0.4,

      fontFace: theme.fonts.arabic,

      fontSize: 18,

      color: theme.colors.accent,

      bold: true,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  let choicesStartY = 2.25;

  if (spec.image) {
    const imagePath = resolveImagePath(spec.image);

    slide.addImage(
      fitImageContain(imagePath, {
        x: 4.65,
        y: 1.65,
        w: 4,
        h: 2.65,
      }),
    );

    choicesStartY = 4.55;
  }

  const availableHeight = 7.05 - choicesStartY;

  const rowHeight = Math.min(0.65, availableHeight / spec.choices.length);

  for (let index = 0; index < spec.choices.length; index++) {
    const choice = spec.choices[index];

    const label = choiceLabels[index];

    const displayedChoice = `${label} ${choice}`;

    const isCorrect = choice === spec.answer;

    const shouldHighlight = spec.showAnswer && isCorrect;

    slide.addText(displayedChoice, {
      x: 3,
      y: choicesStartY + index * rowHeight,

      w: 7.3,
      h: 0.55,

      fontFace: theme.fonts.arabic,

      fontSize: shouldHighlight ? 28 : 24,

      color: shouldHighlight ? theme.colors.accent : theme.colors.choice,

      bold: shouldHighlight,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  return slide;
}
