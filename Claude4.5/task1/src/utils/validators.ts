/**
 * Validadores de dados
 */

/**
 * Valida formato de email usando regex seguro (evita ReDoS)
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Regex simples e seguro para validação básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida se a senha tem pelo menos 6 caracteres
 */
export function isValidPassword(senha: string): boolean {
  return typeof senha === 'string' && senha.length >= 6;
}

/**
 * Valida se o nome é uma string não vazia
 */
export function isValidNome(nome: string): boolean {
  return typeof nome === 'string' && nome.trim().length > 0;
}

/**
 * Valida se o ID é um número válido
 */
export function isValidId(id: string | number): boolean {
  const num = typeof id === 'string' ? Number(id) : id;
  return !isNaN(num) && Number.isInteger(num) && num > 0;
}
