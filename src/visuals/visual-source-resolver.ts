import { resolveImagePath } from "../assets/asset-resolver.ts";
import type { VisualSource } from "../types/visual.ts";
import { resolveGeneratedVisual } from "./visual-resolver.ts";

export function resolveVisualSource(source: VisualSource): string {
  switch (source.kind) {
    case "asset":
      return resolveImagePath(source.key);
    case "generated":
      return resolveGeneratedVisual(source.spec);
    default: {
      const exhaustive: never = source;
      throw new Error(`Unknown visual source: ${JSON.stringify(exhaustive)}`);
    }
  }
}
