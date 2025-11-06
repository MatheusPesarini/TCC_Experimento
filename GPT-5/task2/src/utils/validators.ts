// Validation helpers (no external deps)

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isPositiveInt(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    Number.isSafeInteger(value)
  );
}

export function isValidIdParam(value: unknown): value is number {
  if (typeof value !== 'string') return false;
  if (!/^\d+$/.test(value)) return false;
  const num = Number(value);
  return Number.isSafeInteger(num) && num >= 1;
}

// ISBN-13 com hifens no formato: XXX-X-XX-XXXXXX-X
// Seguro contra ReDoS: âncoras, quantificadores fixos
const ISBN13_HYPHEN_REGEX = /^\d{3}-\d-\d{2}-\d{6}-\d$/;
export function isValidISBN13Hyphenated(value: unknown): value is string {
  return typeof value === 'string' && ISBN13_HYPHEN_REGEX.test(value);
}

// Email simples e seguro
const SIMPLE_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && SIMPLE_EMAIL_REGEX.test(value);
}

export function isValidISODate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  // Aceita datetimes ISO 8601 parseáveis
  return true;
}
