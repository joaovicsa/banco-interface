# ---- 1. Builder Stage ----
    FROM node:slim AS builder

    WORKDIR /app

    COPY package*.json ./
    COPY prisma ./prisma

    RUN npm install

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


    RUN npm run build

    FROM node:slim AS runner

    WORKDIR /app

    ENV NODE_ENV=production

    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/prisma /app/prisma
    COPY --from=builder /app/package.json ./package.json
    COPY --from=builder /app/next.config.ts ./next.config.ts
    COPY --from=builder /app/.env ./.env

    EXPOSE 3000

    ENV TZ=America/Sao_Paulo

    ARG DEBIAN_FRONTEND=noninteractive

    # Instala tzdata e configura o timezone
    RUN apt-get update && \
        apt-get install -y tzdata && \
        ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
        echo $TZ > /etc/timezone && \
        dpkg-reconfigure -f noninteractive tzdata

 # Mostra a hora atual no log de build
    RUN date

    CMD ["npm", "run", "start"]
