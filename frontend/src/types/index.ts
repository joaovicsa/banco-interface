/**
 * @file types/index.ts
 * @description Define os tipos e esquemas de validação utilizados na aplicação Banco Interface.
 * Utiliza Zod para garantir a integridade dos dados de usuários e transações.
 */

import { z } from "zod";

/* ==============================
   ENUMS
================================ */

/**
 * @constant TransactionTypeEnum
 * @description Enumeração dos tipos de transações permitidas.
 * - deposit: Depósito
 * - transfer_sent: Transferência enviada
 * - transfer_received: Transferência recebida
 * - reversal: Reversão de transação
 */
export const TransactionTypeEnum = z.enum([
    "deposit",
    "transfer_sent",
    "transfer_received",
    "reversal",
]);

/**
 * @typedef {TransactionType}
 * @description Tipo inferido a partir do enum TransactionTypeEnum.
 */
export type TransactionType = z.infer<typeof TransactionTypeEnum>;

/* ==============================
   SCHEMAS
================================ */

/**
 * @constant UserSchema
 * @description Esquema de validação para dados de usuário.
 */
export const UserSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1, "Name is required"),
    email: z.string().email(),
    createdAt: z.string().datetime(),
});

/**
 * @constant TransactionSchema
 * @description Esquema de validação para dados de transação.
 */
export const TransactionSchema = z.object({
    id: z.number().int().positive(),
    type: TransactionTypeEnum,
    amount: z.number().positive("Amount must be greater than zero"),
    createdAt: z.string().datetime(),
});

/* ==============================
   TYPES (inferidos dos schemas)
================================ */

/**
 * @typedef {User}
 * @description Tipo inferido a partir do esquema UserSchema.
 */
export type User = z.infer<typeof UserSchema>;

/**
 * @typedef {Transaction}
 * @description Tipo inferido a partir do esquema TransactionSchema.
 */
export type Transaction = z.infer<typeof TransactionSchema>;

/* ==============================
   TIPOS COMPOSTOS
================================ */

/**
 * @constant UserWithTransactionsSchema
 * @description Esquema composto que representa um usuário com histórico de transações.
 */
export const UserWithTransactionsSchema = UserSchema.extend({
    transactions: z.array(TransactionSchema),
});

/**
 * @typedef {UserWithTransactions}
 * @description Tipo inferido a partir do esquema UserWithTransactionsSchema.
 */
export type UserWithTransactions = z.infer<typeof UserWithTransactionsSchema>;