"use client";
import React, { type ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from 'next-themes';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
      enableColorScheme={true} // Explicitly set to the default value
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
};
