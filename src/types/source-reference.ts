export type ExtractionMethod = "embedded_text" | "ocr" | "vision" | "manual" | "hybrid";

export type ExtractionMetadata = {
  method: ExtractionMethod;
  confidence?: number;
  notes?: string;
};

export type SourceReference = {
  documentId: string;
  pageIndex: number;
  blockId?: string;
  extraction?: ExtractionMetadata;
};

export type SourceLevel = {
  label: string;
  basis?: "source_stated" | "estimated";
};

export type LanguageTaggedText = {
  language: string;
  text: string;
};
