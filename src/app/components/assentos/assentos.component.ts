import { CinemaService } from './../../services/cinema.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FilmeService } from '../../services/filme.service';
import { Assento } from '../../models/assento';

@Component({
  selector: 'app-assentos',
  templateUrl: './assentos.component.html',
  styleUrls: ['./assentos.component.css']
})
export class AssentosComponent implements OnInit {

  assentos: Assento[][] = [];
  filmeId!: number;
  horario!: string;
  posterUrl!: string;
  titulo!: string;
  sala!: number;
  tipo!: string;
  selectedAssentos: Assento[] = [];; // Assento que o usuário selecionou
  assentoForm!: FormGroup; //Formulário com nome ecpf, para reservar assento
  showModal: boolean = false; //Controla a exibição do modal do forms

  constructor(private route: ActivatedRoute, private filmeService: FilmeService,
    private cinemaService: CinemaService, private fb: FormBuilder) {

    //Inicializa o forms
    this.assentoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]], // Validação para o nome
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]], // Validação para o CPF
    });
  }

  ngOnInit(): void {
    this.filmeId = Number(this.route.snapshot.paramMap.get('id'));
    this.horario = this.route.snapshot.queryParamMap.get('horario') || ''; // Recupera o horário da sessão

    const filme = this.filmeService.getFilmeById(this.filmeId);
    if (filme && filme.salaId !== undefined) {
      this.titulo = filme.titulo;
      this.posterUrl = filme.posterURL; // Armazena o URL do pôster
      this.sala = filme.salaId;

      const tipoSala = this.cinemaService.getSalaById(filme.salaId);
      if (tipoSala) {
        this.tipo = tipoSala?.tipo;
      }
      const assentosNaoFormatados = this.filmeService.getAssentos(this.filmeId, this.horario, this.sala);
      const colunas = 10; // Ajuste conforme necessário
      this.assentos = this.formatarAssentos(assentosNaoFormatados, colunas); // Formata os assentos
    }
  }
  // Adicionado 21.11
  formatarAssentos(assentos: Assento[], colunas: number): Assento[][] {
    const linhas: Assento[][] = [];
    for (let i = 0; i < assentos.length; i += colunas) {
      linhas.push(assentos.slice(i, i + colunas));
    }
    return linhas;
  }

  selecionarAssento(assento: Assento): void {
    if (assento.ocupado) {
      alert(`Assento ${assento.numero} já está ocupado na sessão das ${this.horario}.`);
      return;
    }

    assento.selecionado = !assento.selecionado;

    if (assento.selecionado) {
      this.selectedAssentos.push(assento);
    } else {
      this.selectedAssentos = this.selectedAssentos.filter(a => a.numero !== assento.numero);
    }
  }

  confirmarAssento(): void {
    if (!this.assentoForm.valid || this.selectedAssentos.length === 0) {
      alert('Por favor, preencha corretamente o nome e o CPF e selecione pelo menos um assento.');
      return;
    }

    const nome = this.assentoForm.get('nome')?.value;
    const cpf = this.assentoForm.get('cpf')?.value;
    const numerosAssentos = this.selectedAssentos.map(assento => assento.numero).join(', ');
    this.selectedAssentos.forEach(assento => {
      assento.ocupado = true;
      assento.selecionado = false;
      assento.nome = nome;
      assento.cpf = cpf;
    });

    alert(`Assento(s) ${numerosAssentos} confirmado(s) para ${nome} (CPF: ${cpf}).`);

    // Limpa os campos de nome e CPF e fecha o modal
    this.showModal = false;
    this.assentoForm.reset();
    this.selectedAssentos = [];
  }

  fecharModal(): void {
    this.showModal = false;
    this.selectedAssentos = []; // Limpa a seleção ao fechar o modal
  }

  abrirModal() {

    if (this.selectedAssentos.length > 0) {
      this.showModal = true;
    }
  }

  mascararCPF() {
    let cpf = this.assentoForm.get('cpf')?.value;

    cpf = cpf.replace(/\D/g, '');

    // Aplica a máscara
    if (cpf.length <= 3) {
      cpf = cpf.replace(/(\d{3})/, '$1');
    } else if (cpf.length <= 6) {
      cpf = cpf.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    } else if (cpf.length <= 9) {
      cpf = cpf.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else {
      cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    }

    // Atualiza o valor do campo
    this.assentoForm.get('cpf')?.setValue(cpf, { emitEvent: false });
  }

}


