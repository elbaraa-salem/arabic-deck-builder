function toEasternArabicDigits(value: number): string {
  const digits = "٠١٢٣٤٥٦٧٨٩";

  return String(value)
    .split("")
    .map((character) => digits[Number(character)])
    .join("");
}

function getFontSize(digitCount: number): number {
  if (digitCount <= 3) {
    return 190;
  }

  if (digitCount === 4) {
    return 160;
  }

  if (digitCount <= 6) {
    return 125;
  }

  if (digitCount <= 9) {
    return 95;
  }

  return 75;
}

export function createNumberSvg(value: number): string {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(
      `Invalid number visual: ${value}. Expected a non-negative safe integer.`,
    );
  }

  const arabicNumber = toEasternArabicDigits(value);

  const fontSize = getFontSize(String(value).length);

  const width = 600;
  const height = 400;

  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
    >
      <rect
        x="20"
        y="20"
        width="560"
        height="360"
        rx="40"
        fill="#F7F3E9"
        stroke="#184F4C"
        stroke-width="8"
      />

      <text
        x="300"
        y="205"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Noto Sans Arabic, sans-serif"
        font-size="${fontSize}"
        font-weight="700"
        fill="#184F4C"
      >
        ${arabicNumber}
      </text>
    </svg>
  `.trim();
}
