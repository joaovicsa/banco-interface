
/**
 * @file Providers.tsx
 * @description Wraps the application with global context providers including theme, authentication,
 *              user data, and event data. Ensures consistent state and configuration across the app.
 */

'use client';

import { JSX, ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';



/**
 * Props for the Providers component.
 * @type {ProvidersProps}
 * @property {ReactNode} children - The child components to be wrapped by the providers.
 */

interface ProvidersProps {
    children: ReactNode;
}

/**
 * @component
 * @name Providers
 * @description Wraps the application with multiple context providers:
 * - `ThemeProvider` for light/dark mode support.
 * - `AuthProvider` for authentication state.
 * - `UserProvider` for user-specific data.
 * - `EventProvider` for event-related state.
 *
 * This component should be used at the root of the application to ensure all pages
 * and components have access to the necessary global contexts.
 *
 * @param {ProvidersProps} props - The component props.
 * @returns {JSX.Element} The wrapped children with all providers applied.
 */

export default function Providers({ children }: ProvidersProps): JSX.Element {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </ThemeProvider>
    );
}