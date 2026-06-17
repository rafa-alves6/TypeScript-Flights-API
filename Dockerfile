FROM node:20-alpine

WORKDIR /app

# Copia arquivos de dependências e Prisma
COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig.json ./

# Instala dependências e gera o Prisma Client
RUN npm install
RUN npx prisma generate

# Copia o resto do código e compila o TypeScript
COPY . .
RUN npm run build

# Expõe a porta que o Express usa
EXPOSE 3000

# Comando de início: Aplica migrations pendentes e sobe o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]