
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Utensils, Salad, Soup, Coffee, ChefHat } from 'lucide-react';
import type { DailyMealPlan } from '@/ai/flows/generate-meal-plan-flow';


interface MealPlanDisplayProps {
  mealPlan: DailyMealPlan[] | null;
  asCard?: boolean; // New prop to control Card rendering
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

const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({ mealPlan, asCard = true }) => {
  if (!mealPlan || mealPlan.length === 0) {
    return (
        <p className="text-sm text-muted-foreground p-2">
            Nenhum detalhe de cardápio para exibir para esta entrada.
        </p>
    );
  }

  const content = (
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
  );

  if (!asCard) {
    return content;
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
        {content}
      </CardContent>
    </Card>
  );
};

export default MealPlanDisplay;
