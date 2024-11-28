// editar-filme.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FilmeService } from '../../services/filme.service';
import { Filme } from '../../models/filmes';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CinemaService } from '../../services/cinema.service';


@Component({
  selector: 'app-editar-filme',
  templateUrl: './editar-filme.component.html',
  styleUrls: ['./editar-filme.component.css']
})
export class EditarFilmeComponent implements OnInit {
  filmeForm: FormGroup;
  filmeId!: number;
  filme!: Filme;
  sala!: number;
  salas: { id: number, capacidade: number, tipo: string, ocupada: boolean }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private filmeService: FilmeService,
    private cinemaService: CinemaService
  ) {
    this.filmeForm = this.fb.group({
      titulo: ['', Validators.required],
      salaId: ['', Validators.required], // Campo para o ID da sala
      duracao: ['', [Validators.required, Validators.min(1)]],
      horarioInicial: [''],
      posterURL: ['', Validators.required], // Campo para a URL do pôster
      sinopse: ['', Validators.required], // Campo para a sinopse
    });
  }

  ngOnInit(): void {
    // Obter o ID do filme da rota
    this.filmeId = Number(this.route.snapshot.paramMap.get('id'));
    // Buscar o filme pelo ID no serviço
    const filme = this.filmeService.getFilmeById(this.filmeId);
    this.salas = this.cinemaService.getSalas();

    if (filme) {
      this.filme = filme;
      this.filmeForm.patchValue(this.filme); // Preenche o formulário com os dados do filme
    } else {
      alert('Filme não encontrado!');
      this.router.navigate(['/gerenciar-filmes']);
    }
  }

  onSubmit(): void {
    if (this.filmeForm.valid) {
      const filmeAtualizado: Filme = { ...this.filme, ...this.filmeForm.value,
        horarioInicial: this.filmeForm.value.horarioInicial || '14:00'
       };

      // Verifica se a sala escolhida está ocupada e o id da sala anterior é diferente da atual
      if (this.cinemaService.isSalaOcupada(filmeAtualizado.salaId) && (this.filme.salaId != filmeAtualizado.salaId)) {

        // Tenta encontrar uma sala disponível
        const salaDisponivel = this.salas.find(sala => !sala.ocupada);
        if (salaDisponivel) {
          // Se encontrar uma sala disponível, sugere essa sala
          alert(`A sala ${filmeAtualizado.salaId} está ocupada. O filme será adicionado à sala ${salaDisponivel.id}.`);
          filmeAtualizado.salaId = salaDisponivel.id;

        } else {
          // Se não houver salas disponíveis
          alert('Não há salas disponíveis no momento.');
          return;
        }
      }
      alert(filmeAtualizado.horarioInicial)
     
      // Atualiza o filme com os dados processados
      if (this.filmeService.contadorSala(filmeAtualizado.salaId) || this.filme.salaId == filmeAtualizado.salaId) {
        this.filmeService.atualizarFilme(filmeAtualizado);
        alert('Filme atualizado com sucesso!');
      }

      // Atualiza o status das salas
      if (this.filme.salaId !== filmeAtualizado.salaId) {
        this.cinemaService.desocuparSala(this.filme.salaId);
        this.cinemaService.ocuparSala(filmeAtualizado.salaId);
      }

      // Redireciona para a página de gerenciamento de filmes
      this.router.navigate(['/gerenciar-filmes']);
    }
    else {
      alert('Preencha o formulário corretamente.');
    }

  }

  cancelar(): void {
    this.router.navigate(['/gerenciar-filmes']); // Volta para a lista de filmes
  }

  mascaraHorario(event: any): void {
    let valor = event.target.value;
    valor = valor.replace(/\D/g, '');
    if (valor.length > 2) {
      valor = valor.substring(0, 2) + ':' + valor.substring(2, 4);
    }
    event.target.value = valor;
  }

}
