import { existsSync } from "node:fs";

import { resolve } from "node:path";

import { fitImageContain } from "./image.ts";

import type { PowerPointSlide } from "./pptx.ts";

type DividerOptions = {
  showDivider?: boolean;
  dividerY?: number;
};

function resolveDecorationPath(filename: string): string {
  const path = resolve(process.cwd(), "assets", "decorations", filename);

  if (!existsSync(path)) {
    throw new Error(`Decoration asset not found: ${path}`);
  }

  return path;
}

const topLeftPath = resolveDecorationPath("arabic-corner-top-left.png");

const bottomRightPath = resolveDecorationPath("arabic-corner-bottom-right.png");

const dividerPath = resolveDecorationPath("arabic-center-star-divider.png");

function addDivider(slide: PowerPointSlide, y: number): void {
  slide.addImage(
    fitImageContain(dividerPath, {
      x: 4.25,
      y,

      w: 4.85,
      h: 0.55,
    }),
  );
}

export function addFullDecorations(
  slide: PowerPointSlide,
  options: DividerOptions = {},
): void {
  const { showDivider = true, dividerY = 4.0 } = options;

  slide.addImage({
    path: topLeftPath,

    x: 0,
    y: 0,

    w: 2.25,
    h: 1.88,
  });

  slide.addImage({
    path: bottomRightPath,

    x: 11.13,
    y: 5.46,

    w: 2.2,
    h: 2.04,
  });

  if (showDivider) {
    addDivider(slide, dividerY);
  }
}

export function addContentDecorations(slide: PowerPointSlide): void {
  slide.addImage({
    path: topLeftPath,

    x: 0,
    y: 0,

    w: 1.55,
    h: 1.3,
  });

  slide.addImage({
    path: bottomRightPath,

    x: 12.35,
    y: 6.6,

    w: 0.98,
    h: 0.9,
  });
}

export function addCleanDecorations(slide: PowerPointSlide): void {
  slide.addImage({
    path: bottomRightPath,

    x: 12.55,
    y: 6.78,

    w: 0.78,
    h: 0.72,
  });
}
