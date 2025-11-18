
import validator from 'validator';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validarEmail(email: string): boolean {
  return validator.isEmail(email, {
    allow_utf8_local_part: false,
    allow_ip_domain: false
  });
}

export function validarPreco(preco: number): boolean {
  if (preco <= 0) return false;
  // Verifica se tem no máximo 2 casas decimais
  const decimais = (preco.toString().split('.')[1] || '').length;
  return decimais <= 2;
}

export function validarInteiro(valor: number): boolean {
  return Number.isInteger(valor);
}

export function validarPositivo(valor: number): boolean {
  return valor >= 0;
}

export function validarStringNaoVazia(valor: string): boolean {
  return typeof valor === 'string' && valor.trim().length > 0;
}

export function validarId(id: string): number {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    throw new ValidationError('ID inválido');
  }
  return numId;
}

export function arredondarDuasCasas(valor: number): number {
  return Math.round(valor * 100) / 100;
}
