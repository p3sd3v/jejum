
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import FastingTimer from '@/components/FastingTimer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import WeightProgressChart from '@/components/WeightProgressChart';
import AddWeightEntryForm from '@/components/AddWeightEntryForm';
import { useAuth } from '@/contexts/AuthContext';
import { getLatestWeightEntry, type ClientWeightEntry } from '@/actions/weightActions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [historyKey, setHistoryKey] = useState(0); // To refresh FastingHistory, if we add it back
  const [weightChartKey, setWeightChartKey] = useState(0);
  const [latestWeight, setLatestWeight] = useState<ClientWeightEntry | null>(null);
  const [isLoadingLatestWeight, setIsLoadingLatestWeight] = useState(true);

  const fetchLatestWeight = useCallback(async () => {
    if (currentUser?.uid) {
      setIsLoadingLatestWeight(true);
      try {
        const weight = await getLatestWeightEntry(currentUser.uid);
        setLatestWeight(weight);
      } catch (error) {
        console.error("Failed to fetch latest weight", error);
        setLatestWeight(null);
      } finally {
        setIsLoadingLatestWeight(false);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    fetchLatestWeight();
  }, [fetchLatestWeight]);

  const handleFastingStateChanged = () => {
    // This function can be used to refresh any data related to fasting if needed
    // For example, if FastingHistory component is on this page:
    setHistoryKey(prevKey => prevKey + 1);
    // Potentially refresh other fasting related data
  };

  const handleWeightAdded = () => {
    setWeightChartKey(prevKey => prevKey + 1); // Refreshes the chart
    fetchLatestWeight(); // Refreshes the "latest weight" display
  };

  return (
    <div className="space-y-6 md:space-y-8 py-6">
      <Card className="bg-card shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline text-foreground">Cronômetro do Jejum</CardTitle>
          {/* Description can be dynamic based on fasting state */}
        </CardHeader>
        <CardContent>
          <FastingTimer 
            onFastStateChanged={handleFastingStateChanged}
          />
        </CardContent>
      </Card>

      <Card className="bg-card shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-foreground">Registre seu Peso de Hoje</CardTitle>
          {isLoadingLatestWeight ? (
            <div className="text-sm text-muted-foreground flex items-center mt-1">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Carregando último peso...
            </div>
          ) : latestWeight ? (
            <CardDescription className="text-muted-foreground mt-1">
              Último registro: {latestWeight.weight}{latestWeight.unit || 'kg'} em {format(new Date(latestWeight.date), "dd/MM/yyyy", { locale: ptBR })}.
            </CardDescription>
          ) : (
            <CardDescription className="text-muted-foreground mt-1">
              Nenhum peso registrado ainda.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <AddWeightEntryForm onWeightAdded={handleWeightAdded} />
        </CardContent>
      </Card>

      <Card className="bg-card shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-foreground">Progresso de Emagrecimento</CardTitle>
          <CardDescription className="text-muted-foreground">Acompanhe sua jornada de perda de peso.</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px] p-0 pt-2 sm:h-[320px] sm:p-2 sm:pt-2">
          {currentUser && <WeightProgressChart key={weightChartKey} />}
          {!currentUser && <p className="text-muted-foreground p-4">Carregando dados do usuário...</p>}
        </CardContent>
      </Card>
      
      <div className="text-xs text-muted-foreground p-4 text-center border-t border-border mt-8">
        <p>Lembretes e notificações (como iniciar jejum, registrar peso, terminar jejum) seriam gerenciados via Firebase Cloud Messaging (requer configuração de backend e Firebase Functions).</p>
      </div>
    </div>
  );
}

    