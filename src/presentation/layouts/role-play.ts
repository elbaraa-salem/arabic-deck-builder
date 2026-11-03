import type { RolePlaySlide } from "../../types/slide.ts";

import { resolveVisualSource } from "../../visuals/visual-source-resolver.ts";

import { fitImageContain } from "../image.ts";

import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { theme } from "../theme.ts";
import { addCleanDecorations } from "../decorations.ts";

export function renderRolePlaySlide(
  presentation: Presentation,
  spec: RolePlaySlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  addCleanDecorations(slide);

  slide.addText(spec.instruction, {
    x: theme.layout.contentX,
    y: 0.25,
    w: theme.layout.contentWidth,
    h: 0.45,

    fontFace: theme.fonts.arabic,
    fontSize: theme.typography.instruction,

    color: theme.colors.choice,

    align: "center",
    rtlMode: true,

    margin: 0,
  });

  slide.addText(spec.situation, {
    x: 1.3,
    y: 0.8,
    w: 10.7,
    h: 0.75,

    fontFace: theme.fonts.arabic,
    fontSize: theme.typography.activityTitle,

    color: theme.colors.arabic,

    bold: true,

    align: "center",
    rtlMode: true,

    margin: 0,
  });

  const hasImage = spec.visual !== undefined;

  if (spec.visual) {
    const imagePath = resolveVisualSource(spec.visual);

    slide.addImage(
      fitImageContain(imagePath, {
        x: 0.75,
        y: 1.75,
        w: 3.3,
        h: 2.6,
      }),
    );
  }

  const rolesX = hasImage ? 4.6 : 1.5;

  const rolesWidth = hasImage ? 7.3 : 10.3;

  slide.addText("أَنْتَ", {
    x: rolesX,
    y: 1.8,
    w: rolesWidth,
    h: 0.35,

    fontFace: theme.fonts.arabic,
    fontSize: theme.typography.label,

    color: theme.colors.accent,

    bold: true,

    align: "right",
    rtlMode: true,

    margin: 0,
  });

  slide.addText(spec.roles.student, {
    x: rolesX,
    y: 2.15,
    w: rolesWidth,
    h: 0.55,

    fontFace: theme.fonts.arabic,
    fontSize: theme.typography.arabicCompact,

    color: theme.colors.arabic,

    bold: true,

    align: "right",
    rtlMode: true,

    margin: 0,
  });

  slide.addText("الطَّرَفُ الآخَرُ", {
    x: rolesX,
    y: 2.85,
    w: rolesWidth,
    h: 0.35,

    fontFace: theme.fonts.arabic,
    fontSize: theme.typography.label,

    color: theme.colors.accent,

    bold: true,

    align: "right",
    rtlMode: true,

    margin: 0,
  });

  slide.addText(spec.roles.partner, {
    x: rolesX,
    y: 3.2,
    w: rolesWidth,
    h: 0.55,

    fontFace: theme.fonts.arabic,
    fontSize: theme.typography.arabicCompact,

    color: theme.colors.arabic,

    bold: true,

    align: "right",
    rtlMode: true,

    margin: 0,
  });

  const goalsText = spec.goals.map((goal) => `• ${goal}`).join("\n");

  slide.addText("هَدَفُكَ", {
    x: theme.layout.contentX,
    y: 4.15,
    w: theme.layout.contentWidth,
    h: 0.4,

    fontFace: theme.fonts.arabic,
    fontSize: theme.typography.instructionCompact,

    color: theme.colors.accent,
    bold: true,

    align: "center",
    rtlMode: true,

    margin: 0,
  });

  slide.addText(goalsText, {
    x: 2.1,
    y: 4.6,
    w: 9.0,
    h: 1.75,

    fontFace: theme.fonts.arabic,
    fontSize: theme.typography.bodySmall,

    color: theme.colors.choice,

    align: "right",
    valign: "top",
    rtlMode: true,

    margin: 0,
  });

  let supportY = 6.15;

  if (spec.support.translation) {
    slide.addText(spec.support.translation, {
      x: theme.layout.innerContentX,
      y: supportY,
      w: theme.layout.innerContentWidth,
      h: 0.35,

      fontFace: theme.fonts.translation,

      fontSize: theme.typography.translationSmall,

      color: theme.colors.translation,

      align: "center",

      margin: 0,
    });

    supportY += 0.4;
  }

  if (spec.support.hint) {
    slide.addText(spec.support.hint, {
      x: 1.7,
      y: supportY,
      w: 9.9,
      h: 0.5,

      fontFace: theme.fonts.arabic,

      fontSize: theme.typography.support,

      color: theme.colors.accent,

      align: "center",
      rtlMode: true,

      margin: 0,
    });
  }

  return slide;
}
