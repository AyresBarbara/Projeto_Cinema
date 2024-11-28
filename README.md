# Projeto Cinema 🎬

Este projeto foi desenvolvido pelo Squad 2 -  Uninassau como parte do **Projeto de Residência Tecnológica do Porto Digital - RISEUP**, com mentoria da **empresa SERPRO** e seus mentores. 

### Integrantes:
- Bárbara Ayres;
- Cleverson Fernando;
- Eduardo Lira;
- Lucas Matos;
- Marcos Daniel.

## Funcionalidades

Ele simula um sistema de gerenciamento e reserva de ingressos para um cinema, oferecendo funcionalidades completas para administração e interação com sessões e filmes.

- **Visualizar filmes em cartaz**: Confira a lista de filmes disponíveis no cinema, com detalhes como título e duração.
- **Escolher sessão**: Selecione o horário e a sala da sessão para assistir ao filme.
- **Reservar assento**: Escolha o assento desejado e preencha os dados de reserva (nome e CPF).
- **Gerenciar filmes**:
  - **Cadastrar filmes novos**: Adicione novos títulos ao catálogo.
  - **Editar filmes**: Atualize as informações de filmes em cartaz.
  - **Excluir filmes**: Remova filmes que não estão mais disponíveis.

## Tecnologias Utilizadas

- **TypeScript**: Para a lógica do projeto.
- **Angular**: Para estruturação e desenvolvimento da aplicação.
- **HTML, CSS e Bootstrap**: Para a interface e estilização.

## Como Executar o Projeto

1. Clone este repositório:
   ```bash
   git clone https://github.com/seu-usuario/projeto-cinema.git
2. Acesse o diretório do projeto:
   ```bash
   cd projeto-cinema
3. Instale as dependências:
   ```bash
   npm install
4. Inicie o servidor de desenvolvimento:
   ```bash
   ng serve
5. Acesse o projeto no navegador em: http://localhost:4200.

## Estrutura do Projeto

- **src/app**: Contém os componentes principais, como:
  - **gerenciar-filmes**: Gerenciamento de filmes.
  - **assentos**: Exibição e seleção de assentos.
- **services**: Serviços para manipular dados de filmes, sessões e reservas.
