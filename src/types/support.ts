export type SupportStage = {
  translation?: string;
  hint?: string;
};

export type SupportPlan = {
  stages: SupportStage[];
};
