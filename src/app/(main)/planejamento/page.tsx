
// src/app/(main)/planejamento/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Utensils, Sparkles, Loader2 } from "lucide-react";
import MealPlannerForm from '@/components/MealPlannerForm';
import MealPlanDisplay, { type DailyMealPlan, exampleStaticMealPlan } from '@/components/MealPlanDisplay';
import { useAuth } from '@/contexts/AuthContext';
// Em uma futura implementação, chamaríamos uma server action aqui
// import { generateMealPlanAction } from '@/actions/mealPlanActions'; 

export default function PlanejamentoPage() {
  const { currentUser } = useAuth();
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [generatedMealPlan, setGeneratedMealPlan] = useState<DailyMealPlan[] | null>(null);
  const [showForm, setShowForm] = useState(true); // Controla a visibilidade do formulário

  const handleGenerateMealPlan = async () => {
    if (!currentUser) {
      // Idealmente, mostrar um toast ou mensagem
      console.error("Usuário não logado");
      return;
    }
    setIsLoadingPlan(true);
    setGeneratedMealPlan(null); 
    
    // Simulação de chamada de IA
    // Em uma implementação real, você chamaria uma server action que usa Genkit
    // const preferences = await getUserProfile(currentUser.uid).then(p => p?.mealPreferences);
    // if (preferences) {
    //   const plan = await generateMealPlanAction(preferences);
    //   setGeneratedMealPlan(plan);
    // } else {
    //   setGeneratedMealPlan(exampleStaticMealPlan); // Fallback para exemplo se não houver prefs
    // }
    
    setTimeout(() => {
      setGeneratedMealPlan(exampleStaticMealPlan); // Usando o plano estático por enquanto
      setIsLoadingPlan(false);
      setShowForm(false); // Oculta o formulário após gerar o plano
    }, 1500); // Simula delay da IA
  };

  const handlePreferencesSaved = () => {
    // Poderia recarregar preferências ou apenas indicar que foram salvas.
    // Por enquanto, apenas um log.
    console.log("Preferências salvas, pronto para gerar plano.");
  };
  
  const handleEditPreferences = () => {
    setShowForm(true); // Mostra o formulário novamente
    setGeneratedMealPlan(null); // Limpa o plano gerado para o usuário gerar um novo
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">Planejamento de Refeições</h1>
        <p className="text-muted-foreground mt-2">
          Aqui você encontrará sugestões de cardápios saudáveis, criados para complementar seu jejum. 
          Defina suas preferências para que a IA personalize seu plano!
        </p>
      </header>
      
      {showForm && (
        <MealPlannerForm onPreferencesSaved={handlePreferencesSaved} />
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center text-primary">
            <Sparkles className="mr-2 h-6 w-6" />
            Geração de Cardápio com IA
          </CardTitle>
          <CardDescription>
            {showForm 
              ? "Após salvar suas preferências, clique abaixo para gerar um cardápio semanal."
              : "Seu cardápio foi gerado. Você pode editar suas preferências para gerar um novo."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showForm && generatedMealPlan && (
             <Button onClick={handleEditPreferences} variant="outline" className="mb-4">
                Editar Preferências e Gerar Novo Cardápio
            </Button>
          )}
          {showForm && (
            <Button onClick={handleGenerateMealPlan} disabled={isLoadingPlan || !currentUser} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoadingPlan ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              Gerar Cardápio Semanal com IA
            </Button>
          )}
          
          {isLoadingPlan && (
            <div className="mt-6 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
              <p>Gerando seu cardápio personalizado...</p>
              <p className="text-xs">(Esta é uma simulação, a IA real está a caminho!)</p>
            </div>
          )}
        </CardContent>
      </Card>

      {!isLoadingPlan && generatedMealPlan && (
        <MealPlanDisplay mealPlan={generatedMealPlan} />
      )}
       {!isLoadingPlan && !generatedMealPlan && !showForm && (
         <Card className="mt-8 shadow-lg">
           <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center text-primary">
                <Utensils className="mr-2 h-6 w-6" />
                Seu Cardápio Semanal
              </CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-muted-foreground">Clique em "Editar Preferências e Gerar Novo Cardápio" para começar.</p>
           </CardContent>
         </Card>
       )}

      <Card className="bg-card shadow-lg mt-8">
        <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">Importante</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground text-sm">
            As sugestões de cardápio são geradas por IA e devem servir como inspiração. 
            Consulte sempre um nutricionista ou profissional de saúde para um plano alimentar individualizado e adequado às suas necessidades e condições de saúde.
            Não nos responsabilizamos por quaisquer decisões alimentares baseadas unicamente nas sugestões fornecidas.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
