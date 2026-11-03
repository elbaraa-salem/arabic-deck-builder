import { z } from "zod";
import type { SourceIntakeManifest, SourceIntakePage } from "../types/source-intake.ts";
import { sourceStringSchema } from "./source-reference.schema.ts";

export const sourceIntakePageSchema = z.object({
  pageIndex: z.int().positive(),
  sourceFile: sourceStringSchema,
  imageFile: sourceStringSchema.optional(),
  width: z.number().positive(),
  height: z.number().positive(),
  dimensionUnit: z.enum(["pixels", "points"]),
  embeddedTextAvailable: z.boolean(),
  embeddedTextCharacterCount: z.int().nonnegative(),
  suggestedExtraction: z.enum(["embedded_text", "vision", "hybrid"]),
}).refine((page) => (page.suggestedExtraction === "vision") === !page.embeddedTextAvailable, {
  message: "Extraction suggestion must agree with embedded-text availability",
  path: ["suggestedExtraction"],
}) satisfies z.ZodType<SourceIntakePage>;

export const sourceIntakeManifestSchema = z.object({
  schemaVersion: z.literal("1.0"),
  source: z.object({
    kind: z.enum(["pdf", "image", "image_directory"]),
    path: sourceStringSchema,
  }),
  pages: z.array(sourceIntakePageSchema).min(1),
}).refine((manifest) => manifest.pages.every((page, index) => page.pageIndex === index + 1), {
  message: "Page indices must form an ordered sequence starting at 1",
  path: ["pages"],
}) satisfies z.ZodType<SourceIntakeManifest>;
