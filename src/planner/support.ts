import type { SupportStage } from "../types/support.ts";

type SupportPlan = {
  stages: SupportStage[];
};

export function getSupportStages(
  support: SupportPlan | undefined,
): SupportStage[] {
  return support?.stages ?? [{}];
}
