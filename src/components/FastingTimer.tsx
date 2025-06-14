"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { startNewFast, endCurrentFast, getActiveFast, type ClientFastingSession } from '@/actions/fastingActions';
import { getUserProfile, type UserProfile } from '@/actions/userProfileActions';
import { PlayCircle, StopCircle, Hourglass, Loader2, Target } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const formatTime = (totalSeconds: number): string => {
  if (totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

interface FastingTimerProps {
  onFastEnded?: () => void;
}

const FastingTimer: React.FC<FastingTimerProps> = ({ onFastEnded }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [activeFast, setActiveFast] = useState<ClientFastingSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [customGoalHours, setCustomGoalHours] = useState<number | undefined>(undefined);

  const fetchProfileAndActiveFast = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const profile = await getUserProfile(currentUser.uid);
      setUserProfile(profile);
      setCustomGoalHours(profile?.fastingGoalHours || 16);

      const currentFast = await getActiveFast(currentUser.uid);
      setActiveFast(currentFast);
      if (currentFast) {
        const now = new Date();
        const start = new Date(currentFast.startTime);
        setElapsedSeconds(Math.floor((now.getTime() - start.getTime()) / 1000));
      } else {
        setElapsedSeconds(0);
      }
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível carregar dados do jejum.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    fetchProfileAndActiveFast();
  }, [fetchProfileAndActiveFast]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeFast) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeFast]);

  const handleStartFast = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    const goal = customGoalHours || userProfile?.fastingGoalHours || 16;
    try {
      await startNewFast(currentUser.uid, goal);
      toast({ title: "Jejum Iniciado!", description: `Meta: ${goal} horas. Bom jejum!`, variant: "default" });
      setShowStartDialog(false); 
      await fetchProfileAndActiveFast(); 
    } catch (error) {
      toast({ title: "Erro ao Iniciar Jejum", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndFast = async () => {
    if (!currentUser || !activeFast || !activeFast.id) return;
    setIsLoading(true);
    try {
      await endCurrentFast(activeFast.id);
      toast({ title: "Jejum Finalizado!", description: "Parabéns por completar seu jejum!", className: "bg-success text-success-foreground" });
      await fetchProfileAndActiveFast(); 
      if (onFastEnded) {
        onFastEnded(); 
      }
    } catch (error) {
      toast({ title: "Erro ao Finalizar Jejum", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const goalSeconds = activeFast?.goalDurationHours ? activeFast.goalDurationHours * 3600 : (userProfile?.fastingGoalHours || 16) * 3600;
  const progressPercentage = goalSeconds > 0 ? Math.min((elapsedSeconds / goalSeconds) * 100, 100) : 0;
  const remainingSeconds = activeFast ? Math.max(0, goalSeconds - elapsedSeconds) : 0;

  if (isLoading && !activeFast && !userProfile) { 
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg bg-card">
        <CardHeader><CardTitle className="text-center font-headline text-xl text-foreground">Temporizador de Jejum</CardTitle></CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg text-center bg-card">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-foreground flex items-center justify-center">
          <Hourglass className="mr-2 h-7 w-7 text-primary" />
          {activeFast ? "Em Jejum" : "Pronto para Começar?"}
        </CardTitle>
        {activeFast && activeFast.goalDurationHours && (
          <CardDescription className="flex items-center justify-center text-muted-foreground">
            <Target className="mr-1 h-4 w-4" /> Meta: {activeFast.goalDurationHours} horas
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-5xl font-bold font-mono text-primary" suppressHydrationWarning>
          {formatTime(elapsedSeconds)}
        </div>
        {activeFast && (
          <>
            <Progress value={progressPercentage} className="w-full h-3 [&>div]:bg-primary" />
            <p className="text-sm text-muted-foreground" suppressHydrationWarning>
              {progressPercentage < 100 ? `Faltam: ${formatTime(remainingSeconds)} para sua meta.` : "Meta atingida! Você pode continuar se desejar."}
            </p>
          </>
        )}
        {!activeFast && userProfile?.fastingGoalHours && (
           <p className="text-muted-foreground">Sua meta padrão é de {userProfile.fastingGoalHours} horas.</p>
        )}
      </CardContent>
      <CardFooter>
        {activeFast ? (
          <Button onClick={handleEndFast} className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <StopCircle className="mr-2 h-5 w-5" />}
            Finalizar Jejum
          </Button>
        ) : (
          <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
            <DialogTrigger asChild>
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                <PlayCircle className="mr-2 h-5 w-5" />
                Iniciar Jejum
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card">
              <DialogHeader>
                <DialogTitle className="font-headline text-foreground">Iniciar Novo Jejum</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Defina uma meta para este jejum ou use sua meta padrão de {userProfile?.fastingGoalHours || 16} horas.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="goalHours" className="text-right col-span-1 text-foreground">
                    Meta (horas)
                  </Label>
                  <Input
                    id="goalHours"
                    type="number"
                    value={customGoalHours === undefined ? '' : customGoalHours}
                    onChange={(e) => setCustomGoalHours(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="col-span-3"
                    placeholder={`Padrão: ${userProfile?.fastingGoalHours || 16}`}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowStartDialog(false)}>Cancelar</Button>
                <Button type="button" onClick={handleStartFast} className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Confirmar Início
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
};

export default FastingTimer;
