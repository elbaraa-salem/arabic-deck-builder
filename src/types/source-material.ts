import type { ExtractionMetadata, SourceLevel, SourceReference } from "./source-reference.ts";
import type {
  SourceContextNote,
  SourceExercise,
  SourceFunction,
  SourceGrammar,
  SourceListening,
  SourceStructure,
  SourceText,
  SourceVisual,
  SourceVocabulary,
  SourceWriting,
} from "./source-items.ts";

export type SourceRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SourceBlock = {
  id: string;
  pageIndex: number;
  kind: "heading" | "paragraph" | "dialogue" | "vocabulary_list" | "grammar_box"
    | "exercise" | "visual" | "table" | "list" | "unknown";
  text?: string;
  region?: SourceRegion;
  imageFile?: string;
  extraction?: ExtractionMetadata;
};

export type SourcePage = {
  pageIndex: number;
  pageLabel?: string;
  imageFile?: string;
  sourceFile?: string;
  extraction: ExtractionMetadata;
  blocks: SourceBlock[];
};

// Original source organization; not a teaching/curriculum lesson.
export type SourceUnit = {
  id: string;
  title?: string;
  order: number;
  references: SourceReference[];
  approximateLevel?: SourceLevel;
  vocabulary?: SourceVocabulary[];
  structures?: SourceStructure[];
  grammar?: SourceGrammar[];
  functions?: SourceFunction[];
  texts?: SourceText[];
  listening?: SourceListening[];
  writing?: SourceWriting[];
  exercises?: SourceExercise[];
  visuals?: SourceVisual[];
  contextNotes?: SourceContextNote[];
};

export type SourceDocument = {
  id: string;
  title: string;
  author?: string;
  publisher?: string;
  edition?: string;
  language?: string;
  approximateLevel?: SourceLevel;
  sourceFile?: string;
  totalPageCount?: number;
  pages: SourcePage[];
  units: SourceUnit[];
};

export type SourceMaterial = {
  schemaVersion: "1.0";
  documents: SourceDocument[];
};
