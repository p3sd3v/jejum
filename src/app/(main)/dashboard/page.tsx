
"use client"; // Add this directive for useState and event handlers

import React, { useState } from 'react'; // Import useState
import FastingTimer from '@/components/FastingTimer';
import FastingHistory from '@/components/FastingHistory';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  const [historyKey, setHistoryKey] = useState(0); // State to trigger history refresh

  const handleFastEnded = () => {
    setHistoryKey(prevKey => prevKey + 1); // Increment key to re-render FastingHistory
  };

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">Seu Painel JejumZen</h1>
        <p className="text-muted-foreground mt-2">Acompanhe seu progresso e mantenha o foco!</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <FastingTimer onFastEnded={handleFastEnded} /> {/* Pass callback */}
        </div>
        <div className="lg:col-span-2">
         <FastingHistory key={historyKey} /> {/* Pass key to force re-render */}
        </div>
      </div>

      {/* Placeholder for future charts or additional stats */}
      {/* <Separator className="my-12" />
      <div className="space-y-6">
        <h2 className="text-2xl font-headline text-center text-primary">Estatísticas Semanais (Em Breve)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Progresso Semanal</CardTitle></CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
              Gráfico de progresso aqui
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Consistência</CardTitle></CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
              Gráfico de consistência aqui
            </CardContent>
          </Card>
        </div>
      </div> */}

    </div>
  );
}
