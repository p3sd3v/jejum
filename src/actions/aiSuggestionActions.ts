
"use server";
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { SuggestFastingTimesInput } from '@/ai/flows/suggest-fasting-times';
import type { AISuggestionRequest } from './aiSuggestionTypes';

export async function createAISuggestionRequest(userId: string, input: SuggestFastingTimesInput): Promise<string> {
  if (!userId) {
    throw new Error("User ID é obrigatório para criar uma solicitação de sugestão.");
  }
  if (!input.userProfile.age || !input.userProfile.gender || !input.userProfile.activityLevel || !input.userProfile.fastingExperience || !input.userProfile.dailyRoutine || !input.userProfile.sleepSchedule) {
    throw new Error("Todos os campos do perfil são necessários para criar uma solicitação de sugestão.");
  }

  try {
    const newRequestData: Omit<AISuggestionRequest, 'id' | 'createdAt' | 'updatedAt' | 'suggestionOutput' | 'error'> = {
      userId,
      userInput: input.userProfile,
      status: 'pending',
    };

    const docRef = await addDoc(collection(db, 'ai_suggestion_requests'), {
      ...newRequestData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error: any) {
    console.error("Error creating AI suggestion request:", error);
    throw new Error(error.message || "Falha ao criar a solicitação de sugestão da IA.");
  }
}
