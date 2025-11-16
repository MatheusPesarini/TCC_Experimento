// Utilitários de validação centralizados

export const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

export const isPositiveInt = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
};

// ISBN formato: XXX-X-XX-XXXXXX-X (3-1-2-6-1 dígitos)
const ISBN_REGEX = /^\d{3}-\d-\d{2}-\d{6}-\d$/;
export const isValidIsbn = (value: unknown): value is string => {
  return typeof value === 'string' && ISBN_REGEX.test(value);
};

// Email simples (evitar regex complexa potencial ReDoS)
const SIMPLE_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isValidEmail = (value: unknown): value is string => {
  return typeof value === 'string' && SIMPLE_EMAIL_REGEX.test(value);
};

export const isValidIsoDate = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !isNaN(date.getTime()) && /T/.test(value);
};

export const parseIdParam = (raw: string): number | null => {
  if (!/^\d+$/.test(raw)) return null;
  const num = Number(raw);
  if (!Number.isSafeInteger(num) || num <= 0) return null;
  return num;
};
