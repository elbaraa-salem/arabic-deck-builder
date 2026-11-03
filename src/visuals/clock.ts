function polarPoint(
  centerX: number,
  centerY: number,
  radius: number,
  degrees: number,
): {
  x: number;
  y: number;
} {
  const radians = (degrees - 90) * (Math.PI / 180);

  return {
    x: centerX + radius * Math.cos(radians),

    y: centerY + radius * Math.sin(radians),
  };
}

export function createClockSvg(hour: number, minute: number): string {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new Error(`Invalid clock hour: ${hour}`);
  }

  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new Error(`Invalid clock minute: ${minute}`);
  }

  const size = 600;

  const center = size / 2;

  const clockRadius = 245;

  const minuteDegrees = minute * 6;

  const hourDegrees = (hour % 12) * 30 + minute * 0.5;

  const hourHand = polarPoint(center, center, 130, hourDegrees);

  const minuteHand = polarPoint(center, center, 185, minuteDegrees);

  const hourMarks = Array.from(
    {
      length: 12,
    },
    (_, index) => {
      const hourNumber = index === 0 ? 12 : index;

      const point = polarPoint(center, center, 200, index * 30);

      return `
          <text
            x="${point.x}"
            y="${point.y}"
            text-anchor="middle"
            dominant-baseline="middle"
            font-family="Noto Sans Arabic, sans-serif"
            font-size="34"
            fill="#184F4C"
          >
            ${hourNumber}
          </text>
        `;
    },
  ).join("");

  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${size}"
      height="${size}"
      viewBox="0 0 ${size} ${size}"
    >
      <rect
        width="${size}"
        height="${size}"
        fill="none"
      />

      <circle
        cx="${center}"
        cy="${center}"
        r="${clockRadius}"
        fill="#F7F3E9"
        stroke="#184F4C"
        stroke-width="10"
      />

      ${hourMarks}

      <line
        x1="${center}"
        y1="${center}"
        x2="${hourHand.x}"
        y2="${hourHand.y}"
        stroke="#184F4C"
        stroke-width="18"
        stroke-linecap="round"
      />

      <line
        x1="${center}"
        y1="${center}"
        x2="${minuteHand.x}"
        y2="${minuteHand.y}"
        stroke="#9B6A3D"
        stroke-width="10"
        stroke-linecap="round"
      />

      <circle
        cx="${center}"
        cy="${center}"
        r="14"
        fill="#9B6A3D"
      />
    </svg>
  `.trim();
}
