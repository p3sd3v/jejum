
"use client";
import React, { type ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};
