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
---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

* [Node.js](https://nodejs.org/) (Versão 18 ou superior recomendada)
* Gerenciador de pacotes npm

---

## Instalação e Configuração

1.  **Clone o repositório:**
    ```bash
    git clone git@github.com:rafa-alves6/TypeScript-Flights-API.git
    cd TypeScript-Flights-API
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

### 3. Inicializar o Banco de Dados

Suba o container do PostgreSQL usando o Docker:
```bash
npm run docker:up
```
### 4. Configurar o Banco (Migrate e Seed)

Execute o script de setup para criar as tabelas e popular o banco com dados iniciais:
```bash
npm run setup
```
Você deverá ver a mensagem "Seed completo" ao final.

## Executando a Aplicação

Para iniciar o servidor em modo de desenvolvimento:
```bash
npm run dev
```
A API estará rodando em: `http://localhost:3000`

---

## Documentação da API

**Especificação** 

Leia a [especificação da documentação](http://localhost:3000/api-docs), feita usando Swagger/OpenAPI, enquanto estiver com a API rodando.

### 1. Autenticação

**POST** `/api/login`
Gera o Token JWT necessário para as rotas privadas.
- **Body:** `{ "username": "admin", "password": "123456" }`
- **Retorno:** `{ "token": "..." }`

### 2. Rotas Públicas (Consultas)

**GET** `/api/aircrafts`
- Lista todas as aeronaves.

**GET** `/api/flights`
- Lista todos os voos.

**GET** `/api/passengers`
- Lista todos os passageiros.

### 3. Rota de Teste de Carga (Join)

**GET** `/api/boarding-details`
- Retorna um JSON contendo dados unificados de Cartão de Embarque, Passageiro, Voo e Aeronave (realiza um `JOIN` entre 4 tabelas).

### 4. Gestão de Usuários (Rotas Privadas)

Requer Header: `Authorization: Bearer <SEU_TOKEN>`

**POST** `/api/users` (Apenas Admin)
- Cria um novo operador.
- **Body:** `{ "username": "novo", "password": "123", "role": "regular" }`

**PUT** `/api/users/:id` (Admin ou o próprio usuário)
- Atualiza dados do usuário.

**DELETE** `/api/users/:id` (Apenas Admin)
- Remove um usuário.

---
