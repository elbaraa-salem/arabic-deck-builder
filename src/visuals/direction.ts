import type { DirectionVisual } from "../types/visual.ts";

function getRotation(direction: DirectionVisual["direction"]): number {
  switch (direction) {
    case "right":
      return 0;
    case "down":
      return 90;
    case "left":
      return 180;
    case "up":
      return 270;
    default: {
      const exhaustive: never = direction;
      throw new Error(`Invalid direction visual: ${exhaustive}`);
    }
  }
}

export function createDirectionSvg(direction: DirectionVisual["direction"]): string {
  const rotation = getRotation(direction);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <g transform="rotate(${rotation} 300 300)">
    <polygon points="100,250 330,250 330,160 500,300 330,440 330,350 100,350" fill="#184F4C" />
  </g>
</svg>`;
}
