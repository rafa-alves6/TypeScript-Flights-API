# Guia de Execução da Flight API

Este guia detalha o processo completo para configurar o ambiente, instalar dependências, corrigir arquivos faltantes e executar a API de voos.

## Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:
- Node.js (versão 18 ou superior)
- Docker Desktop (deve estar em execução)
- Git (opcional)

## Passo a Passo para Instalação

### 1. Instalar Dependências

Abra o terminal na pasta raiz do projeto e execute o comando para baixar as bibliotecas necessárias:
```bash
npm install
```

### 2. Inicializar o Banco de Dados (Docker)

Utilize o script configurado para subir o container do PostgreSQL via Docker:
```bash
npm run docker:up
```
Aguarde até que o container esteja rodando.

### 3. Configurar o Banco e Inserir Dados (Setup)

Execute o script de setup para criar as tabelas no banco de dados e popular com dados iniciais (seed):
```bash
npm run setup
```
Se o comando for bem-sucedido, você verá a mensagem "Seed completo" no final.

## Executando a Aplicação

Para iniciar o servidor em modo de desenvolvimento, execute:
```bash
npm run dev
```
Se tudo estiver correto, o terminal exibirá: API rodando na porta 3000.

## Testando a API (Exemplos com cURL)

Abaixo estão exemplos de como testar as rotas utilizando o terminal.

### 1. Listar Voos (Rota Pública)
```bash
curl -X GET http://localhost:3000/api/flights
```
### 2. Login (Autenticação)

Use o usuário padrão criado pelo seed (admin) para obter um token de acesso.
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "123456"}'
```
Resposta esperada: Um JSON contendo o campo "token". Copie o valor do token para usar nas rotas privadas.

### 3. Criar Usuário (Rota Privada - Requer Token)

Substitua SEU_TOKEN_AQUI pelo token obtido no passo anterior.
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{"username": "novo_operador", "password": "123", "role": "regular"}'
```
### 4. Deletar Usuário (Rota Privada - Requer Token)

Exemplo para deletar o usuário com ID 2:
```bash
curl -X DELETE http://localhost:3000/api/users/2 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```
