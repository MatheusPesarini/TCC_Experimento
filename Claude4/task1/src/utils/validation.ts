
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(senha: string): boolean {
  return Boolean(senha && senha.length >= 6);
}

export function isValidId(id: string): boolean {
  const numId = parseInt(id, 10);
  return !isNaN(numId) && numId > 0;
}
