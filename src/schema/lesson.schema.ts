import { z } from "zod";

const introduceActivitySchema = z.object({
  type: z.literal("introduce"),
  arabic: z.string().min(1),
  russian: z.string().min(1).optional(),
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
  russian: z.string().min(1).optional(),
});

const dialogueBuildActivitySchema = z.object({
  type: z.literal("dialogue_build"),

  speakers: z.object({
    A: z.string().min(1),
    B: z.string().min(1),
  }),

  image: z.string().min(1).optional(),

  lines: z.array(dialogueLineSchema).min(2).max(6),
});

const activitySchema = z.discriminatedUnion("type", [
  introduceActivitySchema,
  questionRevealActivitySchema,
  dialogueBuildActivitySchema,
]);

export const lessonSchema = z.object({
  id: z.string().min(1),
  level: z.string().min(1),
  title: z.string().min(1),
  goal: z.string().min(1),

  activities: z.array(activitySchema).min(1),
});

export type Lesson = z.infer<typeof lessonSchema>;
