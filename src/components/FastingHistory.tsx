
"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFastingHistory } from '@/actions/fastingActions';
import type { ClientFastingSession } from '@/actions/types'; // Use ClientFastingSession
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UtensilsCrossed, CheckCircle2, CalendarDays, Clock } from 'lucide-react';

const FastingHistory: React.FC = () => {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState<ClientFastingSession[]>([]); // Use ClientFastingSession
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      getFastingHistory(currentUser.uid, 7) // Get last 7 completed fasts
        .then(setHistory)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [currentUser]);

  const formatDuration = (minutes?: number) => {
    if (minutes === undefined || minutes === null) return 'N/A';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><CalendarDays className="mr-2 h-6 w-6 text-primary"/>Histórico Recente</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          Carregando histórico...
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><CalendarDays className="mr-2 h-6 w-6 text-primary"/>Histórico Recente</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <UtensilsCrossed className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
          Nenhum jejum completado ainda.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center"><CalendarDays className="mr-2 h-6 w-6 text-primary"/>Histórico Recente</CardTitle>
        <CardDescription>Seus últimos jejuns completados.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <ul className="space-y-4">
            {history.map(session => (
              <li key={session.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground">
                      {/* Convert ISO string to Date before formatting */}
                      {format(new Date(session.startTime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    {session.endTime && (
                       <p className="text-xs text-muted-foreground">
                        {/* Convert ISO string to Date before formatting */}
                        Finalizado em: {format(new Date(session.endTime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                   <Badge variant={session.actualDurationMinutes && session.goalDurationHours && session.actualDurationMinutes >= session.goalDurationHours * 60 ? "default" : "secondary"} className="bg-accent text-accent-foreground whitespace-nowrap">
                      {session.actualDurationMinutes && session.goalDurationHours && session.actualDurationMinutes >= session.goalDurationHours * 60 
                        ? <CheckCircle2 className="h-3 w-3 mr-1" /> 
                        : <Clock className="h-3 w-3 mr-1" /> } 
                      {formatDuration(session.actualDurationMinutes)}
                    </Badge>
                </div>
                {session.goalDurationHours && (
                  <p className="text-xs text-muted-foreground mt-1">Meta: {session.goalDurationHours}h</p>
                )}
                {session.notes && <p className="text-sm mt-2 italic">"{session.notes}"</p>}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default FastingHistory;
