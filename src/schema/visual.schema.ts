import { z } from "zod";
import type { EducationalVisual } from "../types/visual.ts";

export const educationalVisualSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("clock"),
    hour: z.int().min(0).max(23),
    minute: z.int().min(0).max(59),
  }),
  z.object({
    type: z.literal("number"),
    value: z.int().nonnegative(),
    numerals: z.enum(["eastern", "western"]).default("eastern"),
  }),
  z.object({
    type: z.literal("quantity"),
    item: z.string().min(1),
    count: z.int().min(1).max(20),
  }),
  z.object({
    type: z.literal("direction"),
    direction: z.enum(["left", "right", "up", "down"]),
  }),
  z.object({
    type: z.literal("fraction"),
    numerator: z.int().min(1),
    denominator: z.int().min(2).max(12),
  }).refine((fraction) => fraction.numerator <= fraction.denominator, {
    message: "numerator must be less than or equal to denominator",
    path: ["numerator"],
  }),
]) satisfies z.ZodType<EducationalVisual>;

export function withVisualSlot<T extends z.ZodRawShape>(
  shape: T,
  required = false,
) {
  return z
    .object({
      ...shape,
      image: z.string().min(1).optional(),
      visual: educationalVisualSchema.optional(),
    })
    .refine(
      (slot) => {
        const count =
          Number(Reflect.get(slot, "image") !== undefined) +
          Number(Reflect.get(slot, "visual") !== undefined);
        return required ? count === 1 : count <= 1;
      },
      {
        message: required
          ? "Provide exactly one of image or visual"
          : "Provide at most one of image or visual",
        path: ["visual"],
      },
    );
}
