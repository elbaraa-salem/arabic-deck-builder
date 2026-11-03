import type { LanguageTaggedText, SourceReference } from "./source-reference.ts";

export type SourceItem = {
  id: string;
  references: SourceReference[];
};

export type SourceExposure = "explicit_target" | "supporting" | "contextual" | "incidental";

export type SourceVocabulary = SourceItem & {
  surface: string;
  lemma?: string;
  partOfSpeech?: string;
  glosses?: LanguageTaggedText[];
  example?: string;
  exposure: SourceExposure;
};

export type SourceStructure = SourceItem & {
  pattern: string;
  description?: string;
  examples?: string[];
  communicativeUse?: string;
  exposure?: SourceExposure;
};

export type SourceGrammar = SourceItem & {
  title: string;
  description?: string;
  examples?: string[];
  presentation: "explicit" | "incidental";
};

export type SourceFunction = SourceItem & {
  label: string;
  description?: string;
  examples?: string[];
};

export type SourceTextMetadata = SourceItem & {
  title?: string;
  sourceNotes?: string;
};

export type SourceDialogueLine = {
  speaker: string;
  text: string;
};

export type SourceText =
  | (SourceTextMetadata & { type: "dialogue"; lines: SourceDialogueLine[] })
  | (SourceTextMetadata & { type: "reading"; text: string });

export type SourceListening = SourceTextMetadata & {
  transcript?: string;
  audioFile?: string;
  speakers?: { id: string; name?: string; description?: string }[];
  instruction?: string;
  context?: string;
};

export type SourceLanguageMaterial = {
  description?: string;
  vocabulary?: string[];
  structures?: string[];
};

export type SourceWriting = SourceItem & {
  topic: string;
  instruction?: string;
  expectedOutputForm?: string;
  languageMaterial?: SourceLanguageMaterial;
};

export type SourceExercise = SourceItem & {
  format: string;
  instruction?: string;
  languageMaterial?: SourceLanguageMaterial;
  rawContent?: string;
  items?: string[];
};

export type SourceVisual = SourceItem & {
  description: string;
  caption?: string;
  imageFile?: string;
  relatedItems?: {
    kind: "vocabulary" | "structure" | "text" | "exercise";
    id: string;
  }[];
};

export type SourceContextNote = SourceItem & {
  text: string;
};
