# ============================================
# ==== 1. Builder Stage ====
# ============================================
FROM node:20-slim AS builder

# Define diretório de trabalho
WORKDIR /app

# Copia dependências e schema do Prisma
COPY package*.json ./
COPY prisma ./prisma

# Instala dependências de build
RUN apt-get update -y && apt-get install -y openssl
RUN npm ci

# Copia código-fonte e configs
COPY src/app ./src/app
COPY src/components ./src/components
COPY src/lib ./src/lib
COPY src/providers ./src/providers
COPY src/types ./src/types
COPY public ./public
COPY tailwind.config.* ./
COPY postcss.config.* ./
COPY next.config.ts ./
COPY tsconfig.json ./
COPY .env ./

# Gera build de produção
RUN npm run build


# ============================================
# ==== 2. Test Runner Stage (opcional) ====
# ============================================
FROM node:20-slim AS tester

WORKDIR /app

# Copia build e dependências do builder
COPY --from=builder /app ./

# Instala Playwright (para testes E2E)
RUN npx playwright install --with-deps

# Executa testes unitários + E2E
CMD ["sh", "-c", "npx vitest run tests/api && npx playwright test"]


# ============================================
# ==== 3. Runner Stage (produção) ====
# ============================================
FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV TZ=America/Sao_Paulo

# Instala pacotes necessários
RUN apt-get update && \
    apt-get install -y tzdata openssl && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone && \
    dpkg-reconfigure -f noninteractive tzdata

# Copia apenas o essencial do builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/.env ./.env

EXPOSE 3000

# Mostra hora atual no log
RUN date

# Comando padrão de inicialização
CMD ["npm", "run", "start"]
