/**
 * @file providers/providers.tsx
 * @description Envolve a aplicação com provedores de contexto globais, como tema, autenticação,
 * dados do usuário e notificações. Garante consistência de estado e configuração em toda a aplicação.
 */

'use client';

import { JSX, ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster as Sonner } from '@/components/ui/sonner';

/**
 * @typedef {Object} ProvidersProps
 * @property {ReactNode} children - Componentes filhos que serão envolvidos pelos provedores.
 */
interface ProvidersProps {
    children: ReactNode;
}

/**
 * @component Providers
 * @description Componente que aplica provedores globais à aplicação:
 * - `ThemeProvider`: gerencia tema claro/escuro com suporte ao sistema.
 * - `Sonner`: gerencia notificações visuais (toasts).
 *
 * Este componente deve ser usado na raiz da aplicação para garantir que todos os componentes
 * tenham acesso aos contextos globais necessários.
 *
 * @param {ProvidersProps} props - Propriedades do componente.
 * @returns {JSX.Element} Elemento JSX com os provedores aplicados.
 */
export default function Providers({ children }: ProvidersProps): JSX.Element {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Sonner />
            {children}
        </ThemeProvider>
    );
}