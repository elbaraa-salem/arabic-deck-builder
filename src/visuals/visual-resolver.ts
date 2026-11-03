import type { EducationalVisual } from "../types/visual.ts";
import { mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

import { resolve } from "node:path";

import { createClockSvg } from "./clock.ts";

import { createNumberSvg } from "./number.ts";
import { createQuantitySvg } from "./quantity.ts";

const generatedDirectory = resolve(
  process.cwd(),
  "output",
  ".generated-visuals",
);

function ensureGeneratedDirectory(): void {
  mkdirSync(generatedDirectory, {
    recursive: true,
  });
}

function writeGeneratedVisual(filename: string, svg: string): string {
  ensureGeneratedDirectory();

  const outputPath = resolve(generatedDirectory, filename);

  writeFileSync(outputPath, svg, "utf8");

  return outputPath;
}

export function resolveGeneratedVisual(spec: EducationalVisual): string {
  switch (spec.type) {
    case "clock":
      return writeGeneratedVisual(
        `clock-${spec.hour}-${spec.minute}.svg`,
        createClockSvg(spec.hour, spec.minute),
      );
    case "number":
      return writeGeneratedVisual(
        `number-${spec.value}.svg`,
        createNumberSvg(spec.value),
      );
    case "quantity": {
      const itemKey = createHash("sha256").update(spec.item).digest("hex");

      return writeGeneratedVisual(
        `quantity-${itemKey}-${spec.count}.svg`,
        createQuantitySvg(spec.item, spec.count),
      );
    }
    default: {
      const exhaustive: never = spec;
      throw new Error(
        `Unknown educational visual: ${JSON.stringify(exhaustive)}`,
      );
    }
  }
}
