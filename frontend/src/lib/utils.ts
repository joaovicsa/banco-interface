/**
 * @file lib/utils.ts
 * @description Utilitário para composição de classes CSS usando clsx e tailwind-merge.
 * Permite combinar múltiplas classes condicionalmente e resolver conflitos de Tailwind CSS.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @function cn
 * @description Função que combina classes CSS de forma segura e otimizada.
 * Utiliza `clsx` para lógica condicional e `twMerge` para resolver conflitos de Tailwind.
 *
 * @param {...ClassValue[]} inputs - Lista de classes CSS (strings, objetos condicionais, arrays).
 * @returns {string} String final de classes CSS combinadas.
 *
 * @example
 * cn("bg-red-500", condition && "text-white", "p-4")
 * // Retorna: "bg-red-500 text-white p-4" (se condition for true)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}