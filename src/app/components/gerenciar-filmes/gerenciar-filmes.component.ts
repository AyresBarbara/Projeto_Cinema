// gerenciar-filmes.component.ts
import { Component, OnInit } from '@angular/core';
;
import { Router } from '@angular/router';
import { Filme } from '../../models/filmes';
import { FilmeService } from '../../services/filme.service';

@Component({
  selector: 'app-gerenciar-filmes',
  templateUrl: './gerenciar-filmes.component.html',
  styleUrls: ['./gerenciar-filmes.component.css']
})
export class GerenciarFilmesComponent implements OnInit {
  filmes: Filme[] = [];

  constructor(private filmeService: FilmeService, private router: Router) {}

  ngOnInit(): void {
    this.filmes = this.filmeService.getFilmes(); // Carrega os filmes ao iniciar
  }

  editarFilme(filme: Filme): void {
    this.router.navigate(['/editar-filme', filme.id]); // Navega para a página de edição
  }

  excluirFilme(filmeId: number): void {
    if (confirm('Tem certeza que deseja excluir este filme?')) {
      this.filmes = this.filmes.filter(f => f.id !== filmeId); // Remove o filme da lista
      this.filmeService['filmes'] = this.filmes; // Atualiza o serviço
    }
  }
}