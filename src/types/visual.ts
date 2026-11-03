export type ClockVisual = {
  type: "clock";
  hour: number;
  minute: number;
};

export type NumberVisual = {
  type: "number";
  value: number;
};

export type EducationalVisual = ClockVisual | NumberVisual;

export type VisualSource =
  | { kind: "asset"; key: string }
  | { kind: "generated"; spec: EducationalVisual };
