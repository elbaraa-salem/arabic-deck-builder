import PptxGenJSImport from "pptxgenjs";

type PowerPointSlide = {
  background: {
    color?: string;
  };

  addText(
    text: string,
    options: {
      x?: number;
      y?: number;
      w?: number;
      h?: number;
      fontFace?: string;
      fontSize?: number;
      color?: string;
      bold?: boolean;
      align?: "left" | "center" | "right" | "justify";
      valign?: "top" | "middle" | "bottom";
      rtlMode?: boolean;
      margin?: number | [number, number, number, number];
    },
  ): void;
};

export type Presentation = {
  layout: string;

  addSlide(): PowerPointSlide;

  writeFile(options: { fileName: string }): Promise<string>;
};

type PptxConstructor = new () => Presentation;

export const PptxGenJS = PptxGenJSImport as unknown as PptxConstructor;

export type { PowerPointSlide };
