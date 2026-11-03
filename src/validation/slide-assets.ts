import type { SlideSpec } from "../types/slide.ts";

function assertNever(value: never): never {
  throw new Error(`Unhandled slide type: ${JSON.stringify(value)}`);
}

export function collectSlideImageKeys(slides: SlideSpec[]): string[] {
  const images = new Set<string>();

  for (const slide of slides) {
    switch (slide.type) {
      case "introduce":
      case "question":
      case "reveal":
        images.add(slide.image);

        break;

      case "dialogue":
      case "recall":
      case "discriminate":
      case "personalize":
      case "interpret":
      case "information_gap":
      case "role_play":
      case "error_correction":
        if (slide.image) {
          images.add(slide.image);
        }

        break;

      case "transform":
        if (slide.cue.image) {
          images.add(slide.cue.image);
        }

        break;

      case "noticing":
        for (const item of slide.items) {
          if (item.image) {
            images.add(item.image);
          }
        }

        break;

      case "self_check":
      case "lesson_cover":
      case "section_break":
      case "lesson_end":
        break;

      default:
        assertNever(slide);
    }
  }

  return [...images].sort();
}
