
"use client";

import React, { useState } from 'react';
import FastingTimer from '@/components/FastingTimer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplet, Zap, TrendingUp, PlusCircle } from 'lucide-react';
import WeightProgressChart from '@/components/WeightProgressChart';
import AddWeightEntryForm from '@/components/AddWeightEntryForm';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';


export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [historyKey, setHistoryKey] = useState(0);
  const [weightChartKey, setWeightChartKey] = useState(0);
  const [isWeightDialogValid, setIsWeightDialogValidad] = useState(false);
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
    setCurrentFastingProgress(0); 
    setFastingGoalHours(undefined); 
  };

  const handleWeightAdded = () => {
    setWeightChartKey(prevKey => prevKey + 1);
    setIsWeightDialogValidad(false); // Close dialog
  };

  const handleBeberAgua = () => {
    alert("Lembrete: Mantenha-se hidratado!");
  };

  const handleMotivacao = () => {
    alert("Motivação do Dia: Você é capaz!");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-foreground">Seu Jejum Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <FastingTimer 
            onFastEnded={handleFastEnded} 
            onTimerUpdate={handleTimerUpdate} 
          />
        </CardContent>
      </Card>

      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-foreground">Progresso do Jejum</CardTitle>
          {fastingGoalHours !== undefined && currentFastingProgress >= 0 && ( // Show even if 0%
            <CardDescription className="text-muted-foreground">Meta: {fastingGoalHours} horas</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={currentFastingProgress} className="w-full h-3 [&>div]:bg-primary" />
          <p className="text-sm text-center text-muted-foreground">
            {currentFastingProgress > 0 ? `${currentFastingProgress.toFixed(0)}% completo` : (activeFastingGoal() ? 'Pronto para começar sua meta!' : 'Nenhum jejum ativo.')}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-headline text-foreground flex items-center">
              <TrendingUp className="mr-2 h-6 w-6 text-primary" /> Progresso de Emagrecimento
            </CardTitle>
            <CardDescription className="text-muted-foreground">Acompanhe sua jornada de perda de peso.</CardDescription>
          </div>
          <Dialog open={isWeightDialogValidad} onOpenChange={setIsWeightDialogValidad}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto border-primary text-primary hover:bg-primary/10">
                <PlusCircle className="mr-2 h-4 w-4" /> Registrar Peso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card">
              <DialogHeader>
                <DialogTitle className="font-headline text-foreground">Registrar Novo Peso</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Adicione sua medição de peso atual e a data.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <AddWeightEntryForm onWeightAdded={handleWeightAdded} onOpenChange={setIsWeightDialogValidad} />
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="min-h-[320px] flex flex-col items-center justify-center">
          {currentUser && <WeightProgressChart key={weightChartKey} />}
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

  function activeFastingGoal() {
    // This helper can be expanded if you have a way to know if a fast is active
    // For now, it just checks if goalHours is set.
    return fastingGoalHours !== undefined;
  }
}
