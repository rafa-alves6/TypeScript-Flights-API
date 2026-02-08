# Flight API - Backend TypeScript

Este projeto consiste em uma API RESTful para gerenciamento de voos, passageiros e cartões de embarque, desenvolvida com Node.js, TypeScript, Express, Prisma ORM e PostgreSQL, com containeriziação via Docker.

## Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- **Node.js** (versão 18 ou superior)
- **Docker Desktop** (deve estar em execução)
- **Git**

## Guia de Instalação e Configuração

Siga os passos abaixo para configurar o ambiente do zero.

### 1. Instalar Dependências

No terminal, execute:
```bash
npm install
```
### 2. Inicializar o Banco de Dados

Suba o container do PostgreSQL usando o Docker:
```bash
npm run docker:up
```
### 3. Configurar o Banco (Migrate e Seed)

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
