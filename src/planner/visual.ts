import type { EducationalVisual, VisualSource } from "../types/visual.ts";

export function normalizeVisualSource(slot: {
  image?: string;
  visual?: EducationalVisual;
}): VisualSource | undefined {
  if (slot.visual !== undefined) {
    return { kind: "generated", spec: slot.visual };
  }
  if (slot.image !== undefined) {
    return { kind: "asset", key: slot.image };
  }
  return undefined;
}
