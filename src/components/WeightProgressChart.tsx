
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip as ShadcnChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from '@/components/ui/button';
import { getWeightHistory, type ClientWeightEntry } from '@/actions/weightActions';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfWeek, startOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

type TimeView = 'day' | 'week' | 'month';

const chartConfig = {
  weight: {
    label: "Peso",
    color: "hsl(var(--primary))", 
  },
} satisfies ChartConfig;

interface FormattedData {
  date: string; 
  weight: number;
  originalDate: Date; 
}

const WeightProgressChart: React.FC = () => {
  const { currentUser } = useAuth();
  const [timeView, setTimeView] = useState<TimeView>('month');
  const [rawData, setRawData] = useState<ClientWeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.uid) {
      setIsLoading(true);
      getWeightHistory(currentUser.uid, 180) 
        .then(data => {
          setRawData(data);
        })
        .catch(err => {
          console.error("Failed to fetch weight history:", err);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false); 
    }
  }, [currentUser]);

  const aggregatedChartData = useMemo((): FormattedData[] => {
    if (rawData.length === 0) return [];

    const entriesWithDates = rawData.map(e => ({ ...e, dateObj: parseISO(e.date) }));

    if (timeView === 'day') {
      return entriesWithDates
        .slice(-15) 
        .map(entry => ({
          date: format(entry.dateObj, 'dd/MM', { locale: ptBR }),
          weight: entry.weight,
          originalDate: entry.dateObj,
        })).sort((a,b) => a.originalDate.getTime() - b.originalDate.getTime());
    }

    const aggregate = (
      intervalFn: (date: Date) => Date,
      dateFormat: string,
      numIntervals: number
    ) => {
      const aggregated: { [key: string]: { totalWeight: number; count: number; date: Date } } = {};
      entriesWithDates.forEach(entry => {
        const intervalStart = intervalFn(entry.dateObj);
        const key = format(intervalStart, 'yyyy-MM-dd');
        if (!aggregated[key]) {
          aggregated[key] = { totalWeight: 0, count: 0, date: intervalStart };
        }
        aggregated[key].totalWeight += entry.weight;
        aggregated[key].count += 1;
      });
      return Object.values(aggregated)
        .map(data => ({
          date: format(data.date, dateFormat, { locale: ptBR }),
          weight: parseFloat((data.totalWeight / data.count).toFixed(2)),
          originalDate: data.date,
        }))
        .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime())
        .slice(-numIntervals);
    };

    if (timeView === 'week') {
      return aggregate(date => startOfWeek(date, { locale: ptBR }), "dd/MM", 12); 
    } else { // month
      return aggregate(startOfMonth, "MMM/yy", 12); 
    }
  }, [rawData, timeView]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Carregando gráfico...</p>
      </div>
    );
  }
  
  if (!currentUser) {
     return (
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
          <p>Faça login para ver seu progresso.</p>
        </div>
      );
  }


  return (
    <div className="space-y-2 h-full flex flex-col">
      <div className="flex justify-center space-x-1 sm:space-x-2 pt-1">
        {(['day', 'week', 'month'] as TimeView[]).map(view => (
          <Button
            key={view}
            variant={timeView === view ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeView(view)}
            className={`text-xs px-2 sm:px-3 ${timeView === view ? 'bg-primary text-primary-foreground' : 'border-primary text-primary hover:bg-primary/10'}`}
          >
            {view === 'day' ? 'Dia' : view === 'week' ? 'Semana' : 'Mês'}
          </Button>
        ))}
      </div>
      {aggregatedChartData.length > 0 ? (
        <ChartContainer config={chartConfig} className="h-full w-full flex-1">
          <BarChart 
            accessibilityLayer 
            data={aggregatedChartData} 
            margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              fontSize={10}
              interval={"preserveStartEnd"}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              fontSize={10}
              width={25}
              domain={['dataMin - 2', 'dataMax + 2']}
              tickFormatter={(value) => `${value.toFixed(0)}`} 
            />
            <ShadcnChartTooltip
              cursor={true}
              content={<ChartTooltipContent 
                indicator="dot" 
                labelFormatter={(label, payload) => {
                  if (payload && payload.length > 0 && payload[0].payload.originalDate) {
                    const originalDate = payload[0].payload.originalDate;
                    let formattedLabel = format(originalDate, 'dd/MM/yyyy', { locale: ptBR });
                    if (timeView === 'week') {
                       formattedLabel = `Sem. ${format(startOfWeek(originalDate, { locale: ptBR }), 'dd/MM', { locale: ptBR })}`;
                    } else if (timeView === 'month') {
                       formattedLabel = format(originalDate, 'MMM yyyy', { locale: ptBR });
                    } else if (timeView === 'day') {
                        formattedLabel = format(originalDate, 'dd/MM/yy', { locale: ptBR });
                    }
                    return <div className="text-xs">{formattedLabel}</div>;
                  }
                  return label;
                }}
              />}
            />
            <Bar dataKey="weight" fill="var(--color-weight)" radius={[3, 3, 0, 0]} barSize={20} />
          </BarChart>
        </ChartContainer>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <p className="text-sm">Nenhum dado de peso registrado.</p>
          <p className="text-xs mt-1">Adicione seu peso para ver o progresso.</p>
        </div>
      )}
    </div>
  );
};

export default WeightProgressChart;

