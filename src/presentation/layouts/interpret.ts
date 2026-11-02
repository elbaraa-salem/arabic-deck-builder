import type { InterpretSlide } from "../../types/slide.ts";

import { resolveImagePath } from "../../assets/asset-resolver.ts";

import { fitImageContain } from "../image.ts";

import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { theme } from "../theme.ts";
import { addContentDecorations } from "../decorations.ts";

const choiceLabels = ["أ)", "ب)", "ج)", "د)"];

export function renderInterpretSlide(
  presentation: Presentation,
  spec: InterpretSlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  addContentDecorations(slide);

  slide.addText(spec.passage, {
    x: 1.4,
    y: 0.45,
    w: 10.5,
    h: 1.15,

    fontFace: theme.fonts.arabic,

    fontSize: theme.typography.readingText,

    color: theme.colors.arabic,

    bold: true,

    align: "center",
    valign: "middle",
    rtlMode: true,

    margin: 0,
  });

  let questionY = 2.05;

  if (spec.image) {
    const imagePath = resolveImagePath(spec.image);

    slide.addImage(
      fitImageContain(imagePath, {
        x: 5.15,
        y: 1.65,
        w: 3,
        h: 1.75,
      }),
    );

    questionY = 3.55;
  }

  slide.addText(spec.question, {
    x: 1.5,
    y: questionY,
    w: 10.3,
    h: 0.65,

    fontFace: theme.fonts.arabic,

    fontSize: theme.typography.promptEmphasis,

    color: theme.colors.arabic,

    bold: true,

    align: "center",
    rtlMode: true,

    margin: 0,
  });

  let choicesStartY = questionY + 0.9;

  if (spec.support.translation) {
    slide.addText(spec.support.translation, {
      x: 2,
      y: choicesStartY,
      w: 9.3,
      h: 0.35,

      fontFace: theme.fonts.translation,

      fontSize: theme.typography.translation,

      color: theme.colors.translation,

      align: "center",

      margin: 0,
    });

    choicesStartY += 0.5;
  }

  if (spec.support.hint) {
    slide.addText(spec.support.hint, {
      x: 2,
      y: choicesStartY,
      w: 9.3,
      h: 0.4,

      fontFace: theme.fonts.arabic,

      fontSize: theme.typography.support,

      color: theme.colors.accent,

      align: "center",
      rtlMode: true,

      margin: 0,
    });

    choicesStartY += 0.5;
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

      fontSize: shouldHighlight ? theme.typography.choiceCorrect : theme.typography.choice,

      color: shouldHighlight ? theme.colors.accent : theme.colors.choice,

      bold: shouldHighlight,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  return slide;
}
