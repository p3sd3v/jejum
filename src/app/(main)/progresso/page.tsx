// src/app/(main)/progresso/page.tsx
"use client";
import FastingHistory from "@/components/FastingHistory";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import Image from "next/image";

export default function ProgressoPage() {
  // Key for FastingHistory can be managed here if needed for re-renders from this page
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">Seu Progresso</h1>
        <p className="text-muted-foreground mt-2">Acompanhe sua evolução e histórico de jejuns.</p>
      </header>
      
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-6 w-6 text-primary" />
            Estatísticas Detalhadas
          </CardTitle>
          <CardDescription>
            Visualizações detalhadas do seu progresso (Em breve).
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center">
           <Image 
            src="https://placehold.co/600x300.png?text=Gráficos+de+Progresso+em+Breve" 
            alt="Gráficos de Progresso Placeholder" 
            width={600} 
            height={300} 
            className="rounded-md"
            data-ai-hint="statistics chart"
          />
        </CardContent>
      </Card>

      <FastingHistory /> 
    </div>
  );
}
