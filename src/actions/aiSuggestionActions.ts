
"use server";
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import type { SuggestFastingTimesInput } from '@/ai/flows/suggest-fasting-times';
import type { AISuggestionRequest, ClientAISuggestionRequest } from './aiSuggestionTypes';
import { toClientAISuggestionRequest } from './aiSuggestionTypes';

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

export async function getAISuggestionHistory(userId: string): Promise<ClientAISuggestionRequest[]> {
  if (!userId) return [];

  try {
    const q = query(
      collection(db, 'ai_suggestion_requests'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
      // Removido: limit(limitCount) para buscar todas as sugestões
    );

    const querySnapshot = await getDocs(q);
    
    const history: ClientAISuggestionRequest[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as Omit<AISuggestionRequest, 'id'>;
      if (data.createdAt && data.updatedAt) {
         history.push(toClientAISuggestionRequest(docSnap.id, data));
      } else {
        console.warn(`Suggestion request ${docSnap.id} is missing timestamps.`);
      }
    });
    return history;

  } catch (error: any) {
    console.error("Error fetching AI suggestion history:", error);
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
        console.error(
        `Firestore Index Required for getAISuggestionHistory: 
        Collection ID: 'ai_suggestion_requests'. 
        Fields: 'userId' (Ascending), 'createdAt' (Descending).
        Query scopes: Collection.
        Please create this index in your Firebase console.`
        );
    }
    return []; 
  }
}

