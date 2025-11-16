
import { Request, Response } from 'express';
import { LivroService } from '../services/livro-service.js';
import { LivroValidator } from '../validators/livro-validator.js';
import { CriarLivroDTO, AtualizarLivroDTO } from '../types/index.js';

export class LivroController {
  constructor(private livroService: LivroService) { }

  criar = (req: Request, res: Response): void => {
    const dto: CriarLivroDTO = req.body;
    const resultado = this.livroService.criar(dto);

    if (!resultado.sucesso) {
      res.status(resultado.statusCode || 500).json({ erro: resultado.erro });
      return;
    }

    res.status(201).json(resultado.livro);
  };

  listarTodos = (req: Request, res: Response): void => {
    const livros = this.livroService.listarTodos();
    res.status(200).json(livros);
  };

  buscarPorId = (req: Request, res: Response): void => {
    const validacao = LivroValidator.validarId(req.params.id);
    if (!validacao.valido) {
      res.status(400).json({ erro: validacao.erro });
      return;
    }

    const resultado = this.livroService.buscarPorId(validacao.idNumerico!);
    if (!resultado.sucesso) {
      res.status(resultado.statusCode || 500).json({ erro: resultado.erro });
      return;
    }

    res.status(200).json(resultado.livro);
  };

  atualizar = (req: Request, res: Response): void => {
    const validacao = LivroValidator.validarId(req.params.id);
    if (!validacao.valido) {
      res.status(400).json({ erro: validacao.erro });
      return;
    }

    const dto: AtualizarLivroDTO = req.body;
    const resultado = this.livroService.atualizar(validacao.idNumerico!, dto);

    if (!resultado.sucesso) {
      res.status(resultado.statusCode || 500).json({ erro: resultado.erro });
      return;
    }

    res.status(200).json(resultado.livro);
  };

  deletar = (req: Request, res: Response): void => {
    const validacao = LivroValidator.validarId(req.params.id);
    if (!validacao.valido) {
      res.status(400).json({ erro: validacao.erro });
      return;
    }

    const resultado = this.livroService.deletar(validacao.idNumerico!);
    if (!resultado.sucesso) {
      res.status(resultado.statusCode || 500).json({ erro: resultado.erro });
      return;
    }

    res.status(204).send();
  };
}
