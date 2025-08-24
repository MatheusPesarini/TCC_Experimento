
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return Boolean(password && password.length >= 6);
};

export const isValidId = (id: string): boolean => {
  const numId = Number(id);
  return !isNaN(numId) && numId > 0 && Number.isInteger(numId);
};
