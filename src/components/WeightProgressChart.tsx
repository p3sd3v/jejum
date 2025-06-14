
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
import { format, startOfWeek, startOfMonth, endOfWeek, endOfMonth, eachWeekOfInterval, eachMonthOfInterval, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

type TimeView = 'day' | 'week' | 'month';

const chartConfig = {
  weight: {
    label: "Peso",
    color: "hsl(var(--primary))", // Using primary color for the bar
  },
} satisfies ChartConfig;

interface FormattedData {
  date: string; // Formatted date for XAxis
  weight: number;
  originalDate: Date; // For sorting and tooltips
}

const WeightProgressChart: React.FC = () => {
  const { currentUser } = useAuth();
  const [timeView, setTimeView] = useState<TimeView>('month');
  const [rawData, setRawData] = useState<ClientWeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.uid) {
      setIsLoading(true);
      getWeightHistory(currentUser.uid, 180) // Fetch more data for better aggregation
        .then(data => {
          setRawData(data);
        })
        .catch(err => {
          console.error("Failed to fetch weight history:", err);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false); // Not logged in, or user not yet available
    }
  }, [currentUser]);

  const aggregatedChartData = useMemo((): FormattedData[] => {
    if (rawData.length === 0) return [];

    const entriesWithDates = rawData.map(e => ({ ...e, dateObj: parseISO(e.date) }));

    if (timeView === 'day') {
      return entriesWithDates
        .slice(-15) // Show last 15 entries for 'day' view
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
      return aggregate(date => startOfWeek(date, { locale: ptBR }), "dd/MM", 12); // Last 12 weeks
    } else { // month
      return aggregate(startOfMonth, "MMM/yy", 12); // Last 12 months
    }
  }, [rawData, timeView]);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Carregando gráfico de peso...</p>
      </div>
    );
  }
  
  if (!currentUser) {
     return (
        <div className="h-60 flex flex-col items-center justify-center text-muted-foreground">
          <p>Faça login para ver seu progresso de peso.</p>
        </div>
      );
  }


  return (
    <div className="space-y-3">
      <div className="flex justify-center space-x-2 pt-2">
        {(['day', 'week', 'month'] as TimeView[]).map(view => (
          <Button
            key={view}
            variant={timeView === view ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeView(view)}
            className={timeView === view ? 'bg-primary text-primary-foreground' : 'border-primary text-primary hover:bg-primary/10'}
          >
            {view === 'day' ? 'Dia' : view === 'week' ? 'Semana' : 'Mês'}
          </Button>
        ))}
      </div>
      {aggregatedChartData.length > 0 ? (
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full h-64">
          <BarChart 
            accessibilityLayer 
            data={aggregatedChartData} 
            margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
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
                       formattedLabel = `Semana de ${format(startOfWeek(originalDate, { locale: ptBR }), 'dd/MM', { locale: ptBR })}`;
                    } else if (timeView === 'month') {
                       formattedLabel = format(originalDate, 'MMMM yyyy', { locale: ptBR });
                    }
                    return <div className="text-sm">{formattedLabel}</div>;
                  }
                  return label;
                }}
              />}
            />
            <Bar dataKey="weight" fill="var(--color-weight)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      ) : (
        <div className="h-56 flex flex-col items-center justify-center text-muted-foreground">
          <p>Nenhum dado de peso registrado ainda.</p>
          <p className="text-sm">Adicione seu peso para ver o progresso.</p>
           {/* You might want to add a button/link here to navigate to a weight entry page/modal */}
        </div>
      )}
    </div>
  );
};

export default WeightProgressChart;
