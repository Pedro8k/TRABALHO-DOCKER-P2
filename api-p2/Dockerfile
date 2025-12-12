# Multi-stage build para otimização
FROM node:18-alpine AS base

# Instalar dependências necessárias
RUN apk add --no-cache \
    python3 \
    make \
    g++

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências de produção
FROM base AS dependencies
RUN npm ci --omit=dev

# Instalar todas as dependências (incluindo dev) para build
FROM base AS build
RUN npm ci

# Copiar código fonte
COPY . .

# Stage final - imagem de produção
FROM node:18-alpine AS production

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar dependências de produção
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar código fonte
COPY --chown=nodejs:nodejs . .

# Usar usuário não-root
USER nodejs

# Expor porta da aplicação
EXPOSE 3000

# Variáveis de ambiente padrão
ENV NODE_ENV=production \
    PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar a aplicação
CMD ["npm", "start"]
