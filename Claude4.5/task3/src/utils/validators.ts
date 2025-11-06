import validator from 'validator';

export function isValidEmail(email: string): boolean {
  return validator.isEmail(email);
}

export function hasMaxTwoDecimals(value: number): boolean {
  const str = value.toString();
  const decimalIndex = str.indexOf('.');
  
  if (decimalIndex === -1) {
    return true;
  }
  
  const decimals = str.substring(decimalIndex + 1);
  return decimals.length <= 2;
}

export function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

export function isValidId(id: string): boolean {
  const num = parseInt(id, 10);
  return !isNaN(num) && num.toString() === id && num > 0;
}

export function roundToTwo(num: number): number {
  return Math.round(num * 100) / 100;
}
