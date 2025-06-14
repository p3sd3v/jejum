
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFastingHistory, type ClientFastingSession } from '@/actions/fastingActions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, TrendingUp, Target, Award, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { differenceInDays, parseISO } from 'date-fns';

interface ScoreData {
  totalScore: number;
  frequencyLabel: string;
  fastsLast7Days: number;
  fastsLast30Days: number;
  consistencyPercentage: number | null;
}

const calculateScoreData = (history: ClientFastingSession[]): ScoreData => {
  const now = new Date();
  const last7DaysFasts = history.filter(session => {
    if (!session.endTime) return false;
    return differenceInDays(now, parseISO(session.endTime)) < 7;
  });
  const last30DaysFasts = history.filter(session => {
    if (!session.endTime) return false;
    return differenceInDays(now, parseISO(session.endTime)) < 30;
  });

  // Frequency Score (1-5 points)
  let frequencyScore = 1;
  if (last30DaysFasts.length >= 20) frequencyScore = 5;
  else if (last30DaysFasts.length >= 15) frequencyScore = 4;
  else if (last30DaysFasts.length >= 10) frequencyScore = 3;
  else if (last30DaysFasts.length >= 5) frequencyScore = 2;

  // Consistency Score (1-5 points)
  let consistencyScore = 1;
  const fastsWithGoals = last30DaysFasts.filter(s => s.goalDurationHours && s.goalDurationHours > 0 && s.actualDurationMinutes);
  let metGoalCount = 0;
  if (fastsWithGoals.length > 0) {
    fastsWithGoals.forEach(s => {
      if (s.actualDurationMinutes! >= s.goalDurationHours! * 60) {
        metGoalCount++;
      }
    });
    const consistencyRatio = metGoalCount / fastsWithGoals.length;
    if (consistencyRatio >= 0.95) consistencyScore = 5;
    else if (consistencyRatio >= 0.8) consistencyScore = 4;
    else if (consistencyRatio >= 0.6) consistencyScore = 3;
    else if (consistencyRatio >= 0.4) consistencyScore = 2;
  } else if (last30DaysFasts.length > 0) {
    // If there are fasts but no goals set, give a neutral score
    consistencyScore = 2; 
  }


  const totalScore = Math.max(1, Math.min(10, frequencyScore + consistencyScore)); // Ensure score is between 1 and 10

  let frequencyLabel = "Frequência Baixa";
  if (last7DaysFasts.length >= 6) frequencyLabel = "Frequência Excelente";
  else if (last7DaysFasts.length >= 4) frequencyLabel = "Frequência Alta";
  else if (last7DaysFasts.length >= 2) frequencyLabel = "Frequência Média";
  
  const consistencyPercentage = fastsWithGoals.length > 0 ? (metGoalCount / fastsWithGoals.length) * 100 : null;


  return {
    totalScore,
    frequencyLabel,
    fastsLast7Days: last7DaysFasts.length,
    fastsLast30Days: last30DaysFasts.length,
    consistencyPercentage,
  };
};

const FastingScoreCard: React.FC = () => {
  const { currentUser } = useAuth();
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      getFastingHistory(currentUser.uid, 30) // Fetch last 30 days for calculations
        .then(history => {
          setScoreData(calculateScoreData(history));
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <Card className="shadow-lg bg-card">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center text-primary">
            <Award className="mr-2 h-6 w-6" />
            Pontuação de Jejum
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground h-40 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Calculando sua pontuação...</span>
        </CardContent>
      </Card>
    );
  }

  if (!scoreData || scoreData.fastsLast30Days === 0) {
    return (
      <Card className="shadow-lg bg-card">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center text-primary">
            <Award className="mr-2 h-6 w-6" />
            Pontuação de Jejum
          </CardTitle>
          <CardDescription>Complete alguns jejuns para ver sua pontuação.</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground h-40 flex items-center justify-center">
          <Zap className="h-10 w-10 text-muted-foreground/50" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg bg-card">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center text-primary">
          <Award className="mr-2 h-6 w-6" />
          Sua Pontuação de Jejum
        </CardTitle>
        <CardDescription>Com base na sua frequência e consistência nos últimos 30 dias.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-6xl font-bold text-accent">{scoreData.totalScore}<span className="text-3xl text-muted-foreground">/10</span></p>
          <p className="text-lg font-medium text-primary mt-1">{scoreData.frequencyLabel}</p>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Jejuns (Últimos 7 dias)</span>
              <span className="font-medium text-foreground">{scoreData.fastsLast7Days}</span>
            </div>
            <Progress value={(scoreData.fastsLast7Days / 7) * 100} className="h-2 [&>div]:bg-primary" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Jejuns (Últimos 30 dias)</span>
              <span className="font-medium text-foreground">{scoreData.fastsLast30Days}</span>
            </div>
             <Progress value={(scoreData.fastsLast30Days / 20) * 100} className="h-2 [&>div]:bg-primary" /> 
             {/* Max 20 fasts for 100% on this bar for visual appeal, actual score uses different logic */}
          </div>
          {scoreData.consistencyPercentage !== null && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Consistência (Metas Atingidas)</span>
                <span className="font-medium text-foreground">{scoreData.consistencyPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={scoreData.consistencyPercentage} className="h-2 [&>div]:bg-accent" />
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground text-center pt-2">
            Continue jejuando e registrando para melhorar sua pontuação!
        </p>
      </CardContent>
    </Card>
  );
};

export default FastingScoreCard;
