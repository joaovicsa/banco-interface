
/**
 * @file app/layout.tsx
 * @description Root layout component for the Next.js application. It wraps all pages with global providers,
 *              a consistent header and footer, and applies global styles and fonts.
 */

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';


import { JSX } from 'react';
import Head from 'next/head';
import Providers from '@/providers/Providers';

// Load Inter font with Latin subset

const inter = Inter({ subsets: ['latin'] });

/**
 * Metadata for the application, used by Next.js for SEO and browser configuration.
 * @type {Metadata}
 */

export const metadata: Metadata = {
  title: 'Banco Interface',
  description: 'Gerenciamento de Transações Bancárias',
};

/**
 * Root layout component that wraps all pages in the application.
 *
 * @component
 * @name RootLayout
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The page content to be rendered inside the layout.
 * @returns {JSX.Element} The root layout including global providers, header, footer, and helper widget.
 */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <>
      <Head>
        <link rel="icon" href="/public/favicon.ico" />
      </Head>
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