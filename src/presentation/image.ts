import { readFileSync } from "node:fs";
import { imageSize } from "image-size";

export type ImageBox = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type ImagePlacement = {
  path: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type ImageKind = "portrait" | "balanced" | "landscape";

export type ImageInfo = {
  width: number;
  height: number;
  ratio: number;
  kind: ImageKind;
};

export function getImageInfo(path: string): ImageInfo {
  const buffer = readFileSync(path);

  const dimensions = imageSize(buffer);

  const width = dimensions.width;
  const height = dimensions.height;

  if (!width || !height) {
    throw new Error(`Could not read image dimensions: ${path}`);
  }

  const ratio = width / height;

  return {
    width,
    height,
    ratio,
    kind: classifyImage(ratio),
  };
}

export function classifyImage(ratio: number): ImageKind {
  if (ratio < 0.75) {
    return "portrait";
  }

  if (ratio <= 1.25) {
    return "balanced";
  }

  return "landscape";
}

export function fitImageContain(path: string, box: ImageBox): ImagePlacement {
  const info = getImageInfo(path);

  const imageRatio = info.ratio;
  const boxRatio = box.w / box.h;

  let width: number;
  let height: number;

  if (imageRatio > boxRatio) {
    width = box.w;
    height = width / imageRatio;
  } else {
    height = box.h;
    width = height * imageRatio;
  }

  const x = box.x + (box.w - width) / 2;

  const y = box.y + (box.h - height) / 2;

  return {
    path,
    x,
    y,
    w: width,
    h: height,
  };
}
