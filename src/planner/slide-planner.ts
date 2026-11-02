import type { Lesson } from "../schema/lesson.schema.ts";
import type { DialogueSlideLine, SlideSpec } from "../types/slide.ts";
import { getSupportStages } from "./support.ts";

export function planSlides(lesson: Lesson): SlideSpec[] {
  const slides: SlideSpec[] = [];

  for (const activity of lesson.activities) {
    switch (activity.type) {
      case "introduce": {
        slides.push({
          type: "introduce",
          arabic: activity.arabic,
          translation: activity.translation,
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

      case "dialogue_build": {
        for (const segment of activity.segments) {
          const visibleLines: DialogueSlideLine[] = [];

          for (const line of segment.lines) {
            visibleLines.push({
              speaker: line.speaker,
              arabic: line.arabic,
              translation: line.translation,
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
        break;
      }

      case "recall": {
        const supportStages = getSupportStages(activity.support);

        for (const support of supportStages) {
          slides.push({
            type: "recall",

            question: activity.prompt.question,

            image: activity.prompt.image,

            support,

            answer: activity.answer,

            showAnswer: false,
          });
        }

        slides.push({
          type: "recall",

          question: activity.prompt.question,

          image: activity.prompt.image,

          support: {},

          answer: activity.answer,

          showAnswer: true,
        });

        break;
      }

      case "discriminate": {
        const supportStages = getSupportStages(activity.support);

        for (const support of supportStages) {
          slides.push({
            type: "discriminate",

            question: activity.prompt.question,

            image: activity.prompt.image,

            choices: [...activity.choices],

            answer: activity.answer,

            support,

            showAnswer: false,
          });
        }

        slides.push({
          type: "discriminate",

          question: activity.prompt.question,

          image: activity.prompt.image,

          choices: [...activity.choices],

          answer: activity.answer,

          support: {},

          showAnswer: true,
        });

        break;
      }

      case "transform": {
        const supportStages = getSupportStages(activity.support);

        for (const support of supportStages) {
          slides.push({
            type: "transform",

            instruction: activity.instruction,

            model: activity.model,

            cue: {
              text: activity.cue.text,

              image: activity.cue.image,
            },

            answer: activity.answer,

            support,

            showAnswer: false,
          });
        }

        slides.push({
          type: "transform",

          instruction: activity.instruction,

          model: activity.model,

          cue: {
            text: activity.cue.text,

            image: activity.cue.image,
          },

          answer: activity.answer,

          support: {},

          showAnswer: true,
        });

        break;
      }

      case "personalize": {
        const supportStages = getSupportStages(activity.support);

        for (const support of supportStages) {
          slides.push({
            type: "personalize",

            model: activity.model,

            question: activity.prompt.question,

            image: activity.prompt.image,

            support,
          });
        }

        break;
      }

      case "interpret": {
        const supportStages = getSupportStages(activity.support);

        for (const support of supportStages) {
          slides.push({
            type: "interpret",

            passage: activity.passage,

            question: activity.question,

            choices: [...activity.choices],

            answer: activity.answer,

            image: activity.image,

            support,

            showAnswer: false,
          });
        }

        slides.push({
          type: "interpret",

          passage: activity.passage,

          question: activity.question,

          choices: [...activity.choices],

          answer: activity.answer,

          image: activity.image,

          support: {},

          showAnswer: true,
        });

        break;
      }
    }
  }
  return slides;
}
