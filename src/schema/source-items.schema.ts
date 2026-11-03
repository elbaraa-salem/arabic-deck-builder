import { z } from "zod";
import type {
  SourceContextNote, SourceExercise, SourceFunction, SourceGrammar, SourceListening,
  SourceStructure, SourceText, SourceVisual, SourceVocabulary, SourceWriting,
} from "../types/source-items.ts";
import { languageTaggedTextSchema, sourceItemShape, sourceStringSchema } from "./source-reference.schema.ts";

const examplesSchema = z.array(sourceStringSchema).min(1);
const sourceExposureSchema = z.enum(["explicit_target", "supporting", "contextual", "incidental"]);
const sourceTextShape = {
  ...sourceItemShape,
  title: sourceStringSchema.optional(),
  sourceNotes: sourceStringSchema.optional(),
};
const sourceLanguageMaterialSchema = z.object({
  description: sourceStringSchema.optional(),
  vocabulary: examplesSchema.optional(),
  structures: examplesSchema.optional(),
});

export const sourceVocabularySchema = z.object({
  ...sourceItemShape,
  surface: sourceStringSchema,
  lemma: sourceStringSchema.optional(),
  partOfSpeech: sourceStringSchema.optional(),
  glosses: z.array(languageTaggedTextSchema).min(1).optional(),
  example: sourceStringSchema.optional(),
  exposure: sourceExposureSchema,
}) satisfies z.ZodType<SourceVocabulary>;

export const sourceStructureSchema = z.object({
  ...sourceItemShape,
  pattern: sourceStringSchema,
  description: sourceStringSchema.optional(),
  examples: examplesSchema.optional(),
  communicativeUse: sourceStringSchema.optional(),
  exposure: sourceExposureSchema.optional(),
}) satisfies z.ZodType<SourceStructure>;

export const sourceGrammarSchema = z.object({
  ...sourceItemShape,
  title: sourceStringSchema,
  description: sourceStringSchema.optional(),
  examples: examplesSchema.optional(),
  presentation: z.enum(["explicit", "incidental"]),
}) satisfies z.ZodType<SourceGrammar>;

export const sourceFunctionSchema = z.object({
  ...sourceItemShape,
  label: sourceStringSchema,
  description: sourceStringSchema.optional(),
  examples: examplesSchema.optional(),
}) satisfies z.ZodType<SourceFunction>;

export const sourceTextSchema = z.discriminatedUnion("type", [
  z.object({
    ...sourceTextShape,
    type: z.literal("dialogue"),
    lines: z.array(z.object({ speaker: sourceStringSchema, text: sourceStringSchema })).min(1),
  }),
  z.object({ ...sourceTextShape, type: z.literal("reading"), text: sourceStringSchema }),
]) satisfies z.ZodType<SourceText>;

export const sourceListeningSchema = z.object({
  ...sourceTextShape,
  transcript: sourceStringSchema.optional(),
  audioFile: sourceStringSchema.optional(),
  speakers: z.array(z.object({
    id: sourceStringSchema,
    name: sourceStringSchema.optional(),
    description: sourceStringSchema.optional(),
  })).min(1).optional(),
  instruction: sourceStringSchema.optional(),
  context: sourceStringSchema.optional(),
}) satisfies z.ZodType<SourceListening>;

export const sourceWritingSchema = z.object({
  ...sourceItemShape,
  topic: sourceStringSchema,
  instruction: sourceStringSchema.optional(),
  expectedOutputForm: sourceStringSchema.optional(),
  languageMaterial: sourceLanguageMaterialSchema.optional(),
}) satisfies z.ZodType<SourceWriting>;

export const sourceExerciseSchema = z.object({
  ...sourceItemShape,
  format: sourceStringSchema,
  instruction: sourceStringSchema.optional(),
  languageMaterial: sourceLanguageMaterialSchema.optional(),
  rawContent: sourceStringSchema.optional(),
  items: examplesSchema.optional(),
}) satisfies z.ZodType<SourceExercise>;

export const sourceVisualSchema = z.object({
  ...sourceItemShape,
  description: sourceStringSchema,
  caption: sourceStringSchema.optional(),
  imageFile: sourceStringSchema.optional(),
  relatedItems: z.array(z.object({
    kind: z.enum(["vocabulary", "structure", "text", "exercise"]),
    id: sourceStringSchema,
  })).min(1).optional(),
}) satisfies z.ZodType<SourceVisual>;

export const sourceContextNoteSchema = z.object({
  ...sourceItemShape,
  text: sourceStringSchema,
}) satisfies z.ZodType<SourceContextNote>;
