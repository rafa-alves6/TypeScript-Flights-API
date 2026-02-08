# Sistema de Gerenciamento de Voos e Passageiros (API)

Este projeto é uma API RESTful desenvolvida em **Node.js** com **TypeScript** e **Express**. O sistema gerencia dados de aviação civil, oferecendo rotas públicas para consulta de voos, aeronaves e passageiros, além de rotas administrativas protegidas para gestão de operadores do sistema.

A API conta com documentação automática via **Swagger** e autenticação segura via **JWT (JSON Web Token)**.

---

## Tecnologias Utilizadas

* **Node.js**: Ambiente de execução JavaScript.
* **Express**: Framework web para construção da API.
* **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
* **Swagger (OpenAPI)**: Documentação interativa das rotas.
* **JWT (jsonwebtoken)**: Estratégia de autenticação para proteção de rotas.
* **BigQuery** (Integrado na rota de detalhes de embarque para análise de dados massivos).

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

* [Node.js](https://nodejs.org/) (Versão 18 ou superior recomendada)
* Gerenciador de pacotes (`npm` ou `yarn`)

---

## Instalação e Configuração

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/seu-projeto.git](https://github.com/seu-usuario/seu-projeto.git)
    cd seu-projeto
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configuração de Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto com base no exemplo abaixo:

    ```env
    PORT=3000
    JWT_SECRET=sua_chave_secreta_super_segura
    # Adicione aqui credenciais de banco de dados ou BigQuery se necessário
    ```

---

## Executando o Projeto

### Ambiente de Desenvolvimento
Para rodar o projeto com *hot-reload* (reinicia automaticamente ao salvar arquivos):

```bash
npm run dev
