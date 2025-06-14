
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Utensils, Salad, Soup, Coffee } from 'lucide-react'; // Example icons

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

const getMealIcon = (mealName: string) => {
  const lowerMealName = mealName.toLowerCase();
  if (lowerMealName.includes('café') || lowerMealName.includes('breakfast')) {
    return <Coffee className="h-5 w-5 mr-2 text-primary" />;
  }
  if (lowerMealName.includes('almoço') || lowerMealName.includes('lunch')) {
    return <Salad className="h-5 w-5 mr-2 text-primary" />;
  }
  if (lowerMealName.includes('jantar') || lowerMealName.includes('dinner') || lowerMealName.includes('sopa') ) {
    return <Soup className="h-5 w-5 mr-2 text-primary" />;
  }
  return <Utensils className="h-5 w-5 mr-2 text-primary" />;
};

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
    <Card className="mt-8 shadow-xl bg-card">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center text-primary">
          <Utensils className="mr-3 h-7 w-7" />
          Seu Cardápio Semanal Sugerido
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Este é um exemplo de cardápio. A geração com IA completa será implementada em breve.
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
                    <p className="text-sm text-foreground/90">{meal.description}</p>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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
      { name: "Café da manhã", description: "Omelete com espinafre e queijo (2 ovos, 1 xícara de espinafre, 30g de queijo), café preto ou chá sem açúcar." },
      { name: "Almoço", description: "120g de frango grelhado, 1 xícara de legumes assados (brócolis, cenoura, abobrinha) temperados com azeite e ervas." },
      { name: "Jantar", description: "Sopa de abóbora com gengibre (2 xícaras), acompanhada de uma pequena salada de folhas verdes com tomate cereja e pepino." },
    ],
  },
  {
    day: "Dia 2 (Exemplo)",
    meals: [
      { name: "Café da manhã", description: "Smoothie feito com 1/2 abacate, 1/2 xícara de morangos, 1 colher de sopa de chia e 200ml de leite de amêndoas sem açúcar." },
      { name: "Almoço", description: "120g de salmão assado com gotas de limão, 1/2 xícara de quinoa cozida e 1 xícara de aspargos no vapor." },
      { name: "Jantar", description: "Salada completa: 1 lata de atum em água, 2 ovos cozidos, mix de folhas verdes, tomate, pepino, azeitonas. Temperar com azeite e vinagre balsâmico." },
    ],
  },
  {
    day: "Dia 3 (Exemplo)",
    meals: [
      { name: "Café da manhã", description: "1 pote (170g) de iogurte grego natural integral, 2 colheres de sopa de granola caseira sem açúcar e 1/2 xícara de frutas vermelhas." },
      { name: "Almoço", description: "1 xícara de lentilhas cozidas e temperadas, 1/2 xícara de arroz integral e uma salada colorida (alface, rúcula, cenoura ralada, beterraba ralada)." },
      { name: "Jantar", description: "1 abobrinha média recheada com 100g de carne moída magra refogada com tomate e temperos, coberta com 20g de queijo mussarela light e assada." },
    ],
  },
];
