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

export type DirectionVisual = {
  type: "direction";
  direction: "left" | "right" | "up" | "down";
};

export type FractionVisual = {
  type: "fraction";
  numerator: number;
  denominator: number;
};

export type EducationalVisual =
  | ClockVisual
  | NumberVisual
  | QuantityVisual
  | DirectionVisual
  | FractionVisual;

export type VisualSource =
  | { kind: "asset"; key: string }
  | { kind: "generated"; spec: EducationalVisual };
