
// src/components/ChallengesDisplay.tsx
"use client";

import React, { useEffect, useState }
from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFastingHistory } from '@/actions/fastingActions';
import type { ClientFastingSession } from '@/actions/types'; // Corrected import path
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, CheckCircle2, XCircle, Zap, ShieldCheck, CalendarClock } from 'lucide-react';
import { format, subDays, isSameDay, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChallengeDay {
  dayLabel: string;
  relativeDayIndex: number; // 0 for today, 1 for yesterday, etc.
  goalHours: number;
  points: number;
  description?: string; // Optional: "Iniciar jejum às X e terminar às Y."
}

interface ProcessedChallengeDay extends ChallengeDay {
  targetDate: Date;
  isCompleted: boolean;
  pointsEarned: number;
  fastDurationMet?: number; // in minutes
}

const STATIC_CHALLENGE_DEFINITION: ChallengeDay[] = [
  { dayLabel: "Dia 1", relativeDayIndex: 6, goalHours: 12, points: 10, description: "Jejum de 12h" },
  { dayLabel: "Dia 2", relativeDayIndex: 5, goalHours: 12, points: 10, description: "Jejum de 12h" },
  { dayLabel: "Dia 3", relativeDayIndex: 4, goalHours: 14, points: 10, description: "Jejum de 14h" },
  { dayLabel: "Dia 4", relativeDayIndex: 3, goalHours: 14, points: 10, description: "Jejum de 14h" },
  { dayLabel: "Dia 5", relativeDayIndex: 2, goalHours: 16, points: 10, description: "Jejum de 16h" },
  { dayLabel: "Dia 6", relativeDayIndex: 1, goalHours: 16, points: 10, description: "Jejum de 16h" },
  { dayLabel: "Dia 7", relativeDayIndex: 0, goalHours: 16, points: 10, description: "Jejum de 16h (Hoje)" },
];

const BONUS_POINTS_7_CONSECUTIVE = 50;

const ChallengesDisplay: React.FC = () => {
  const { currentUser } = useAuth();
  const [processedChallenges, setProcessedChallenges] = useState<ProcessedChallengeDay[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sevenDayBonusAwarded, setSevenDayBonusAwarded] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      // Fetch more history if needed, e.g., last 7-10 days to be safe for timezone issues or if a fast started day before.
      // For simplicity, 7 days is fine if fasts are generally completed on the same day they start.
      getFastingHistory(currentUser.uid, 7) 
        .then(fastingHistory => {
          const today = startOfDay(new Date());
          let currentPoints = 0;
          let completedCount = 0;

          const challenges: ProcessedChallengeDay[] = STATIC_CHALLENGE_DEFINITION.map(challengeDef => {
            const targetDate = subDays(today, challengeDef.relativeDayIndex);
            let isCompleted = false;
            let pointsEarnedToday = 0;
            let fastDurationMet = undefined;

            // Find a fast completed on this targetDate that meets the goal
            const completedFastOnDate = fastingHistory.find(fast => 
              fast.status === 'completed' && 
              fast.endTime && 
              isSameDay(startOfDay(new Date(fast.endTime)), targetDate) &&
              fast.actualDurationMinutes && 
              fast.actualDurationMinutes >= challengeDef.goalHours * 60
            );

            if (completedFastOnDate) {
              isCompleted = true;
              pointsEarnedToday = challengeDef.points;
              currentPoints += pointsEarnedToday;
              completedCount++;
              fastDurationMet = completedFastOnDate.actualDurationMinutes;
            }
            
            return {
              ...challengeDef,
              targetDate,
              isCompleted,
              pointsEarned: pointsEarnedToday,
              fastDurationMet,
            };
          });
          
          let bonusAwarded = false;
          if (completedCount === 7) {
            currentPoints += BONUS_POINTS_7_CONSECUTIVE;
            bonusAwarded = true;
          }
          
          setSevenDayBonusAwarded(bonusAwarded);
          setProcessedChallenges(challenges.sort((a,b) => a.relativeDayIndex > b.relativeDayIndex ? -1 : 1)); // Sort so Dia 1 is first
          setTotalPoints(currentPoints);
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
            <CalendarClock className="mr-2 h-6 w-6" />
            Desafios da Semana
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground h-60 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando desafios...</span>
        </CardContent>
      </Card>
    );
  }
  
  if (!currentUser) {
     return (
        <Card className="shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center text-primary">
              <CalendarClock className="mr-2 h-6 w-6" />
              Desafios da Semana
            </CardTitle>
            <CardDescription>Faça login para participar dos desafios.</CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground h-60 flex items-center justify-center">
             <Zap className="h-10 w-10 text-muted-foreground/50" />
          </CardContent>
        </Card>
      );
  }

  return (
    <Card className="shadow-xl bg-card">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center text-primary">
          <ShieldCheck className="mr-3 h-7 w-7" />
          Seu Progresso nos Desafios (Últimos 7 Dias)
        </CardTitle>
        <CardDescription>
          Complete as metas diárias de jejum para ganhar pontos. As metas são baseadas nos últimos 7 dias corridos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {processedChallenges.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Dia</TableHead>
                <TableHead>Meta de Jejum</TableHead>
                <TableHead className="text-center">Pontos Ganhos</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedChallenges.map((challenge) => (
                <TableRow key={challenge.dayLabel} className={challenge.isCompleted ? 'bg-primary/10' : ''}>
                  <TableCell className="font-medium">{challenge.dayLabel}</TableCell>
                  <TableCell>{challenge.goalHours} horas</TableCell>
                  <TableCell className="text-center">{challenge.isCompleted ? challenge.points : 0}</TableCell>
                  <TableCell className="text-center">
                    {challenge.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-success inline-block" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive inline-block opacity-50" />
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-right text-muted-foreground text-xs">
                    {format(challenge.targetDate, "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
           <div className="text-center text-muted-foreground py-8">
            <Zap className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
            Nenhum dado de desafio para exibir. Comece a registrar seus jejuns!
          </div>
        )}

        <div className="mt-6 text-right">
          {sevenDayBonusAwarded && (
            <p className="text-lg font-semibold text-accent">
              🎉 Bônus de 7 Dias Consecutivos: +{BONUS_POINTS_7_CONSECUTIVE} pontos! 🎉
            </p>
          )}
          <p className="text-2xl font-bold font-headline text-primary">
            Total de Pontos (Últimos 7 Dias): {totalPoints}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengesDisplay;
