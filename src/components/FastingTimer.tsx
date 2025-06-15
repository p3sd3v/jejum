
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { startNewFast, endCurrentFast, getActiveFast } from '@/actions/fastingActions';
import type { ClientFastingSession } from '@/actions/types'; // Corrected import path
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
  onFastStateChanged?: () => void; // Called when a fast starts or ends
}

const FastingTimer: React.FC<FastingTimerProps> = ({ onFastStateChanged }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [activeFast, setActiveFast] = useState<ClientFastingSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [customGoalHours, setCustomGoalHours] = useState<number | undefined>(undefined);

  const fetchProfileAndActiveFast = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false); 
      return;
    }
    setIsLoading(true);
    try {
      const profile = await getUserProfile(currentUser.uid);
      setUserProfile(profile);
      const defaultGoal = profile?.fastingGoalHours || 16; // Default to 16 if not set
      setCustomGoalHours(defaultGoal); // Pre-fill dialog with default or saved goal

      const currentFast = await getActiveFast(currentUser.uid);
      setActiveFast(currentFast);

      if (currentFast) {
        const now = new Date();
        const start = new Date(currentFast.startTime);
        const currentElapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
        setElapsedSeconds(currentElapsed);
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
    const goalToSet = customGoalHours || userProfile?.fastingGoalHours || 16;
    try {
      await startNewFast(currentUser.uid, goalToSet);
      toast({ title: "Jejum Iniciado!", description: `Meta: ${goalToSet} horas. Bom jejum!`, variant: "default" });
      setShowStartDialog(false);
      await fetchProfileAndActiveFast(); 
      if (onFastStateChanged) {
        onFastStateChanged();
      }
      // Consider a toast reminder to register weight if not done for the day
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
      if (onFastStateChanged) {
        onFastStateChanged();
      }
      // After ending fast, could prompt user to register weight.
      // For now, assume they use the dedicated section on dashboard.
      // toast({ title: "Jejum Encerrado", description: "Não se esqueça de registrar seu peso, se ainda não o fez."})
    } catch (error) {
      toast({ title: "Erro ao Finalizar Jejum", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const displayGoalHours = activeFast?.goalDurationHours || userProfile?.fastingGoalHours || 16;
  const goalSeconds = displayGoalHours * 3600;
  const progressPercentage = goalSeconds > 0 ? Math.min((elapsedSeconds / goalSeconds) * 100, 100) : 0;
  const remainingSeconds = activeFast ? Math.max(0, goalSeconds - elapsedSeconds) : 0;

  if (isLoading && !activeFast && !userProfile) { // Show loader only on initial full load
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="mb-4">
        <div className="text-5xl md:text-6xl font-bold font-mono text-primary" suppressHydrationWarning>
          {formatTime(elapsedSeconds)}
        </div>
        {activeFast && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground flex items-center justify-center">
                <Target className="mr-1 h-4 w-4 text-primary" /> Meta: {displayGoalHours} horas
            </p>
            <p className="text-xs text-muted-foreground mt-1" suppressHydrationWarning>
              {progressPercentage < 100 ? `Faltam: ${formatTime(remainingSeconds)} para sua meta.` : "Meta atingida! Você pode continuar se desejar."}
            </p>
          </div>
        )}
         {!activeFast && (
           <p className="text-muted-foreground mt-2 text-sm">
             {userProfile?.fastingGoalHours 
               ? `Sua meta padrão é de ${userProfile.fastingGoalHours} horas.` 
               : "Defina uma meta no seu perfil ou ao iniciar."}
           </p>
        )}
      </div>
      
      <div>
        {activeFast ? (
          <Button onClick={handleEndFast} className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground text-lg py-6" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <StopCircle className="mr-2 h-6 w-6" />}
            Finalizar Jejum
          </Button>
        ) : (
          <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
            <DialogTrigger asChild>
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6" disabled={isLoading || !currentUser}>
                <PlayCircle className="mr-2 h-6 w-6" />
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
                    min="1"
                    value={customGoalHours === undefined ? '' : String(customGoalHours)}
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
      </div>
    </div>
  );
};

export default FastingTimer;
