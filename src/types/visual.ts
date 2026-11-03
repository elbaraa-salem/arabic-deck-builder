export type ClockVisual = {
  type: "clock";
  hour: number;
  minute: number;
};

export type NumberVisual = {
  type: "number";
  value: number;
};

export type QuantityVisual = {
  type: "quantity";
  item: string;
  count: number;
};

export type EducationalVisual = ClockVisual | NumberVisual | QuantityVisual;

export type VisualSource =
  | { kind: "asset"; key: string }
  | { kind: "generated"; spec: EducationalVisual };
