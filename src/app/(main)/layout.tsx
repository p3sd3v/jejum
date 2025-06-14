
"use client";
import React, { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Loader2, Settings, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  if (loading || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>
      <footer className="bg-card py-6 text-center text-sm text-muted-foreground border-t border-border">
        <div className="container mx-auto flex justify-around items-center">
          <Link href="/suporte" className="flex flex-col items-center text-primary hover:text-primary/80">
            <HelpCircle className="h-6 w-6 mb-1" />
            Suporte
          </Link>
          <p>© {new Date().getFullYear()} Seca Jejum.</p>
          <Link href="/configuracoes" className="flex flex-col items-center text-primary hover:text-primary/80">
            <Settings className="h-6 w-6 mb-1" />
            Configurações
          </Link>
        </div>
      </footer>
    </div>
  );
}
