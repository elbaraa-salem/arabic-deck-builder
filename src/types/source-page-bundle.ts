export type SourcePageArtifact = {
  pageIndex: number;
  imageFile: string;
  width: number;
  height: number;
  renderMethod: "pdftoppm" | "existing_image";
};

export type SourcePageBundle = {
  schemaVersion: "1.0";
  sourceManifest: string;
  pages: SourcePageArtifact[];
};
