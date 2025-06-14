
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Utensils, Salad, Soup, Coffee, ChefHat } from 'lucide-react'; // Example icons
// Ensure DailyMealPlan type is imported or defined if not implicitly available
// For this case, it will be imported from mealPlanActions or generate-meal-plan-flow
// For now, let's assume it's available from props or a shared type definition.
// If generate-meal-plan-flow.ts exports DailyMealPlan, it can be used here.
import type { DailyMealPlan } from '@/ai/flows/generate-meal-plan-flow';


interface MealPlanDisplayProps {
  mealPlan: DailyMealPlan[] | null; // Make sure this type matches the AI output structure
}

const getMealIcon = (mealName: string) => {
  const lowerMealName = mealName.toLowerCase();
  if (lowerMealName.includes('café') || lowerMealName.includes('pequeno-almoço') || lowerMealName.includes('breakfast')) {
    return <Coffee className="h-5 w-5 mr-2 text-primary" />;
  }
  if (lowerMealName.includes('almoço') || lowerMealName.includes('lunch')) {
    return <Salad className="h-5 w-5 mr-2 text-primary" />;
  }
  if (lowerMealName.includes('jantar') || lowerMealName.includes('dinner') || lowerMealName.includes('ceia')) {
    return <Soup className="h-5 w-5 mr-2 text-primary" />;
  }
   if (lowerMealName.includes('lanche') || lowerMealName.includes('snack')) {
    return <ChefHat className="h-5 w-5 mr-2 text-primary" />;
  }
  return <Utensils className="h-5 w-5 mr-2 text-primary" />;
};

const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({ mealPlan }) => {
  if (!mealPlan || mealPlan.length === 0) {
    // This case should ideally be handled by the parent component
    // (e.g., showing a message like "Nenhum cardápio gerado ainda" or "IA não retornou resultados")
    // However, if it's called with null/empty, we can provide a fallback.
    return (
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center text-primary">
            <Utensils className="mr-2 h-6 w-6" />
            Seu Cardápio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Nenhum cardápio para exibir. Tente gerar um novo cardápio usando suas preferências.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 shadow-xl bg-card">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center text-primary">
          <Utensils className="mr-3 h-7 w-7" />
          Seu Cardápio Sugerido pela IA
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Este cardápio foi gerado com base nas suas preferências.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full" defaultValue={mealPlan[0]?.day}>
          {mealPlan.map((dailyPlan, index) => (
            <AccordionItem value={dailyPlan.day} key={dailyPlan.day + index} className="border-b border-border last:border-b-0">
              <AccordionTrigger className="text-lg font-semibold font-headline text-foreground hover:no-underline py-4">
                {dailyPlan.day}
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4 space-y-4">
                {dailyPlan.meals.map((meal, mealIndex) => (
                  <div key={meal.name + mealIndex} className="p-4 bg-background rounded-md shadow">
                    <h4 className="text-md font-semibold font-headline flex items-center text-primary mb-1">
                      {getMealIcon(meal.name)}
                      {meal.name}
                    </h4>
                    <p className="text-sm text-foreground/90 whitespace-pre-line">{meal.description}</p>
                  </div>
                ))}
                {dailyPlan.meals.length === 0 && (
                  <p className="text-sm text-muted-foreground p-4">Nenhuma refeição sugerida para este dia.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default MealPlanDisplay;

// O exampleStaticMealPlan pode ser removido ou mantido para testes, mas não será mais usado pela lógica principal.
export const exampleStaticMealPlan: DailyMealPlan[] = [
  {
    day: "Dia 1 (Exemplo Estático)",
    meals: [
      { name: "Café da manhã", description: "Omelete com espinafre e queijo (2 ovos, 1 xícara de espinafre, 30g de queijo), café preto ou chá sem açúcar." },
      { name: "Almoço", description: "120g de frango grelhado, 1 xícara de legumes assados (brócolis, cenoura, abobrinha) temperados com azeite e ervas." },
      { name: "Jantar", description: "Sopa de abóbora com gengibre (2 xícaras), acompanhada de uma pequena salada de folhas verdes com tomate cereja e pepino." },
    ],
  },
  // ... outros dias de exemplo podem ser mantidos ou removidos
];
