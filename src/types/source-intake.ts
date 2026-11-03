export type SourceIntakeKind = "pdf" | "image" | "image_directory";

export type SourceIntakePage = {
  pageIndex: number;
  sourceFile: string;
  imageFile?: string;
  width: number;
  height: number;
  dimensionUnit: "pixels" | "points";
  embeddedTextAvailable: boolean;
  embeddedTextCharacterCount: number;
  suggestedExtraction: "embedded_text" | "vision" | "hybrid";
};

export type SourceIntakeManifest = {
  schemaVersion: "1.0";
  source: {
    kind: SourceIntakeKind;
    path: string;
  };
  pages: SourceIntakePage[];
};
