# API de voos 

API REST para gerenciamento de voos usando TypeScript, Node.js, and PostgreSQL.

## Requisitos 
- Node.js (v18+)
- Banco de dados PostgreSQL

## Installation

1.  **Clone o repositório e instale as dependências**
    ```bash
    npm install
    ```

2.  **Configuração do banco de dados:**
    * Crie um banco de dados chamado `demo-flight_ts`.
    * Crie um arquivo .env com os seguintes dados:
        ```env
        DATABASE_URL="postgresql://SEU_USUÁRIO:SUA_SENHA@localhost:5432/demo-flight_ts?schema=public"
        JWT_SECRET="sua_chave" 
        PORT=3000
        ```

3.  **Execute as Migrações:**
    ```bash
    npx prisma migrate dev --name init
    ```

4.  **Popule o banco de dados:**
    ```bash
    npx ts-node prisma/seed.ts
    ```

## Execute a API 

* **Modo de desenvolvedor:**
    ```bash
    npx nodemon src/server.ts
    ```

* **Produção:**
    ```bash
    npm run build
    npm start
    ```

## Endpoints da API  

### Rotas Públicas 
* `POST /api/login`: Autenticar usuário (Body: `username`, `password`).
* `GET /api/aircrafts`: Listar todos os aviões 
* `GET /api/flights`: Listar todos os voos.
* `GET /api/passengers`: Listar todos os passageiros.
* `GET /api/boarding-details`: Retorna dados sobre os passes, passageiros, voos e aviões 

### Rotas Privadas (precisa do token JWT [Bearer Token]) 
* `POST /api/users`: Criar usuário (apenas admin) 
* `PUT /api/users/:id`: Atualizar usuário (Admin ou Owner).
* `DELETE /api/users/:id`: Deletar usuário (Admin).
