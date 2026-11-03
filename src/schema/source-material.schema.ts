import { z } from "zod";
import type { SourceBlock, SourceDocument, SourceMaterial, SourcePage, SourceRegion, SourceUnit } from "../types/source-material.ts";
import { extractionMetadataSchema, sourceItemShape, sourceLevelSchema, sourceStringSchema } from "./source-reference.schema.ts";
import {
  sourceContextNoteSchema, sourceExerciseSchema, sourceFunctionSchema, sourceGrammarSchema,
  sourceListeningSchema, sourceStructureSchema, sourceTextSchema, sourceVisualSchema,
  sourceVocabularySchema, sourceWritingSchema,
} from "./source-items.schema.ts";

function unique(values: readonly (string | number)[]): boolean {
  return new Set(values).size === values.length;
}

export const sourceRegionSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().positive().max(1),
  height: z.number().positive().max(1),
}).refine((region) => region.x + region.width <= 1, {
  message: "Region must fit horizontally within the page", path: ["width"],
}).refine((region) => region.y + region.height <= 1, {
  message: "Region must fit vertically within the page", path: ["height"],
}) satisfies z.ZodType<SourceRegion>;

export const sourceBlockSchema = z.object({
  id: sourceStringSchema,
  pageIndex: z.int().positive(),
  kind: z.enum(["heading", "paragraph", "dialogue", "vocabulary_list", "grammar_box", "exercise", "visual", "table", "list", "unknown"]),
  text: sourceStringSchema.optional(),
  region: sourceRegionSchema.optional(),
  imageFile: sourceStringSchema.optional(),
  extraction: extractionMetadataSchema.optional(),
}) satisfies z.ZodType<SourceBlock>;

export const sourcePageSchema = z.object({
  pageIndex: z.int().positive(),
  pageLabel: sourceStringSchema.optional(),
  imageFile: sourceStringSchema.optional(),
  sourceFile: sourceStringSchema.optional(),
  extraction: extractionMetadataSchema,
  blocks: z.array(sourceBlockSchema),
}).refine((page) => page.blocks.every((block) => block.pageIndex === page.pageIndex), {
  message: "Block pageIndex must match its containing page",
  path: ["blocks"],
}) satisfies z.ZodType<SourcePage>;

export const sourceUnitSchema = z.object({
  ...sourceItemShape,
  title: sourceStringSchema.optional(),
  order: z.int().positive(),
  approximateLevel: sourceLevelSchema.optional(),
  vocabulary: z.array(sourceVocabularySchema).optional(),
  structures: z.array(sourceStructureSchema).optional(),
  grammar: z.array(sourceGrammarSchema).optional(),
  functions: z.array(sourceFunctionSchema).optional(),
  texts: z.array(sourceTextSchema).optional(),
  listening: z.array(sourceListeningSchema).optional(),
  writing: z.array(sourceWritingSchema).optional(),
  exercises: z.array(sourceExerciseSchema).optional(),
  visuals: z.array(sourceVisualSchema).optional(),
  contextNotes: z.array(sourceContextNoteSchema).optional(),
}) satisfies z.ZodType<SourceUnit>;

export const sourceDocumentSchema = z.object({
  id: sourceStringSchema,
  title: sourceStringSchema,
  author: sourceStringSchema.optional(),
  publisher: sourceStringSchema.optional(),
  edition: sourceStringSchema.optional(),
  language: sourceStringSchema.optional(),
  approximateLevel: sourceLevelSchema.optional(),
  sourceFile: sourceStringSchema.optional(),
  totalPageCount: z.int().positive().optional(),
  pages: z.array(sourcePageSchema),
  units: z.array(sourceUnitSchema),
}).refine((document) => unique(document.pages.map((page) => page.pageIndex)), {
  message: "Page indices must be unique within a document", path: ["pages"],
}).refine((document) => unique(document.pages.flatMap((page) => page.blocks.map((block) => block.id))), {
  message: "Block IDs must be unique within a document", path: ["pages"],
}).refine((document) => unique(document.units.map((unit) => unit.id)), {
  message: "Source unit IDs must be unique within a document", path: ["units"],
}).refine((document) => unique(document.units.map((unit) => unit.order)), {
  message: "Source unit order values must be unique within a document", path: ["units"],
}) satisfies z.ZodType<SourceDocument>;

export const sourceMaterialSchema = z.object({
  schemaVersion: z.literal("1.0"),
  documents: z.array(sourceDocumentSchema).min(1),
}).refine((material) => unique(material.documents.map((document) => document.id)), {
  message: "Document IDs must be unique", path: ["documents"],
}) satisfies z.ZodType<SourceMaterial>;
