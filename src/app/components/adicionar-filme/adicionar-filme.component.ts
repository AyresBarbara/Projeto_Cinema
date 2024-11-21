import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FilmeService } from '../../services/filme.service';
import { CinemaService } from '../../services/cinema.service';

@Component({
  selector: 'app-adicionar-filme',
  templateUrl: './adicionar-filme.component.html',
  styleUrls: ['./adicionar-filme.component.css']
})
export class AdicionarFilmeComponent {

  titulo: string = '';
  posterURL: string = '';
  sinopse: string = '';
  tipo!: string;
  duracao: number | null = null;
  salaId: number | null = null;
  salas: { id: number, capacidade: number, tipo: string, ocupada: boolean }[] = [];

  constructor(private router: Router, private filmeService: FilmeService, private cinemaService: CinemaService) { } 

  ngOnInit(): void {
    this.salas = this.cinemaService.getSalas(); // Pega a lista de salas do serviço
  }

  adicionarFilme(titulo: string, numeroSala: string, numero: string, posterURL: string, sinopse: string) {
    this.titulo = titulo;
    this.duracao = Number(numero);
    this.posterURL = posterURL;
    this.sinopse = sinopse;
    this.salaId = Number(numeroSala);

    if (this.titulo && this.salaId && this.posterURL && this.duracao !== null && this.sinopse) { // Verifica se todos os campos estão preenchidos
     
      // Verifica se a sala escolhida está ocupada
      if (this.cinemaService.isSalaOcupada(this.salaId)) {
        // Se a sala está ocupada, tenta encontrar uma sala disponível
        const salaDisponivel = this.salas.find(sala => !sala.ocupada);

        if (salaDisponivel) {
          // Se encontrar uma sala disponível, sugere essa sala
          alert(`A sala ${this.salaId} está ocupada. O filme será adicionado à sala ${salaDisponivel.id}.`);
          this.salaId = salaDisponivel.id;
        } else {
          // Se não houver salas disponíveis
          alert('Não há salas disponíveis no momento.');
          return;
        }
      }

      this.filmeService.adicionarFilmeService(this.titulo,this.salaId, this.duracao, this.posterURL, this.sinopse);// Adiciona o filme

       // Marca a sala como ocupada
       this.cinemaService.ocuparSala(this.salaId);
       
      alert('Filme adicionado com sucesso!');
      this.router.navigate(['/']);
    } else {
      alert('Por favor, preencha todos os campos.');
    }
  }
  
  
}
