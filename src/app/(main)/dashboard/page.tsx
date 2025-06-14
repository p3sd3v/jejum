
"use client";

import React, { useState } from 'react';
import FastingTimer from '@/components/FastingTimer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplet, Zap } from 'lucide-react';
import WeightProgressChart from '@/components/WeightProgressChart';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [historyKey, setHistoryKey] = useState(0);
  const [currentFastingProgress, setCurrentFastingProgress] = useState(0);
  const [fastingGoalHours, setFastingGoalHours] = useState<number | undefined>(undefined);

  const handleTimerUpdate = (progress: number, goalHours?: number) => {
    setCurrentFastingProgress(progress);
    if (goalHours !== undefined) {
      setFastingGoalHours(goalHours);
    }
  };

  const handleFastEnded = () => {
    setHistoryKey(prevKey => prevKey + 1);
    setCurrentFastingProgress(0); // Reset progress when fast ends
    setFastingGoalHours(undefined); // Reset goal display
  };

  const handleBeberAgua = () => {
    alert("Lembrete: Mantenha-se hidratado!");
    // Future: Log water intake action
  };

  const handleMotivacao = () => {
    alert("Motivação do Dia: Você é capaz!");
    // Future: Fetch and display AI motivation tip
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-foreground">Seu Jejum Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <FastingTimer onFastEnded={handleFastEnded} onTimerUpdate={handleTimerUpdate} />
        </CardContent>
      </Card>

      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-foreground">Progresso do Jejum</CardTitle>
          {fastingGoalHours !== undefined && currentFastingProgress > 0 && (
            <CardDescription className="text-muted-foreground">Meta: {fastingGoalHours} horas</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={currentFastingProgress} className="w-full h-3 [&>div]:bg-primary" />
          <p className="text-sm text-center text-muted-foreground">{currentFastingProgress > 0 ? `${currentFastingProgress.toFixed(0)}% completo` : 'Nenhum jejum ativo.'}</p>
        </CardContent>
      </Card>

      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-foreground">Progresso de Emagrecimento</CardTitle>
          <CardDescription className="text-muted-foreground">Acompanhe sua jornada de perda de peso.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[320px] flex flex-col items-center justify-center">
          {currentUser && <WeightProgressChart />}
          {!currentUser && <p className="text-muted-foreground">Carregando dados do usuário...</p>}
        </CardContent>
      </Card>

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
    </div>
  );
}
