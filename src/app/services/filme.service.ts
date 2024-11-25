import { CinemaService } from './cinema.service';
import { Injectable } from '@angular/core';
import { Filme } from '../models/filmes';
import { Assento } from '../models/assento';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilmeService {

  private CinemaService = new CinemaService;
  private filmesSubject = new BehaviorSubject<Filme[]>([
    {
      id: 1,
      titulo: 'The Matrix',
      duracao: 140,
      posterURL: 'https://media.fstatic.com/Dsnc8_BpNuQaIP04acXtB2V8sU0=/322x478/smart/filters:format(webp)/media/movies/covers/2011/07/6aa590bdfc94c6589dba4dc303057495.jpg',
      sinopse: 'Em um futuro próximo, Thomas Anderson, um jovem programador de computador' +
        ' que mora em um cubículo escuro, é atormentado por estranhos pesadelos nos quais ' +
        'encontra-se conectado por cabos e contra sua vontade, em um imenso sistema de computadores do futuro.',
      salaId: 1
    },

    {
      id: 2,
      titulo: 'O ilusionista',
      duracao: 90,
      posterURL: 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQ-mi1hGavFqyhmD_Xm7JVQnbm6_XiKIEGM7BIPhHxOA20vR7cp',
      sinopse: 'O famoso ilusionista Eisenheim assombra as platéias de Viena com seu impressionante ' +
        'espetáculo de mágica. Suas apresentações despertam a curiosidade de um dos mais poderosos ' +
        'e céticos homens da Europa, o Príncipe Leopold.',
      salaId: 2
    },

    {
      id: 3,
      titulo: 'Terrifier',
      duracao: 82,
      posterURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS64MQjQg496AMli5m1k6-JBNaZdSDcRXjL2NBr3_bpVfwCOfQX',
      sinopse: 'Em Terrifier, um programa de televisão passa. Nele, um repórter entrevista uma mulher gravemente ' +
        'desfigurada, a única sobrevivente de um massacre ocorrido no Halloween anterior.',
      salaId: 3
    },


  ]);

  filmes$ = this.filmesSubject.asObservable();



  atualizarFilme(filmeAtualizado: Filme): void {
    const filmes = this.filmesSubject.getValue();
    const index = filmes.findIndex(f => f.id === filmeAtualizado.id);

    if (index !== -1) {
      filmes[index] = { ...filmeAtualizado };
      this.filmesSubject.next([...filmes]); // Emite a nova lista de filmes
    } else {
      alert('Filme não encontrado para atualização.');
    }
  }
  getFilmeById(filmeId: number): Filme | undefined {
    return this.filmesSubject.getValue().find(filme => filme.id === filmeId);
  }

  private assentosPorFilmeESessao: { [filmeId: number]: { [horario: string]: Assento[] } } = {};

  private horariosDeSessao: string[] = [];

  constructor(private cinemaService: CinemaService) {
    this.filmes$.subscribe(filmes => {
      filmes.forEach(filme => {
        this.inicializarSessoes(filme.id);
      });
    });
  }

  private nextId = 4;

  getFilmes(): Observable<Filme[]> {
    return this.filmes$;
  }

  adicionarFilmeService(titulo: string, salaId: number, duracao: number, posterURL: string, sinopse: string): void {
    const novoFilme: Filme = { id: this.nextId++, titulo, salaId, duracao, posterURL, sinopse };
    const filmes = [...this.filmesSubject.getValue(), novoFilme];
    this.filmesSubject.next(filmes); // Inicializa as sessões e assentos para o novo filme
  }

  getAssentos(filmeId: number, horario: string, sala: number): Assento[] {
    if (!this.assentosPorFilmeESessao[filmeId][horario]) {
      this.assentosPorFilmeESessao[filmeId][horario] = this.gerarAssentos(sala); // Cria os assentos para a sessão se ainda não existir
    }
    return this.assentosPorFilmeESessao[filmeId][horario];
  }

  private gerarAssentos(sala: number): Assento[] {
    const capacidade = this.CinemaService.getSalaById(sala);
    const salaCapacidade = capacidade?.capacidade || 0;
    return Array.from({ length: salaCapacidade }, (_, i) => ({
      numero: i + 1,
      ocupado: false,
      nome: '',
      cpf: ''
    }));
  }

  private inicializarSessoes(filmeId: number): void {
    this.assentosPorFilmeESessao[filmeId] = {};

    const duracao = this.filmesSubject.getValue().find(f => f.id === filmeId)?.duracao || 0;
    const sala = this.filmesSubject.getValue().find(f => f.id === filmeId)?.salaId || 0;
    const duracaoEmMinutos = duracao + 20; // Duração do filme mais intervalo de 20 minutos
    const horarioInicial = 14 * 60;

    let horarioAtual = horarioInicial; // Inicia em 14:00 
    const horarioFim = 23 * 60; // Termina em 23:00 

    while (horarioAtual < horarioFim) {
      const hora = Math.floor(horarioAtual / 60);
      const minuto = horarioAtual % 60;
      const horarioFormatado = `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
      this.assentosPorFilmeESessao[filmeId][horarioFormatado] = this.gerarAssentos(sala);
      horarioAtual += duracaoEmMinutos; // Próximo horário
    }
  }


  excluirFilme(filmeId: number): void {
    const filmes = this.filmesSubject.getValue();
    const filmesAtualizados = filmes.filter(filme => filme.id !== filmeId);

    if (filmes.length !== filmesAtualizados.length) {
      const filme = this.getFilmeById(filmeId);

      if (filme?.salaId) {
        this.cinemaService.desocuparSala(filme.salaId);
      }

      this.filmesSubject.next(filmesAtualizados);
      alert(`Filme com ID ${filmeId} excluído com sucesso.`);

    } else {
      alert('Filme não encontrado para exclusão.');
    }
  }

   contadorSala(idsala: number): boolean{
    const sala = this.cinemaService.getSalaById(idsala);
    if (sala) {
      if (sala.qtdFilmes < 2) { 
        sala.qtdFilmes += 1;
      return true;
      }
    }
 
    return false;
    }

}