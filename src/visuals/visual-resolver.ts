import { mkdirSync, writeFileSync } from "node:fs";

import { resolve } from "node:path";

import { createClockSvg } from "./clock.ts";

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

function resolveClockVisual(value: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);

  if (!match) {
    throw new Error(`Invalid clock visual: @clock/${value}`);
  }

  const hour = Number(match[1]);

  const minute = Number(match[2]);

  const svg = createClockSvg(hour, minute);

  ensureGeneratedDirectory();

  const filename = `clock-${hour}-${minute}.svg`;

  const outputPath = resolve(generatedDirectory, filename);

  writeFileSync(outputPath, svg, "utf8");

  return outputPath;
}

export function isGeneratedVisual(key: string): boolean {
  return key.startsWith("@");
}

export function resolveGeneratedVisual(key: string): string {
  const clockPrefix = "@clock/";

  if (key.startsWith(clockPrefix)) {
    return resolveClockVisual(key.slice(clockPrefix.length));
  }

  throw new Error(`Unknown educational visual: ${key}`);
}
