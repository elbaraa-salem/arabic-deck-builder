import type { Lesson } from "../schema/lesson.schema.ts";
import type { SlideSpec } from "../types/slide.ts";

export function planSlides(lesson: Lesson): SlideSpec[] {
  const slides: SlideSpec[] = [];

  for (const activity of lesson.activities) {
    switch (activity.type) {
      case "introduce":
        slides.push({
          type: "introduce",
          arabic: activity.arabic,
          russian: activity.russian,
        });
        break;

      case "question_reveal":
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
  }

  return slides;
}
