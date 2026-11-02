import type { Lesson } from "../schema/lesson.schema.ts";
import type { DialogueSlideLine, SlideSpec } from "../types/slide.ts";

export function planSlides(lesson: Lesson): SlideSpec[] {
  const slides: SlideSpec[] = [];

  for (const activity of lesson.activities) {
    switch (activity.type) {
      case "introduce": {
        slides.push({
          type: "introduce",
          arabic: activity.arabic,
          russian: activity.russian,
          image: activity.image,
        });

        break;
      }

      case "question_reveal": {
        slides.push({
          type: "question",
          question: activity.question,
          image: activity.image,
        });

        slides.push({
          type: "reveal",
          question: activity.question,
          answer: activity.answer,
          image: activity.image,
        });

        break;
      }

      case "dialogue_build":
        {
          for (const segment of activity.segments) {
            const visibleLines: DialogueSlideLine[] = [];

            for (const line of segment.lines) {
              visibleLines.push({
                speaker: line.speaker,
                arabic: line.arabic,
                russian: line.russian,
              });

              slides.push({
                type: "dialogue",
                speakers: {
                  A: activity.speakers.A,
                  B: activity.speakers.B,
                },
                image: activity.image,
                lines: [...visibleLines],
              });
            }
          }
        }
        break;
    }
  }
  return slides;
}
