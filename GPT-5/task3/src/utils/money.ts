// filepath: c:\Users\mathe\Desktop\TCC_Experimento\GPT-5\task3\src\utils\money.ts
const EPSILON = 1e-9;

export function hasAtMostTwoDecimals(n: number): boolean {
  if (!Number.isFinite(n)) return false;
  const s = n.toString();
  const idx = s.indexOf('.');
  if (idx === -1) return true;
  return s.length - idx - 1 <= 2;
}

export function toCents(n: number): number {
  // Usa arredondamento para evitar erros binários
  return Math.round((n + 0) * 100);
}

export function fromCents(cents: number): number {
  return Math.round(cents) / 100;
}

export function sumCents(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

export function isPositiveInteger(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n > 0;
}

export function isNonNegativeInteger(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= 0;
}
