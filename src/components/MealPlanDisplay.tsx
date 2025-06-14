
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Utensils } from 'lucide-react';

export interface Meal {
  name: string; // "Café da manhã", "Almoço", "Jantar", "Lanche"
  description: string;
}

export interface DailyMealPlan {
  day: string; // "Dia 1", "Segunda-feira"
  meals: Meal[];
}

interface MealPlanDisplayProps {
  mealPlan: DailyMealPlan[] | null;
}

const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({ mealPlan }) => {
  if (!mealPlan || mealPlan.length === 0) {
    return (
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center text-primary">
            <Utensils className="mr-2 h-6 w-6" />
            Seu Cardápio Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhum cardápio gerado ainda. Defina suas preferências e clique em "Gerar Cardápio".</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center text-primary">
          <Utensils className="mr-2 h-6 w-6" />
          Seu Cardápio Semanal Sugerido
        </CardTitle>
        <CardDescription>Este é um exemplo. A geração com IA será implementada em breve.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Dia</TableHead>
              <TableHead className="w-[150px]">Refeição</TableHead>
              <TableHead>Cardápio Sugerido</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mealPlan.map((dailyPlan, index) => (
              <React.Fragment key={dailyPlan.day + index}>
                {dailyPlan.meals.map((meal, mealIndex) => (
                  <TableRow key={meal.name + mealIndex}>
                    {mealIndex === 0 && (
                      <TableCell rowSpan={dailyPlan.meals.length} className="font-medium align-top pt-3">
                        {dailyPlan.day}
                      </TableCell>
                    )}
                    <TableCell className="font-medium">{meal.name}</TableCell>
                    <TableCell>{meal.description}</TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MealPlanDisplay;

// Exemplo de dados estáticos para demonstração inicial
export const exampleStaticMealPlan: DailyMealPlan[] = [
  {
    day: "Dia 1 (Exemplo)",
    meals: [
      { name: "Café da manhã", description: "Omelete com espinafre e queijo, café preto." },
      { name: "Almoço", description: "Frango grelhado com legumes assados (brócolis, cenoura, abobrinha)." },
      { name: "Jantar", description: "Sopa de abóbora com gengibre e uma pequena salada de folhas verdes." },
    ],
  },
  {
    day: "Dia 2 (Exemplo)",
    meals: [
      { name: "Café da manhã", description: "Smoothie de abacate, morango, chia e leite de amêndoas." },
      { name: "Almoço", description: "Salmão assado com quinoa e aspargos." },
      { name: "Jantar", description: "Salada completa com atum, ovos cozidos, tomate, pepino e azeite." },
    ],
  },
  {
    day: "Dia 3 (Exemplo)",
    meals: [
      { name: "Café da manhã", description: "Iogurte grego natural com granola caseira sem açúcar e frutas vermelhas." },
      { name: "Almoço", description: "Lentilhas com arroz integral e salada colorida." },
      { name: "Jantar", description: "Abobrinha recheada com carne moída e queijo, assada no forno." },
    ],
  },
];
