import { UpdateUsuarioInput } from '../types.js';

export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

// Validação simples e segura de email (evita regex custosas) – suficiente para os testes
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isValidEmail = (email: unknown): email is string =>
  typeof email === 'string' && EMAIL_REGEX.test(email);

export const isValidPassword = (senha: unknown): senha is string =>
  typeof senha === 'string' && senha.length >= 6;

export const parseIdParam = (raw: string): number | null => {
  if (!/^\d+$/.test(raw)) return null; // apenas dígitos
  const n = Number(raw);
  if (!Number.isSafeInteger(n) || n <= 0) return null;
  return n;
};

export const hasAtLeastOneUpdatableField = (body: unknown): body is UpdateUsuarioInput => {
  if (body === null || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return 'nome' in b || 'email' in b || 'senha' in b;
};
