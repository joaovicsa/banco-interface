/**
 * @file app/layout.tsx
 * @description Componente de layout raiz da aplicação Next.js.
 * Envolve todas as páginas com provedores globais, aplica estilos e fontes padrão,
 * e define metadados para SEO e configuração do navegador.
 */

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';


import { JSX } from 'react';
import Providers from '@/providers/Providers';

// Carrega a fonte Inter com suporte ao conjunto Latin

const inter = Inter({ subsets: ['latin'] });


/**
 * Metadados da aplicação, utilizados pelo Next.js para SEO e configurações de navegador.
 * @type {Metadata}
 */

export const metadata: Metadata = {
  title: 'Banco Interface',
  description: 'Gerenciamento de Transações Bancárias',
};


/**
 * @component RootLayout
 * @description Componente de layout raiz que envolve todas as páginas da aplicação.
 * Aplica estilos globais, fontes e provedores de contexto.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {React.ReactNode} props.children - Conteúdo da página a ser renderizado dentro do layout.
 * @returns {JSX.Element} Elemento JSX que representa o layout raiz.
 */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <>
      <html lang="pt" suppressHydrationWarning>
        <body className={inter.className}>
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </>
  );
}