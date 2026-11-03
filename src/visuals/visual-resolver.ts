import { mkdirSync, writeFileSync } from "node:fs";

import { resolve } from "node:path";

import { createClockSvg } from "./clock.ts";

import { createNumberSvg } from "./number.ts";

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

function resolveClockVisual(value: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);

  if (!match) {
    throw new Error(`Invalid clock visual: @clock/${value}`);
  }

  const hour = Number(match[1]);

  const minute = Number(match[2]);

  const svg = createClockSvg(hour, minute);

  return writeGeneratedVisual(`clock-${hour}-${minute}.svg`, svg);
}

function resolveNumberVisual(value: string): string {
  if (!/^\d+$/.test(value)) {
    throw new Error(`Invalid number visual: @number/${value}`);
  }

  const number = Number(value);

  const svg = createNumberSvg(number);

  return writeGeneratedVisual(`number-${number}.svg`, svg);
}

export function isGeneratedVisual(key: string): boolean {
  return key.startsWith("@");
}

export function resolveGeneratedVisual(key: string): string {
  const clockPrefix = "@clock/";

  if (key.startsWith(clockPrefix)) {
    return resolveClockVisual(key.slice(clockPrefix.length));
  }

  const numberPrefix = "@number/";

  if (key.startsWith(numberPrefix)) {
    return resolveNumberVisual(key.slice(numberPrefix.length));
  }

  throw new Error(`Unknown educational visual: ${key}`);
}
