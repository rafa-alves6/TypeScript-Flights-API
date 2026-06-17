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
* [Docker](https://www.docker.com/get-started/) (com Docker Compose V2)

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

### 5. Definição da estratégia RBAC
 O sistema utiliza um modelo de Role-Based Access Control (RBAC) para proteger dados sensíveis e restringir ações administrativas. As regras são aplicadas tanto no Backend (Middleware de Autorização) quanto no Frontend (Redirecionamento de Rotas e Renderização Condicional).

| Papel (Role) | Perfil de Usuário | Permissões e Capabilidades | Endpoints / Recursos Protegidos |
| :--- | :--- | :--- | :--- |
| **Público** | Usuário não autenticado (Visitante) | Pode consultar informações gerais que não expõem dados pessoais (PII). | `GET /api/aircrafts`<br>`GET /api/flights`<br>`POST /api/login` |
| **Operador** | `regular` (Staff de Solo / Check-in) | Focado no atendimento ao passageiro. Tem acesso a dados sensíveis necessários para o embarque, mas não pode alterar a estrutura do sistema. | Herda permissões Públicas +<br>`GET /api/passengers`<br>`GET /api/boarding-details`<br>`PUT /api/users/:id` (Apenas o próprio perfil) |
| **Administrador** | `admin` (TI / Gerência) | Controle total do sistema. Gerencia usuários, frota e configurações. | Herda todas as permissões anteriores +<br>`POST /api/users` (Criar novos operadores/admins)<br>`DELETE /api/users/:id` |

### Regras de Segurança Implementadas
1. **Proteção de PII (Dados Pessoais):** Rotas que retornam passaportes, datas de nascimento e listas de passageiros exigem autenticação de nível `regular` ou `admin`.
2. **Validação de Dados (Zod):** Todas as rotas de escrita (POST/PUT) validam o *payload* antes de chegar ao banco de dados para prevenir injeção de dados malformados.
3. **Rate Limiting:** A rota de login possui um limitador de taxa (10 tentativas a cada 5 minutos por IP) para mitigar ataques de força bruta.

---
