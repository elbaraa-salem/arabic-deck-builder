import { z } from "zod";
import type { SourcePageArtifact, SourcePageBundle } from "../types/source-page-bundle.ts";
import { sourceStringSchema } from "./source-reference.schema.ts";

export const sourcePageArtifactSchema = z.object({
  pageIndex: z.int().positive(),
  imageFile: sourceStringSchema,
  width: z.int().positive(),
  height: z.int().positive(),
  renderMethod: z.enum(["pdftoppm", "existing_image"]),
}) satisfies z.ZodType<SourcePageArtifact>;

export const sourcePageBundleSchema = z.object({
  schemaVersion: z.literal("1.0"),
  sourceManifest: sourceStringSchema,
  // Text-only sources legitimately have no pages requiring visual processing.
  pages: z.array(sourcePageArtifactSchema),
}).refine((bundle) => bundle.pages.every((page, index) =>
  index === 0 || page.pageIndex > bundle.pages[index - 1]!.pageIndex), {
  message: "Page artifacts must have unique, ascending physical page indices",
  path: ["pages"],
}) satisfies z.ZodType<SourcePageBundle>;
