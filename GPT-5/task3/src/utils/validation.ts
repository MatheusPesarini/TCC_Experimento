// filepath: c:\Users\mathe\Desktop\TCC_Experimento\GPT-5\task3\src\utils\validation.ts
export function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function parseIdParam(idParam: string): number | null {
  if (!/^[0-9]+$/.test(idParam)) return null;
  const n = Number(idParam);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}
