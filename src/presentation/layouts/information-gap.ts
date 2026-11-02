import type { InformationGapSlide } from "../../types/slide.ts";

import { resolveImagePath } from "../../assets/asset-resolver.ts";

import { fitImageContain } from "../image.ts";

import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { theme } from "../theme.ts";
import { addCleanDecorations } from "../decorations.ts";

export function renderInformationGapSlide(
  presentation: Presentation,
  spec: InformationGapSlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  addCleanDecorations(slide);

  slide.addText(spec.instruction, {
    x: 1.5,
    y: 0.3,
    w: 10.3,
    h: 0.5,

    fontFace: theme.fonts.arabic,

    fontSize: theme.typography.instructionDense,

    color: theme.colors.choice,

    align: "center",
    rtlMode: true,

    margin: 0,
  });

  if (spec.subject) {
    slide.addText(spec.subject, {
      x: 1.5,
      y: 0.9,
      w: 10.3,
      h: 0.7,

      fontFace: theme.fonts.arabic,

      fontSize: theme.typography.promptLarge,

      color: theme.colors.arabic,

      bold: true,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  const hasImage = spec.image !== undefined;

  if (spec.image) {
    const imagePath = resolveImagePath(spec.image);

    slide.addImage(
      fitImageContain(imagePath, {
        x: 0.8,
        y: 1.65,
        w: 3.4,
        h: 4.2,
      }),
    );
  }

  const labelX = hasImage ? 8.4 : 7.3;

  const valueX = hasImage ? 4.6 : 3.2;

  const labelWidth = hasImage ? 3.1 : 3.5;

  const valueWidth = hasImage ? 3.3 : 3.7;

  const factsStartY = 2.2;

  const factsHeight = 3.9;

  const rowHeight = Math.min(0.75, factsHeight / spec.facts.length);

  for (let index = 0; index < spec.facts.length; index++) {
    const fact = spec.facts[index];

    const isMissing = fact.answer !== undefined;

    let displayedValue: string;

    if (fact.value) {
      displayedValue = fact.value;
    } else if (spec.showAnswers && fact.answer) {
      displayedValue = fact.answer;
    } else {
      displayedValue = "؟";
    }

    const y = factsStartY + index * rowHeight;

    slide.addText(fact.label, {
      x: labelX,
      y,
      w: labelWidth,
      h: 0.5,

      fontFace: theme.fonts.arabic,

      fontSize: theme.typography.labelStrong,

      color: theme.colors.choice,

      bold: true,

      align: "right",
      rtlMode: true,

      margin: 0,
    });

    slide.addText(displayedValue, {
      x: valueX,
      y,
      w: valueWidth,
      h: 0.5,

      fontFace: theme.fonts.arabic,

      fontSize: spec.showAnswers && isMissing ? theme.typography.factAnswer : theme.typography.factValue,

      color: isMissing ? theme.colors.accent : theme.colors.arabic,

      bold: spec.showAnswers && isMissing,

      align: "right",
      rtlMode: true,

      margin: 0,
    });
  }

  let supportY = 6.0;

  if (spec.support.translation) {
    slide.addText(spec.support.translation, {
      x: 2,
      y: supportY,
      w: 9.3,
      h: 0.35,

      fontFace: theme.fonts.translation,

      fontSize: theme.typography.translation,

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
      h: 0.5,

      fontFace: theme.fonts.arabic,

      fontSize: theme.typography.supportDense,

      color: theme.colors.accent,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  return slide;
}
