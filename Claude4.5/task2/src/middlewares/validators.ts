
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../types/errors.js';

export const validateNumericId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id < 1) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }

  next();
};

export const validateRequestBody = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({ error: 'Body da requisição não pode estar vazio' });
    return;
  }

  next();
};
