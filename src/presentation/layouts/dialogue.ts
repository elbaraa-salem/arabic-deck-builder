import type { DialogueSlide } from "../../types/slide.ts";

import { resolveImagePath } from "../../assets/asset-resolver.ts";

import { fitImageContain } from "../image.ts";

import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { theme } from "../theme.ts";
import { addCleanDecorations } from "../decorations.ts";

export function renderDialogueSlide(
  presentation: Presentation,
  spec: DialogueSlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  addCleanDecorations(slide);

  slide.addText(spec.speakers.A, {
    x: 7,
    y: 0.45,
    w: 4.9,
    h: 0.45,

    fontFace: theme.fonts.arabic,
    fontSize: 16,

    color: theme.colors.accent,

    bold: true,

    align: "right",
    rtlMode: true,

    margin: 0,
  });

  slide.addText(spec.speakers.B, {
    x: 1.1,
    y: 0.45,
    w: 4.9,
    h: 0.45,

    fontFace: theme.fonts.arabic,
    fontSize: 16,

    color: theme.colors.accent,

    bold: true,

    align: "left",
    rtlMode: true,

    margin: 0,
  });

  let dialogueStartY = 1.25;
  let dialogueHeight = 5.6;

  if (spec.image) {
    const imagePath = resolveImagePath(spec.image);

    slide.addImage(
      fitImageContain(imagePath, {
        x: 5.25,
        y: 0.55,
        w: 2.83,
        h: 1.65,
      }),
    );

    dialogueStartY = 2.35;
    dialogueHeight = 4.55;
  }

  const rowHeight = Math.min(1.05, dialogueHeight / spec.lines.length);

  const totalHeight = rowHeight * spec.lines.length;

  const startY = dialogueStartY + (dialogueHeight - totalHeight) / 2;

  for (let index = 0; index < spec.lines.length; index++) {
    const line = spec.lines[index];

    const isSpeakerA = line.speaker === "A";

    const x = isSpeakerA ? 7 : 1.1;

    const y = startY + index * rowHeight;

    slide.addText(line.arabic, {
      x,
      y,
      w: 4.9,
      h: 0.55,

      fontFace: theme.fonts.arabic,
      fontSize: 23,

      color: theme.colors.arabic,

      bold: true,

      align: isSpeakerA ? "right" : "left",

      valign: "middle",

      rtlMode: true,

      margin: 0,
    });

    if (line.translation) {
      slide.addText(line.translation, {
        x,
        y: y + 0.5,
        w: 4.9,
        h: 0.3,

        fontFace: theme.fonts.translation,
        fontSize: 11,

        color: theme.colors.translation,

        align: isSpeakerA ? "right" : "left",

        margin: 0,
      });
    }
  }

  return slide;
}
