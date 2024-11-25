import { Filme } from "./filmes";

export interface Sala {
    id: number;          
    capacidade: number;    
    tipo: string;  
    ocupada: boolean;
    qtdFilmes: number;       
}
