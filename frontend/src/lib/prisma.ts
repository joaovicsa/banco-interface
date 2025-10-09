/**
 * @file lib/prisma.ts
 * @description Configuração do cliente Prisma para acesso ao banco de dados.
 * Garante que apenas uma instância do PrismaClient seja utilizada em ambiente de desenvolvimento,
 * evitando problemas com múltiplas conexões durante o hot reload.
 */

import { PrismaClient } from "@prisma/client";

/**
 * @constant globalForPrisma
 * @description Referência global para armazenar a instância do PrismaClient em ambiente de desenvolvimento.
 */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/**
 * @constant prisma
 * @description Instância única do PrismaClient utilizada em toda a aplicação.
 */

export const prisma = new PrismaClient();

/**
 * @description Em ambiente de desenvolvimento, armazena a instância do PrismaClient globalmente
 * para evitar múltiplas conexões ao banco durante o hot reload.
 */

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
