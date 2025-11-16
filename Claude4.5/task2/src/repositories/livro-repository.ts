
import { Livro, CriarLivroDTO, AtualizarLivroDTO } from '../types/index.js';
import { DateUtils } from '../utils/date-utils.js';

export class LivroRepository {
  private livros: Livro[] = [];
  private proximoId = 1;

  criar(dto: CriarLivroDTO): Livro {
    const novoLivro: Livro = {
      id: this.proximoId++,
      titulo: dto.titulo,
      autor: dto.autor,
      isbn: dto.isbn,
      quantidadeTotal: dto.quantidadeTotal,
      quantidadeDisponivel: dto.quantidadeTotal,
      dataDeCadastro: DateUtils.getCurrentISODate(),
    };

    this.livros.push(novoLivro);
    return novoLivro;
  }

  buscarPorId(id: number): Livro | undefined {
    return this.livros.find(livro => livro.id === id);
  }

  buscarPorISBN(isbn: string): Livro | undefined {
    return this.livros.find(livro => livro.isbn === isbn);
  }

  listarTodos(): Livro[] {
    return [...this.livros];
  }

  atualizar(id: number, dto: AtualizarLivroDTO): Livro | undefined {
    const livro = this.buscarPorId(id);
    if (!livro) {
      return undefined;
    }

    if (dto.titulo !== undefined) {
      livro.titulo = dto.titulo;
    }
    if (dto.autor !== undefined) {
      livro.autor = dto.autor;
    }
    if (dto.isbn !== undefined) {
      livro.isbn = dto.isbn;
    }
    if (dto.quantidadeTotal !== undefined) {
      const diferenca = dto.quantidadeTotal - livro.quantidadeTotal;
      livro.quantidadeTotal = dto.quantidadeTotal;
      livro.quantidadeDisponivel += diferenca;
    }

    return livro;
  }

  deletar(id: number): boolean {
    const index = this.livros.findIndex(livro => livro.id === id);
    if (index === -1) {
      return false;
    }

    this.livros.splice(index, 1);
    return true;
  }

  atualizarDisponibilidade(id: number, quantidade: number): void {
    const livro = this.buscarPorId(id);
    if (livro) {
      livro.quantidadeDisponivel = quantidade;
    }
  }
}
