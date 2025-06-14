
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
  if (!userId) {
    console.warn("getAISuggestionHistory called with no userId.");
    return [];
  }

  try {
    const q = query(
      collection(db, 'ai_suggestion_requests'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`No AI suggestion requests found for userId: ${userId} in 'ai_suggestion_requests' collection.`);
      return [];
    }

    const history: ClientAISuggestionRequest[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data(); 
      
      // Robust check for required fields and their types
      if (data && 
          typeof data.userId === 'string' && 
          typeof data.userInput === 'object' && data.userInput !== null &&
          typeof data.status === 'string' &&
          data.createdAt instanceof Timestamp && 
          data.updatedAt instanceof Timestamp) {  
        
        // Construct the object to pass to toClientAISuggestionRequest
        const requestDataForClient: Omit<AISuggestionRequest, 'id'> = {
            userId: data.userId,
            userInput: data.userInput as SuggestFastingTimesInput['userProfile'], // Cast to the expected type
            status: data.status as AISuggestionRequest['status'], // Cast to the expected type
            createdAt: data.createdAt, 
            updatedAt: data.updatedAt, 
            suggestionOutput: data.suggestionOutput, // This can be undefined
            error: data.error, // This can be undefined
        };
        history.push(toClientAISuggestionRequest(docSnap.id, requestDataForClient));
      } else {
        console.warn(`Document ${docSnap.id} in 'ai_suggestion_requests' for userId ${userId} is malformed or missing required Timestamp fields (createdAt, updatedAt). Skipping. Data:`, JSON.stringify(data));
      }
    });
    return history;

  } catch (error: any) {
    console.error("Error fetching AI suggestion history for userId:", userId, error);
    if (error.code === 'failed-precondition' && error.message && typeof error.message === 'string' && error.message.includes('index')) {
        console.error(
        `Firestore Index Required for getAISuggestionHistory: 
        Collection ID: 'ai_suggestion_requests'. 
        Fields: 'userId' (Ascending), 'createdAt' (Descending).
        Query scopes: Collection.
        Please create this index in your Firebase console. The error message above or in your Firebase project's Firestore console might provide a direct link to create it.`
        );
    }
    // Return empty array on error to prevent breaking UI, component should handle empty state.
    return []; 
  }
}
