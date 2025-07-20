# Estágio 1: Build da aplicação
FROM node:18-alpine AS builder

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de pacotes da subpasta 'api'
COPY api/package*.json ./

# Instala todas as dependências (incluindo as de desenvolvimento)
RUN npm install

# Copia todo o conteúdo da pasta 'api' para o contêiner
COPY api/ ./

# Gera o cliente Prisma, essencial para a aplicação funcionar
RUN npx prisma generate

# Compila o código TypeScript para JavaScript (para a pasta /app/dist)
RUN npm run build

# ---

# Estágio 2: Imagem final de produção
FROM node:18-alpine

WORKDIR /app

# Copia os arquivos de pacotes novamente
COPY api/package*.json ./

# Instala APENAS as dependências de produção
RUN npm install --omit=dev
RUN mkdir -p /app/src/uploads

# Copia os artefatos essenciais do estágio 'builder' para a imagem final
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
RUN mkdir -p /app/dist/uploads
COPY api/prisma ./prisma

EXPOSE 3000
EXPOSE 5555

# Comando para rodar as migrations e iniciar o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]