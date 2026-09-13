/**
 * Precision Math & Rounding Utilities
 * Protects against IEEE-754 floating-point inaccuracies
 */

export type RoundingMode = 'HALF_UP' | 'FLOOR' | 'CEIL' | 'TRUNC';

/**
 * Rounds or truncates a number accurately to a given decimal precision
 */
export function roundToPrecision(
  value: number,
  decimals: number = 2,
  mode: RoundingMode = 'TRUNC'
): number {
  if (isNaN(value) || !isFinite(value)) return 0;

  const factor = Math.pow(10, decimals);

  switch (mode) {
    case 'FLOOR': {
      return Math.floor(value * factor + Number.EPSILON) / factor;
    }
    case 'CEIL': {
      return Math.ceil(value * factor - Number.EPSILON) / factor;
    }
    case 'TRUNC': {
      // SRMIST Examination Regulation: Truncates after specified decimal places
      // + 1e-8 prevents float underflow (e.g. 9.69 * 100 = 968.9999999999999)
      return Math.floor(Number((value * factor + 1e-8).toFixed(7))) / factor;
    }
    case 'HALF_UP':
    default: {
      const shifted = Number(`${value}e+${decimals}`);
      const rounded = Math.round(shifted);
      return Number(`${rounded}e-${decimals}`);
    }
  }
}

/**
 * Formats a number to an exact string with specified decimal places (e.g. 9.69 instead of 9.70)
 */
export function formatDecimal(
  value: number,
  decimals: number = 2,
  mode: RoundingMode = 'TRUNC'
): string {
  if (isNaN(value) || !isFinite(value)) return (0).toFixed(decimals);
  const rounded = roundToPrecision(value, decimals, mode);
  return rounded.toFixed(decimals);
}

/**
 * Safely sums an array of numbers with minimal float drift
 */
export function safeSum(numbers: number[]): number {
  const scaled = numbers.map(n => Math.round((n + Number.EPSILON) * 10000));
  const sum = scaled.reduce((acc, curr) => acc + curr, 0);
  return sum / 10000;
}
