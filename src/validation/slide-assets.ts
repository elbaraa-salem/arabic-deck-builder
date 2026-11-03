import type { VisualSource } from "../types/visual.ts";
import type { SlideSpec } from "../types/slide.ts";

function assertNever(value: never): never {
  throw new Error(`Unhandled slide type: ${JSON.stringify(value)}`);
}

function getVisualSourceKey(source: VisualSource): string {
  return JSON.stringify(source);
}

export function collectSlideVisualSources(slides: SlideSpec[]): VisualSource[] {
  const visuals = new Map<string, VisualSource>();
  function add(source: VisualSource): void {
    visuals.set(getVisualSourceKey(source), source);
  }

  for (const slide of slides) {
    switch (slide.type) {
      case "introduce":
      case "question":
      case "reveal":
        add(slide.visual);

        break;

      case "dialogue":
      case "recall":
      case "discriminate":
      case "personalize":
      case "interpret":
      case "information_gap":
      case "role_play":
      case "error_correction":
        if (slide.visual) {
          add(slide.visual);
        }

        break;

      case "transform":
        if (slide.cue.visual) {
          add(slide.cue.visual);
        }

        break;

      case "noticing":
        for (const item of slide.items) {
          if (item.visual) {
            add(item.visual);
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

  return [...visuals.values()].sort((a, b) =>
    getVisualSourceKey(a).localeCompare(getVisualSourceKey(b)),
  );
}
