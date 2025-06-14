"use client"; 

import React, { useState } from 'react';
import FastingTimer from '@/components/FastingTimer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress'; // Re-added for jejum progress bar
import { Droplet, Zap } from 'lucide-react';
import Image from 'next/image'; // For placeholder image

export default function DashboardPage() {
  const [historyKey, setHistoryKey] = useState(0); 
  const [currentFastingProgress, setCurrentFastingProgress] = useState(0); // Example state for progress

  const handleFastEnded = () => {
    setHistoryKey(prevKey => prevKey + 1); 
    setCurrentFastingProgress(0); // Reset progress when fast ends
  };

  // This would be updated by FastingTimer or other logic
  const handleProgressUpdate = (progress: number) => {
    setCurrentFastingProgress(progress);
  };
  
  // Placeholder functions for new buttons
  const handleBeberAgua = () => {
    alert("Lembrete: Mantenha-se hidratado!");
  };

  const handleMotivacao = () => {
    alert("Motivação do Dia: Você é capaz!");
  };

  return (
    <div className="space-y-6">
      {/* Status do Jejum */}
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-foreground">Seu Jejum Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <FastingTimer onFastEnded={handleFastEnded} />
        </CardContent>
      </Card>

      {/* Indicadores de Progresso */}
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-foreground">Progresso do Jejum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ProgressBar for Jejum - value needs to be connected to FastingTimer state */}
          <Progress value={currentFastingProgress} className="w-full h-3 [&>div]:bg-primary" />
          <p className="text-sm text-center text-muted-foreground">{currentFastingProgress.toFixed(0)}% completo</p>
        </CardContent>
      </Card>
      
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-foreground">Progresso de Emagrecimento</CardTitle>
          <CardDescription className="text-muted-foreground">Acompanhe sua jornada de perda de peso.</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          {/* Placeholder for chart */}
          <Image 
            src="https://placehold.co/600x300.png" 
            alt="Gráfico de Emagrecimento Placeholder" 
            width={600} 
            height={300} 
            className="rounded-md"
            data-ai-hint="chart graph"
          />
          {/* <canvas id="graficoProgresso"></canvas> */}
        </CardContent>
      </Card>

      {/* Botões de Ação Rápida */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-background rounded-lg shadow">
        <Button 
          onClick={handleBeberAgua} 
          className="bg-success hover:bg-success/90 text-success-foreground text-base py-6"
        >
          <Droplet className="mr-2 h-5 w-5" />
          Beber Água
        </Button>
        <Button 
          onClick={handleMotivacao} 
          className="bg-accent hover:bg-accent/90 text-accent-foreground text-base py-6"
        >
          <Zap className="mr-2 h-5 w-5" />
          Motivação do Dia
        </Button>
      </section>

      {/* FastingHistory can be added back here or on a dedicated "Progresso" page if desired */}
      {/* <FastingHistory key={historyKey} /> */}
    </div>
  );
}
