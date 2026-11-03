import { z } from "zod";
import type { ExtractionMetadata, LanguageTaggedText, SourceLevel, SourceReference } from "../types/source-reference.ts";

// Reject blank identifiers/text without trimming or changing source content.
export const sourceStringSchema = z.string().refine((value) => value.trim().length > 0, {
  message: "Expected non-empty text",
});

export const extractionMetadataSchema = z.object({
  method: z.enum(["embedded_text", "ocr", "vision", "manual", "hybrid"]),
  confidence: z.number().min(0).max(1).optional(),
  notes: sourceStringSchema.optional(),
}) satisfies z.ZodType<ExtractionMetadata>;

export const sourceReferenceSchema = z.object({
  documentId: sourceStringSchema,
  pageIndex: z.int().positive(),
  blockId: sourceStringSchema.optional(),
  extraction: extractionMetadataSchema.optional(),
}) satisfies z.ZodType<SourceReference>;

export const sourceLevelSchema = z.object({
  label: sourceStringSchema,
  basis: z.enum(["source_stated", "estimated"]).optional(),
}) satisfies z.ZodType<SourceLevel>;

export const languageTaggedTextSchema = z.object({
  language: sourceStringSchema,
  text: sourceStringSchema,
}) satisfies z.ZodType<LanguageTaggedText>;

export const sourceItemShape = {
  id: sourceStringSchema,
  references: z.array(sourceReferenceSchema).min(1),
};
