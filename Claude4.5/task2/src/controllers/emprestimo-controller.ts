
import { Request, Response } from 'express';
import { EmprestimoService } from '../services/emprestimo-service.js';
import { EmprestimoValidator } from '../validators/emprestimo-validator.js';
import { CriarEmprestimoDTO } from '../types/index.js';

export class EmprestimoController {
  constructor(private emprestimoService: EmprestimoService) { }

  criar = (req: Request, res: Response): void => {
    const dto: CriarEmprestimoDTO = req.body;
    const resultado = this.emprestimoService.criar(dto);

    if (!resultado.sucesso) {
      res.status(resultado.statusCode || 500).json({ erro: resultado.erro });
      return;
    }

    res.status(201).json(resultado.emprestimo);
  };

  listarTodos = (req: Request, res: Response): void => {
    const emprestimos = this.emprestimoService.listarTodos();
    res.status(200).json(emprestimos);
  };

  buscarPorId = (req: Request, res: Response): void => {
    const validacao = EmprestimoValidator.validarId(req.params.id);
    if (!validacao.valido) {
      res.status(400).json({ erro: validacao.erro });
      return;
    }

    const resultado = this.emprestimoService.buscarPorId(validacao.idNumerico!);
    if (!resultado.sucesso) {
      res.status(resultado.statusCode || 500).json({ erro: resultado.erro });
      return;
    }

    res.status(200).json(resultado.emprestimo);
  };

  devolver = (req: Request, res: Response): void => {
    const validacao = EmprestimoValidator.validarId(req.params.id);
    if (!validacao.valido) {
      res.status(400).json({ erro: validacao.erro });
      return;
    }

    const resultado = this.emprestimoService.devolver(validacao.idNumerico!);
    if (!resultado.sucesso) {
      res.status(resultado.statusCode || 500).json({ erro: resultado.erro });
      return;
    }

    res.status(200).json(resultado.emprestimo);
  };

  deletar = (req: Request, res: Response): void => {
    const validacao = EmprestimoValidator.validarId(req.params.id);
    if (!validacao.valido) {
      res.status(400).json({ erro: validacao.erro });
      return;
    }

    const resultado = this.emprestimoService.deletar(validacao.idNumerico!);
    if (!resultado.sucesso) {
      res.status(resultado.statusCode || 500).json({ erro: resultado.erro });
      return;
    }

    res.status(204).send();
  };
}
