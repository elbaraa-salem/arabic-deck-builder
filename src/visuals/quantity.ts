import { readFileSync } from "node:fs";
import { extname } from "node:path";
import { imageSize } from "image-size";

import { resolveImagePath } from "../assets/asset-resolver.ts";

function getImageMimeType(extension: string): string {
  switch (extension) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    default:
      throw new Error(`Unsupported quantity asset extension: ${extension}`);
  }
}

export function createQuantitySvg(item: string, count: number): string {
  if (!item) {
    throw new Error("Invalid quantity item: expected a non-empty asset key.");
  }

  if (!Number.isInteger(count) || count < 1 || count > 20) {
    throw new Error(
      `Invalid quantity count: ${count}. Expected an integer from 1 through 20.`,
    );
  }

  const imagePath = resolveImagePath(item);
  const buffer = readFileSync(imagePath);
  const { width, height } = imageSize(buffer);

  if (!width || !height) {
    throw new Error(`Could not read quantity asset dimensions: ${item}`);
  }

  const mimeType = getImageMimeType(extname(imagePath));
  const imageData = `data:${mimeType};base64,${buffer.toString("base64")}`;

  const size = 600;
  const padding = 24;
  const gap = 20;
  const columns = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / columns);
  const cellWidth = (size - 2 * padding - (columns - 1) * gap) / columns;
  const cellHeight = (size - 2 * padding - (rows - 1) * gap) / rows;
  const scale = Math.min(cellWidth / width, cellHeight / height);
  const itemWidth = width * scale;
  const itemHeight = height * scale;

  const images = Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const itemsInRow = Math.min(columns, count - row * columns);
    const rowOffset = ((columns - itemsInRow) * (cellWidth + gap)) / 2;
    const x =
      padding +
      rowOffset +
      column * (cellWidth + gap) +
      (cellWidth - itemWidth) / 2;
    const y =
      padding + row * (cellHeight + gap) + (cellHeight - itemHeight) / 2;

    return `<use x="${x}" y="${y}" width="${itemWidth}" height="${itemHeight}" xlink:href="#quantity-item" />`;
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<defs>
  <image id="quantity-item" width="${itemWidth}" height="${itemHeight}" preserveAspectRatio="xMidYMid meet" xlink:href="${imageData}" />
</defs>
${images}
</svg>`;
}
