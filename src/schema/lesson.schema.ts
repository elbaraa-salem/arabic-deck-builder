import { z } from "zod";

const lessonCoverActivitySchema = z.object({
  type: z.literal("lesson_cover"),

  title: z.string().min(1),

  subtitle: z.string().min(1).optional(),

  translation: z.string().min(1).optional(),
});

const sectionBreakActivitySchema = z.object({
  type: z.literal("section_break"),

  title: z.string().min(1),

  subtitle: z.string().min(1).optional(),

  translation: z.string().min(1).optional(),
});

const lessonEndActivitySchema = z.object({
  type: z.literal("lesson_end"),

  title: z.string().min(1),

  subtitle: z.string().min(1).optional(),

  translation: z.string().min(1).optional(),
});

const introduceActivitySchema = z.object({
  type: z.literal("introduce"),
  arabic: z.string().min(1),
  translation: z.string().min(1).optional(),
  image: z.string().min(1),
});

const questionRevealActivitySchema = z.object({
  type: z.literal("question_reveal"),
  question: z.string().min(1),
  answer: z.string().min(1),
  image: z.string().min(1),
});

const dialogueLineSchema = z.object({
  speaker: z.enum(["A", "B"]),
  arabic: z.string().min(1),
  translation: z.string().min(1).optional(),
});

const dialogueSegmentSchema = z.object({
  lines: z.array(dialogueLineSchema).min(1).max(6),
});

const dialogueBuildActivitySchema = z.object({
  type: z.literal("dialogue_build"),

  speakers: z.object({
    A: z.string().min(1),
    B: z.string().min(1),
  }),

  image: z.string().min(1).optional(),

  segments: z.array(dialogueSegmentSchema).min(1),
});

const supportStageSchema = z.object({
  translation: z.string().min(1).optional(),
  hint: z.string().min(1).optional(),
});

const supportPlanSchema = z.object({
  stages: z.array(supportStageSchema).min(1),
});

const recallActivitySchema = z.object({
  type: z.literal("recall"),

  prompt: z.object({
    question: z.string().min(1),
    image: z.string().min(1).optional(),
  }),

  answer: z.string().min(1),

  support: supportPlanSchema.optional(),
});

const discriminateActivitySchema = z
  .object({
    type: z.literal("discriminate"),

    prompt: z.object({
      question: z.string().min(1),
      image: z.string().min(1).optional(),
    }),

    choices: z.array(z.string().min(1)).min(2).max(4),

    answer: z.string().min(1),

    support: supportPlanSchema.optional(),
  })
  .refine((activity) => activity.choices.includes(activity.answer), {
    message: "answer must be one of the choices",
    path: ["answer"],
  })
  .refine(
    (activity) => new Set(activity.choices).size === activity.choices.length,
    {
      message: "choices must be unique",
      path: ["choices"],
    },
  );

const transformActivitySchema = z.object({
  type: z.literal("transform"),

  instruction: z.string().min(1),

  model: z.string().min(1),

  cue: z.object({
    text: z.string().min(1),
    image: z.string().min(1).optional(),
  }),

  answer: z.string().min(1),

  support: supportPlanSchema.optional(),
});

const personalizeActivitySchema = z.object({
  type: z.literal("personalize"),

  model: z.string().min(1).optional(),

  prompt: z.object({
    question: z.string().min(1),
    image: z.string().min(1).optional(),
  }),

  support: supportPlanSchema.optional(),
});

const interpretActivitySchema = z
  .object({
    type: z.literal("interpret"),

    passage: z.string().min(1),

    question: z.string().min(1),

    choices: z.array(z.string().min(1)).min(2).max(4),

    answer: z.string().min(1),

    image: z.string().min(1).optional(),

    support: supportPlanSchema.optional(),
  })
  .refine((activity) => activity.choices.includes(activity.answer), {
    message: "answer must be one of the choices",
    path: ["answer"],
  })
  .refine(
    (activity) => new Set(activity.choices).size === activity.choices.length,
    {
      message: "choices must be unique",
      path: ["choices"],
    },
  );

const informationGapFactSchema = z
  .object({
    label: z.string().min(1),

    value: z.string().min(1).optional(),

    answer: z.string().min(1).optional(),
  })
  .refine(
    (fact) => (fact.value !== undefined) !== (fact.answer !== undefined),
    {
      message: "fact must contain either value or answer",
    },
  );

const informationGapActivitySchema = z
  .object({
    type: z.literal("information_gap"),

    instruction: z.string().min(1),

    subject: z.string().min(1).optional(),

    image: z.string().min(1).optional(),

    facts: z.array(informationGapFactSchema).min(2).max(6),

    support: supportPlanSchema.optional(),
  })
  .refine(
    (activity) => activity.facts.some((fact) => fact.answer !== undefined),
    {
      message: "information gap must contain at least one missing fact",
      path: ["facts"],
    },
  );

const rolePlayActivitySchema = z.object({
  type: z.literal("role_play"),

  instruction: z.string().min(1),

  situation: z.string().min(1),

  roles: z.object({
    student: z.string().min(1),
    partner: z.string().min(1),
  }),

  goals: z.array(z.string().min(1)).min(1).max(6),

  image: z.string().min(1).optional(),

  support: supportPlanSchema.optional(),
});

const noticingItemSchema = z.object({
  text: z.string().min(1),
  image: z.string().min(1).optional(),
});

const noticingActivitySchema = z.object({
  type: z.literal("noticing"),

  instruction: z.string().min(1),

  items: z.array(noticingItemSchema).min(2).max(4),

  question: z.string().min(1),

  insight: z.string().min(1),

  support: supportPlanSchema.optional(),
});

const errorCorrectionActivitySchema = z.object({
  type: z.literal("error_correction"),

  instruction: z.string().min(1),

  incorrect: z.string().min(1),

  correction: z.string().min(1),

  explanation: z.string().min(1).optional(),

  image: z.string().min(1).optional(),

  support: supportPlanSchema.optional(),
});

const selfCheckItemSchema = z.object({
  text: z.string().min(1),

  prompt: z.string().min(1).optional(),
});

const selfCheckActivitySchema = z.object({
  type: z.literal("self_check"),

  title: z.string().min(1).optional(),

  items: z.array(selfCheckItemSchema).min(1).max(6),
});

const activitySchema = z.discriminatedUnion("type", [
  lessonCoverActivitySchema,
  introduceActivitySchema,
  questionRevealActivitySchema,
  dialogueBuildActivitySchema,
  recallActivitySchema,
  discriminateActivitySchema,
  transformActivitySchema,
  personalizeActivitySchema,
  interpretActivitySchema,
  informationGapActivitySchema,
  rolePlayActivitySchema,
  noticingActivitySchema,
  errorCorrectionActivitySchema,
  selfCheckActivitySchema,
  sectionBreakActivitySchema,
  lessonEndActivitySchema,
]);

export const lessonSchema = z.object({
  id: z.string().min(1),
  level: z.string().min(1),
  title: z.string().min(1),
  goal: z.string().min(1),

  translation_language: z.string().min(2).max(10).optional(),

  activities: z.array(activitySchema).min(1),
});

export type Lesson = z.infer<typeof lessonSchema>;
