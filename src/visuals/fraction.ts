function polarPoint(center: number, radius: number, degrees: number): {
  x: number;
  y: number;
} {
  const radians = (degrees - 90) * Math.PI / 180;

  return {
    x: center + radius * Math.cos(radians),
    y: center + radius * Math.sin(radians),
  };
}

export function createFractionSvg(numerator: number, denominator: number): string {
  if (!Number.isInteger(denominator) || denominator < 2 || denominator > 12) {
    throw new Error(`Invalid fraction denominator: ${denominator}. Expected an integer from 2 through 12.`);
  }

  if (!Number.isInteger(numerator) || numerator < 1 || numerator > denominator) {
    throw new Error(`Invalid fraction numerator: ${numerator}. Expected an integer from 1 through ${denominator}.`);
  }

  const size = 600;
  const center = size / 2;
  const radius = 220;
  const sectorAngle = 360 / denominator;

  const sectors = Array.from({ length: denominator }, (_, index) => {
    const start = polarPoint(center, radius, index * sectorAngle);
    const end = polarPoint(center, radius, (index + 1) * sectorAngle);
    const fill = index < numerator ? "#184F4C" : "#F7F3E9";

    return `<path d="M ${center} ${center} L ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y} Z" fill="${fill}" stroke="#9B6A3D" stroke-width="6" stroke-linejoin="round" />`;
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
${sectors}
</svg>`;
}
