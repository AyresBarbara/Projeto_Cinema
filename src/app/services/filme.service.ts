import { CinemaService } from './cinema.service';
import { Injectable } from '@angular/core';
import { Filme } from '../models/filmes';
import { Assento } from '../models/assento';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilmeService {

  private assentosPorFilmeESessao: { [filmeId: number]: { [horario: string]: Assento[] } } = {};
  private filmesSubject = new BehaviorSubject<Filme[]>([
    {
      id: 1,
      titulo: 'The Matrix',
      duracao: 140,
      posterURL: 'https://media.fstatic.com/Dsnc8_BpNuQaIP04acXtB2V8sU0=/322x478/smart/filters:format(webp)/media/movies/covers/2011/07/6aa590bdfc94c6589dba4dc303057495.jpg',
      sinopse: 'Em um futuro próximo, Thomas Anderson, um jovem programador de computador' +
        ' que mora em um cubículo escuro, é atormentado por estranhos pesadelos nos quais ' +
        'encontra-se conectado por cabos e contra sua vontade, em um imenso sistema de computadores do futuro.',
      salaId: 1,
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

  constructor(private cinemaService: CinemaService) {
    // Chama a inicialização de sessões apenas após a criação ou alteração de filmes
    this.filmes$.subscribe(filmes => {
      filmes.forEach(filme => {
        this.inicializarSessoes();
      });
    });
  }

  private nextId = 4;
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
    this.inicializarSessoes();
  }

  getFilmeById(filmeId: number): Filme | undefined {
    return this.filmesSubject.getValue().find(filme => filme.id === filmeId);
  }

  getFilmes(): Observable<Filme[]> {
    return this.filmes$;
  }

  adicionarFilmeService(
    titulo: string,
    salaId: number,
    duracao: number,
    posterURL: string,
    sinopse: string,
    horarioInicial?: string
  ): void {
    const horarioPadrao = "14:00"; // Define o horário padrão como string
    const novoFilme: Filme = {
      id: this.nextId++,
      titulo,
      salaId,
      duracao,
      posterURL,
      sinopse,
      horarioInicial: horarioInicial || horarioPadrao, // Usa o horário padrão se não for fornecido
    };

    const filmes = [...this.filmesSubject.getValue(), novoFilme];
    this.filmesSubject.next(filmes); // Atualiza o estado dos filmes com o novo filme adicionado
    this.inicializarSessoes(); // Inicializa as sessões para o novo filme
  }

  getAssentos(filmeId: number, horario: string, sala: number): Assento[] {
    if (!this.assentosPorFilmeESessao[filmeId][horario]) {
      this.assentosPorFilmeESessao[filmeId][horario] = this.gerarAssentos(sala); // Cria os assentos para a sessão se ainda não existir
    }
    return this.assentosPorFilmeESessao[filmeId][horario];
  }

  private gerarAssentos(sala: number): Assento[] {
    const capacidade = this.cinemaService.getSalaById(sala);
    const salaCapacidade = capacidade?.capacidade || 0;
    return Array.from({ length: salaCapacidade }, (_, i) => ({
      numero: i + 1,
      ocupado: false,
      nome: '',
      cpf: ''
    }));
  }

  private inicializarSessoes(): void {
    const filmes = this.filmesSubject.getValue();
    this.assentosPorFilmeESessao = {}; // Limpa os assentos
    const filmesPorSala: { [salaId: number]: Filme[] } = {};

    // Organiza os filmes por sala
    filmes.forEach((filme) => {
      if (!filmesPorSala[filme.salaId]) {
        filmesPorSala[filme.salaId] = [];
      }
      filmesPorSala[filme.salaId].push(filme);
    });

    // Organiza as sessões de filmes
    for (const salaId in filmesPorSala) {
      const filmesNaSala = filmesPorSala[salaId];
      let horarioAtual = filmesNaSala[0]?.horarioInicial
        ? this.converterParaMinutos(filmesNaSala[0].horarioInicial) // Converte horas e minutos em minutos totais
        : 14 * 60; // 14:00 padrão
      const horarioFim = 24 * 60; // Limite: 24:00

      let filmeIndex = 0;

      // Organiza as sessões dos filmes na sala
      while (horarioAtual < horarioFim) {
        const filme = filmesNaSala[filmeIndex];

        // Ajusta o horário atual para o horário inicial do filme (se houver)
        if (filme.horarioInicial) {
          const horarioInicialFilme = this.converterParaMinutos(filme.horarioInicial);
          if (horarioAtual < horarioInicialFilme) {
            horarioAtual = horarioInicialFilme;
          }
        }

        const duracaoTotal = filme.duracao + 20; // Duração do filme + intervalo
        const horarioFormatado = this.converterParaHorario(horarioAtual);

        // Inicializa os assentos para o filme se necessário
        if (!this.assentosPorFilmeESessao[filme.id]) {
          this.assentosPorFilmeESessao[filme.id] = {};
        }

        // Gera os assentos para a sessão
        this.assentosPorFilmeESessao[filme.id][horarioFormatado] = this.gerarAssentos(filme.salaId);

        // Avança o horário para o próximo filme
        horarioAtual += duracaoTotal;

        // Verifica se há um proximo filme
        if (filmeIndex + 1 < filmesNaSala.length) {
          const proximoFilme = filmesNaSala[filmeIndex + 1];
          const horarioInicioProximoFilme = proximoFilme.horarioInicial ? this.converterParaMinutos(proximoFilme.horarioInicial) : horarioFim;
          const horarioFimFilmeAtual = horarioAtual;

          // Se houver uma lacuna entre o final do filme atual e o início do próximo filme
          if (horarioInicioProximoFilme > horarioFimFilmeAtual) {
            // Repete o filme anterior enquanto houver tempo
            let tempoRestante = horarioInicioProximoFilme - horarioFimFilmeAtual;
            while (tempoRestante >= duracaoTotal) {
              // Se o tempo restante for suficiente para repetir o filme
              const horarioRepetido = this.converterParaHorario(horarioAtual);
              this.assentosPorFilmeESessao[filme.id][horarioRepetido] = this.gerarAssentos(filme.salaId);
              tempoRestante -= duracaoTotal;
              horarioAtual += duracaoTotal;
            }
          }
        }
        filmeIndex = (filmeIndex + 1) % filmesNaSala.length;
      }
    }
  }

  contadorSala(idsala: number): boolean {
    const sala = this.cinemaService.getSalaById(idsala);
    if (sala) {
      if (sala.qtdFilmes < 2) {
        sala.qtdFilmes += 1;
        return true;
      }
    }
    return false;
  }

  // Criação de funções para evitar repetição de codigo
  converterParaMinutos(horario: string): number {
    const [horas, minutos] = horario.split(":").map(Number);
    return horas * 60 + minutos;
  }
  converterParaHorario(minutosTotais: number): string {
    const horas = Math.floor(minutosTotais / 60);
    const minutos = minutosTotais % 60;
    return `${horas.toString().padStart(2, "0")}:${minutos
      .toString()
      .padStart(2, "0")}`;
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

}
