
"use server";
import { suggestFastingTimes, type SuggestFastingTimesInput, type SuggestFastingTimesOutput } from '@/ai/flows/suggest-fasting-times';

export async function getAISuggestions(input: SuggestFastingTimesInput): Promise<SuggestFastingTimesOutput> {
  try {
    // Validate input further if necessary before calling the AI flow
    if (!input.userProfile.age || !input.userProfile.gender || !input.userProfile.activityLevel || !input.userProfile.fastingExperience || !input.userProfile.dailyRoutine || !input.userProfile.sleepSchedule) {
      throw new Error("Todos os campos do perfil são necessários para sugestões de IA.");
    }
    const result = await suggestFastingTimes(input);
    return result;
  } catch (error: any) {
    console.error("Error fetching AI suggestions:", error);
    // Consider re-throwing a more user-friendly error or specific error type
    throw new Error(error.message || "Falha ao obter sugestões da IA.");
  }
}
