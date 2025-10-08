import { z } from "zod";

/* ==============================
   ENUMS
================================ */
export const TransactionTypeEnum = z.enum([
    "deposit",
    "transfer_sent",
    "transfer_received",
    "reversal",
]);

export type TransactionType = z.infer<typeof TransactionTypeEnum>;

/* ==============================
   SCHEMAS
================================ */
export const UserSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1, "Name is required"),
    email: z.string().email(),
    createdAt: z.string().datetime(),
});

export const TransactionSchema = z.object({
    id: z.number().int().positive(),
    type: TransactionTypeEnum,
    amount: z.number().positive("Amount must be greater than zero"),
    createdAt: z.string().datetime(),
});

/* ==============================
   TYPES (inferred from schemas)
================================ */
export type User = z.infer<typeof UserSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;

/* ==============================
   COMPOSITE TYPES
================================ */
export const UserWithTransactionsSchema = UserSchema.extend({
    transactions: z.array(TransactionSchema),
});

export type UserWithTransactions = z.infer<typeof UserWithTransactionsSchema>;
