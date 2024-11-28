export interface Filme {
    id: number;
    titulo: string;
    duracao: number;
    posterURL: string;
    sinopse: string;
    salaId: number;
    horarioInicial?: string; // novo campo (horário em minutos)
}
