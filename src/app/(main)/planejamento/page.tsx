
// src/app/(main)/planejamento/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Utensils, Sparkles, Loader2, AlertTriangle } from "lucide-react";
import MealPlannerForm from '@/components/MealPlannerForm';
import MealPlanDisplay from '@/components/MealPlanDisplay'; // DailyMealPlan type will be resolved from here
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, type UserProfile } from '@/actions/userProfileActions';
import { generateMealPlanAction, type DailyMealPlan } from '@/actions/mealPlanActions'; // Import the action and type
import { useToast } from '@/hooks/use-toast';


export default function PlanejamentoPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [generatedMealPlan, setGeneratedMealPlan] = useState<DailyMealPlan[] | null>(null);
  const [mealPlanDisclaimer, setMealPlanDisclaimer] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setIsFetchingProfile(true);
      getUserProfile(currentUser.uid)
        .then(profile => {
          setUserProfile(profile);
          if (profile?.mealPreferences) {
            // If preferences exist, maybe directly offer to generate plan or show existing?
            // For now, still show form but it will be prefilled.
          }
        })
        .catch(err => {
          console.error("Failed to fetch user profile", err);
          toast({ title: "Erro", description: "Não foi possível carregar seu perfil.", variant: "destructive" });
        })
        .finally(() => setIsFetchingProfile(false));
    } else {
      setIsFetchingProfile(false);
    }
  }, [currentUser, toast]);


  const handleGenerateMealPlan = async () => {
    if (!currentUser || !userProfile) {
      toast({ title: "Atenção", description: "Perfil do usuário não carregado. Tente novamente.", variant: "destructive" });
      return;
    }
    if (!userProfile.mealPreferences || Object.values(userProfile.mealPreferences).every(val => !val)) {
       toast({ title: "Preferências Necessárias", description: "Por favor, salve suas preferências alimentares antes de gerar um cardápio.", variant: "destructive" });
       setShowForm(true); // Ensure form is visible if preferences are missing
       return;
    }

    setIsLoadingPlan(true);
    setGeneratedMealPlan(null);
    setMealPlanDisclaimer(null);
    
    try {
      const planOutput = await generateMealPlanAction(userProfile.mealPreferences, 3); // Generate for 3 days
      if (planOutput.mealPlan && planOutput.mealPlan.length > 0) {
        setGeneratedMealPlan(planOutput.mealPlan);
        setMealPlanDisclaimer(planOutput.disclaimer || "Lembre-se que estas são sugestões e é importante consultar um profissional de saúde.");
        setShowForm(false); 
        toast({title: "Cardápio Gerado!", description: "Seu cardápio personalizado está pronto.", className: "bg-success text-success-foreground"});
      } else {
        toast({title: "Sem Resultados", description: "A IA não conseguiu gerar um cardápio com as preferências atuais. Tente ajustá-las.", variant: "default"});
        setGeneratedMealPlan([]); // Set to empty array to indicate no results but IA was called
      }
    } catch (error: any) {
      console.error("Error calling generateMealPlanAction", error);
      toast({ title: "Erro na Geração", description: error.message || "Não foi possível gerar o cardápio. Tente novamente.", variant: "destructive" });
      setGeneratedMealPlan(null); // Keep it null on error
    } finally {
      setIsLoadingPlan(false);
    }
  };
  
  const handlePreferencesSaved = async () => {
    // Refetch profile to ensure we have the latest preferences
    if (currentUser) {
      setIsFetchingProfile(true);
      try {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
        toast({title: "Preferências Salvas", description: "Agora você pode gerar seu cardápio."});
      } catch (error) {
         toast({title: "Erro", description: "Não foi possível recarregar o perfil.", variant: "destructive"});
      } finally {
        setIsFetchingProfile(false);
      }
    }
  };
  
  const handleEditPreferences = () => {
    setShowForm(true); 
    setGeneratedMealPlan(null); 
    setMealPlanDisclaimer(null);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">Planejamento de Refeições</h1>
        <p className="text-muted-foreground mt-2">
          Defina suas preferências para que a IA personalize um plano alimentar para complementar seu jejum!
        </p>
      </header>
      
      {isFetchingProfile && (
         <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Carregando dados do perfil...</div>
      )}

      {!isFetchingProfile && showForm && (
        <MealPlannerForm onPreferencesSaved={handlePreferencesSaved} />
      )}

      {!isFetchingProfile && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center text-primary">
              <Sparkles className="mr-2 h-6 w-6" />
              Geração de Cardápio com IA
            </CardTitle>
            <CardDescription>
              {showForm 
                ? "Após salvar suas preferências, clique abaixo para gerar um cardápio."
                : "Seu cardápio foi gerado. Você pode editar suas preferências para gerar um novo."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showForm && (generatedMealPlan || generatedMealPlan === null) && ( // Show edit only if plan was shown or attempted
               <Button onClick={handleEditPreferences} variant="outline" className="mb-4">
                  Editar Preferências e Gerar Novo Cardápio
              </Button>
            )}
            {showForm && (
              <Button 
                onClick={handleGenerateMealPlan} 
                disabled={isLoadingPlan || !currentUser || isFetchingProfile || !userProfile?.mealPreferences || Object.values(userProfile.mealPreferences).every(val => !val)} 
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isLoadingPlan ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-5 w-5" />
                )}
                Gerar Cardápio com IA ({generatedMealPlan ? 'Novo' : '3 Dias'})
              </Button>
            )}
             {!isLoadingPlan && showForm && userProfile?.mealPreferences && Object.values(userProfile.mealPreferences).every(val => !val) && (
                <p className="text-sm text-destructive mt-2">
                  <AlertTriangle className="inline h-4 w-4 mr-1" />
                  Por favor, preencha e salve suas preferências alimentares para habilitar a geração do cardápio.
                </p>
             )}
            
            {isLoadingPlan && (
              <div className="mt-6 flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                <p>Gerando seu cardápio personalizado com IA...</p>
                <p className="text-xs">(Isso pode levar alguns segundos)</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!isLoadingPlan && generatedMealPlan && generatedMealPlan.length > 0 && (
        <MealPlanDisplay mealPlan={generatedMealPlan} />
      )}
      {!isLoadingPlan && generatedMealPlan && generatedMealPlan.length === 0 && (
         <Card className="mt-8 shadow-lg">
           <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center text-primary">
                <Utensils className="mr-2 h-6 w-6" />
                Cardápio Semanal
              </CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-muted-foreground">A IA não retornou sugestões para as preferências atuais. Tente ajustá-las e gerar novamente.</p>
           </CardContent>
         </Card>
      )}

      {mealPlanDisclaimer && !isLoadingPlan && generatedMealPlan && generatedMealPlan.length > 0 && (
        <Card className="bg-card shadow-lg mt-8">
          <CardHeader>
              <CardTitle className="font-headline text-lg text-primary flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-accent"/>Importante</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-muted-foreground text-sm">
                {mealPlanDisclaimer}
              </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
