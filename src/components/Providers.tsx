"use client";
import React, { type ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from 'next-themes';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true} // Definido explicitamente como true
      enableColorScheme={false} // Mantido como false da tentativa anterior de correção de hidratação
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
};
