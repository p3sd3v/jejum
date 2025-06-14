
// src/actions/mealPlanActions.ts
"use server";

import { generateMealPlan, type GenerateMealPlanInput, type GenerateMealPlanOutput, type DailyMealPlan } from '@/ai/flows/generate-meal-plan-flow';
import type { UserProfile } from './userProfileActions';

// Re-export DailyMealPlan type for use in the frontend component
export type { DailyMealPlan };


export async function generateMealPlanAction(
  preferences: UserProfile['mealPreferences'],
  numberOfDays: number = 3 // Default to 3 days
): Promise<GenerateMealPlanOutput> {
  if (!preferences) {
    throw new Error("Preferências do usuário são necessárias para gerar o plano alimentar.");
  }

  const input: GenerateMealPlanInput = {
    dietType: preferences.dietType,
    foodIntolerances: preferences.foodIntolerances,
    calorieGoal: preferences.calorieGoal,
    numberOfDays: numberOfDays,
  };

  try {
    const result = await generateMealPlan(input);
    return result;
  } catch (error: any) {
    console.error("Error generating meal plan via Genkit flow:", error);
    throw new Error(error.message || "Falha ao gerar o plano alimentar com IA.");
  }
}
