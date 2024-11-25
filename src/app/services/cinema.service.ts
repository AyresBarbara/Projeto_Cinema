import { Injectable } from '@angular/core';
import { Sala } from '../models/sala';

@Injectable({
  providedIn: 'root'
})
export class CinemaService {
  private salas: Sala[] = [
    { id: 1, capacidade: 40, tipo: '3D', ocupada: false,qtdFilmes:1},
    { id: 2, capacidade: 60, tipo: 'IMAX', ocupada: false,qtdFilmes: 1 },
    { id: 3, capacidade: 80, tipo: '2D', ocupada: false, qtdFilmes: 1 },
    { id: 4, capacidade: 40, tipo: '3D', ocupada: false, qtdFilmes: 0 },
    { id: 5, capacidade: 60, tipo: 'IMAX', ocupada: false, qtdFilmes: 0 },
    { id: 6, capacidade: 80, tipo: '2D', ocupada: false, qtdFilmes: 0}
  ];
  constructor() {}

  getSalas(): { id: number, capacidade: number, tipo: string, ocupada: boolean }[] {
    return this.salas;
  }
  
  getSalaById(salaId: number): Sala | undefined {
    return this.salas.find(sala => sala.id == salaId);
  }
  // Verificar se uma sala está ocupada
  isSalaOcupada(salaId: number): boolean {
    const sala = this.getSalaById(salaId);
    return sala ? sala.ocupada : false;
  }

  // Marcar a sala como ocupada
  ocuparSala(salaId: number): void {
    const sala = this.getSalaById(salaId);
    if (sala) {
      sala.ocupada = true;
    }
  }

  // Marcar a sala como desocupada
  desocuparSala(salaId: number): void {
    const sala = this.getSalaById(salaId);
    if (sala) {
      sala.ocupada = false;
      sala.qtdFilmes -= 1;
    }
  }
}
