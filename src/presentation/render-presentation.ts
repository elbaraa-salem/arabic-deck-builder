import type { SlideSpec } from "../types/slide.ts";
import { PptxGenJS } from "./pptx.ts";
import { renderSlide } from "./renderer.ts";

export async function renderPresentation(
  slides: SlideSpec[],
  outputPath: string,
): Promise<void> {
  const presentation = new PptxGenJS();
  presentation.layout = "LAYOUT_WIDE";

  for (const slide of slides) {
    renderSlide(presentation, slide);
  }

  await presentation.writeFile({
    fileName: outputPath,
  });
}
