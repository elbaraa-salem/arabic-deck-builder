import type { Lesson } from "../schema/lesson.schema.ts";

import type { DialogueSlideLine, SlideSpec } from "../types/slide.ts";

import { addSupportSequence } from "./support.ts";

export function planSlides(lesson: Lesson): SlideSpec[] {
  const slides: SlideSpec[] = [];

  for (const activity of lesson.activities) {
    switch (activity.type) {
      case "lesson_cover": {
        slides.push({
          type: "lesson_cover",

          title: activity.title,

          subtitle: activity.subtitle,

          translation: activity.translation,
        });

        break;
      }

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
        addSupportSequence(
          slides,
          activity.support,

          (support) => ({
            type: "recall",

            question: activity.prompt.question,

            image: activity.prompt.image,

            support,

            answer: activity.answer,

            showAnswer: false,
          }),

          () => ({
            type: "recall",

            question: activity.prompt.question,

            image: activity.prompt.image,

            support: {},

            answer: activity.answer,

            showAnswer: true,
          }),
        );

        break;
      }

      case "discriminate": {
        addSupportSequence(
          slides,
          activity.support,

          (support) => ({
            type: "discriminate",

            question: activity.prompt.question,

            image: activity.prompt.image,

            choices: [...activity.choices],

            answer: activity.answer,

            support,

            showAnswer: false,
          }),

          () => ({
            type: "discriminate",

            question: activity.prompt.question,

            image: activity.prompt.image,

            choices: [...activity.choices],

            answer: activity.answer,

            support: {},

            showAnswer: true,
          }),
        );

        break;
      }

      case "transform": {
        const cue = {
          text: activity.cue.text,

          image: activity.cue.image,
        };

        addSupportSequence(
          slides,
          activity.support,

          (support) => ({
            type: "transform",

            instruction: activity.instruction,

            model: activity.model,

            cue,

            answer: activity.answer,

            support,

            showAnswer: false,
          }),

          () => ({
            type: "transform",

            instruction: activity.instruction,

            model: activity.model,

            cue,

            answer: activity.answer,

            support: {},

            showAnswer: true,
          }),
        );

        break;
      }

      case "personalize": {
        addSupportSequence(
          slides,
          activity.support,

          (support) => ({
            type: "personalize",

            model: activity.model,

            question: activity.prompt.question,

            image: activity.prompt.image,

            support,
          }),
        );

        break;
      }

      case "interpret": {
        addSupportSequence(
          slides,
          activity.support,

          (support) => ({
            type: "interpret",

            passage: activity.passage,

            question: activity.question,

            choices: [...activity.choices],

            answer: activity.answer,

            image: activity.image,

            support,

            showAnswer: false,
          }),

          () => ({
            type: "interpret",

            passage: activity.passage,

            question: activity.question,

            choices: [...activity.choices],

            answer: activity.answer,

            image: activity.image,

            support: {},

            showAnswer: true,
          }),
        );

        break;
      }

      case "information_gap": {
        const facts = activity.facts.map((fact) => ({
          label: fact.label,
          value: fact.value,
          answer: fact.answer,
        }));

        addSupportSequence(
          slides,
          activity.support,

          (support) => ({
            type: "information_gap",

            instruction: activity.instruction,

            subject: activity.subject,

            image: activity.image,

            facts,

            support,

            showAnswers: false,
          }),

          () => ({
            type: "information_gap",

            instruction: activity.instruction,

            subject: activity.subject,

            image: activity.image,

            facts,

            support: {},

            showAnswers: true,
          }),
        );

        break;
      }

      case "role_play": {
        addSupportSequence(
          slides,
          activity.support,

          (support) => ({
            type: "role_play",

            instruction: activity.instruction,

            situation: activity.situation,

            roles: {
              student: activity.roles.student,

              partner: activity.roles.partner,
            },

            goals: [...activity.goals],

            image: activity.image,

            support,
          }),
        );

        break;
      }

      case "noticing": {
        const items = activity.items.map((item) => ({
          text: item.text,
          image: item.image,
        }));

        addSupportSequence(
          slides,
          activity.support,

          (support) => ({
            type: "noticing",

            instruction: activity.instruction,

            items,

            question: activity.question,

            insight: activity.insight,

            support,

            showInsight: false,
          }),

          () => ({
            type: "noticing",

            instruction: activity.instruction,

            items,

            question: activity.question,

            insight: activity.insight,

            support: {},

            showInsight: true,
          }),
        );

        break;
      }

      case "error_correction": {
        addSupportSequence(
          slides,
          activity.support,

          (support) => ({
            type: "error_correction",

            instruction: activity.instruction,

            incorrect: activity.incorrect,

            correction: activity.correction,

            explanation: activity.explanation,

            image: activity.image,

            support,

            showCorrection: false,
          }),

          () => ({
            type: "error_correction",

            instruction: activity.instruction,

            incorrect: activity.incorrect,

            correction: activity.correction,

            explanation: activity.explanation,

            image: activity.image,

            support: {},

            showCorrection: true,
          }),
        );

        break;
      }

      case "self_check": {
        slides.push({
          type: "self_check",

          title: activity.title ?? "أَسْتَطِيعُ أَنْ...",

          items: activity.items.map((item) => ({
            text: item.text,
            prompt: item.prompt,
          })),
        });

        break;
      }

      case "section_break": {
        slides.push({
          type: "section_break",

          title: activity.title,

          subtitle: activity.subtitle,

          translation: activity.translation,
        });

        break;
      }

      case "lesson_end": {
        slides.push({
          type: "lesson_end",

          title: activity.title,

          subtitle: activity.subtitle,

          translation: activity.translation,
        });

        break;
      }
    }
  }

  return slides;
}
