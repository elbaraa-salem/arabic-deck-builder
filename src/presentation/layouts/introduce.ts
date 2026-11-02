import type { IntroduceSlide } from "../../types/slide.ts";
import type { Presentation, PowerPointSlide } from "../pptx.ts";

import { resolveImagePath } from "../../assets/asset-resolver.ts";
import { fitImageContain, getImageInfo } from "../image.ts";
import { theme } from "../theme.ts";
import { addContentDecorations } from "../decorations.ts";

export function renderIntroduceSlide(
  presentation: Presentation,
  spec: IntroduceSlide,
): PowerPointSlide {
  const slide = presentation.addSlide();

  slide.background = {
    color: theme.colors.background,
  };

  addContentDecorations(slide);

  const imagePath = resolveImagePath(spec.image);
  const imageInfo = getImageInfo(imagePath);

  if (imageInfo.kind === "portrait") {
    const image = fitImageContain(imagePath, {
      x: 3.35,
      y: 0.8,
      w: 6.6,
      h: 3.4,
    });

    slide.addImage(image);

    slide.addText(spec.arabic, {
      x: 6.4,
      y: 2.3,
      w: 5.5,
      h: 1,
      fontFace: theme.fonts.arabic,
      fontSize: 34,
      color: theme.colors.arabic,
      bold: true,
      align: "center",
      valign: "middle",
      rtlMode: true,
      margin: 0,
    });

    if (spec.translation) {
      slide.addText(spec.translation, {
        x: 1.5,
        y: 5.35,
        w: 10.33,
        h: 0.5,
        fontFace: theme.fonts.translation,
        fontSize: 18,
        color: theme.colors.translation,
        align: "center",
        valign: "middle",
        margin: 0,
      });
    }
  } else {
    const image = fitImageContain(imagePath, {
      x: 2.2,
      y: 0.7,
      w: 8.9,
      h: 4,
    });

    slide.addImage(image);

    slide.addText(spec.arabic, {
      x: 1.5,
      y: 4.9,
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

    if (spec.translation) {
      slide.addText(spec.translation, {
        x: 1.5,
        y: 5.8,
        w: 10.33,
        h: 0.5,
        fontFace: theme.fonts.translation,
        fontSize: 18,
        color: theme.colors.translation,
        align: "center",
        valign: "middle",
        margin: 0,
      });
    }
  }

  return slide;
}
