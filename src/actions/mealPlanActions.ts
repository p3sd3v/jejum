
// src/actions/mealPlanActions.ts
"use server";

import { generateMealPlan, type GenerateMealPlanInput, type GenerateMealPlanOutput } from '@/ai/flows/generate-meal-plan-flow';
import type { UserProfile } from './userProfileActions';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp, Timestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import type { AIMealPlanRequest, ClientAIMealPlanRequest } from './aiMealPlanRequestTypes'; // Assuming this will be created or already exists
import { toClientAIMealPlanRequest } from './aiMealPlanRequestTypes'; // Assuming this will be created

// Note: DailyMealPlan type is no longer re-exported from here.
// Components should import it directly from '@/ai/flows/generate-meal-plan-flow'

export async function createAIMealPlanRequest(
  userId: string,
  preferences: UserProfile['mealPreferences'],
  numberOfDays: number = 3
): Promise<string> {
  if (!userId) {
    throw new Error("User ID é obrigatório para criar uma solicitação de cardápio.");
  }
  if (!preferences || (!preferences.dietType && !preferences.foodIntolerances && !preferences.calorieGoal)) {
    throw new Error("Pelo menos uma preferência alimentar (tipo de dieta, intolerâncias ou meta calórica) é necessária.");
  }

  const newRequestData: Omit<AIMealPlanRequest, 'id' | 'createdAt' | 'updatedAt' | 'mealPlanOutput' | 'error'> = {
    userId,
    userInput: {
      dietType: preferences.dietType,
      foodIntolerances: preferences.foodIntolerances,
      calorieGoal: preferences.calorieGoal,
      numberOfDays: numberOfDays,
    },
    status: 'pending',
  };

  const docRef = await addDoc(collection(db, 'ai_meal_plan_requests'), {
    ...newRequestData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function processMealPlanRequestAction(
  requestId: string,
  preferences: UserProfile['mealPreferences'],
  numberOfDays: number = 3
): Promise<void> { // Returns void as it updates Firestore
  if (!requestId) {
    throw new Error("Request ID é obrigatório para processar o cardápio.");
  }
  if (!preferences) {
    throw new Error("Preferências do usuário são necessárias para gerar o plano alimentar.");
  }

  const requestRef = doc(db, 'ai_meal_plan_requests', requestId);

  try {
    await updateDoc(requestRef, {
      status: 'processing',
      updatedAt: serverTimestamp(),
    });

    const input: GenerateMealPlanInput = {
      dietType: preferences.dietType,
      foodIntolerances: preferences.foodIntolerances,
      calorieGoal: preferences.calorieGoal,
      numberOfDays: numberOfDays,
    };

    const result = await generateMealPlan(input);

    await updateDoc(requestRef, {
      mealPlanOutput: result,
      status: 'completed',
      updatedAt: serverTimestamp(),
    });

  } catch (error: any) {
    console.error("Error processing meal plan via Genkit flow for request ID:", requestId, error);
    await updateDoc(requestRef, {
      status: 'error',
      error: error.message || "Falha ao gerar o plano alimentar com IA.",
      updatedAt: serverTimestamp(),
    });
    // No need to throw here as the error is saved in Firestore and handled by the listener
  }
}


export async function getAIMealPlanRequestHistory(userId: string): Promise<ClientAIMealPlanRequest[]> {
  if (!userId) return [];

  // ATENÇÃO: Esta query requer um índice composto no Firestore.
  // Coleção: ai_meal_plan_requests
  // Campos: userId (Ascendente), createdAt (Descendente)
  try {
    const q = query(
      collection(db, 'ai_meal_plan_requests'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const history: ClientAIMealPlanRequest[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
       if (data && 
          typeof data.userId === 'string' && 
          typeof data.userInput === 'object' && data.userInput !== null &&
          typeof data.status === 'string' &&
          data.createdAt instanceof Timestamp && 
          data.updatedAt instanceof Timestamp) {
            const requestDataForClient: Omit<AIMealPlanRequest, 'id'> = {
                userId: data.userId,
                userInput: data.userInput as GenerateMealPlanInput,
                status: data.status as AIMealPlanRequest['status'],
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                mealPlanOutput: data.mealPlanOutput,
                error: data.error,
            };
            history.push(toClientAIMealPlanRequest(docSnap.id, requestDataForClient));
        } else {
            console.warn(`Document ${docSnap.id} in 'ai_meal_plan_requests' for userId ${userId} is malformed or missing required Timestamp fields. Skipping. Data:`, JSON.stringify(data, null, 2));
        }
    });
    return history;
  } catch (error: any) {
    console.error("Error fetching AI meal plan request history:", error);
     if (error.code === 'failed-precondition' && error.message && typeof error.message === 'string' && error.message.includes('index')) {
        console.error(
        `Firestore Index Required for getAIMealPlanRequestHistory: 
        Collection ID: 'ai_meal_plan_requests'. 
        Fields: 'userId' (Ascending), 'createdAt' (Descendente).
        Query scopes: Collection.
        Please create this index in your Firebase console.`
        );
    }
    return [];
  }
}

export async function countTodaysMealPlanRequests(userId: string): Promise<number> {
  if (!userId) return 0;

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  const startOfDayTimestamp = Timestamp.fromDate(startOfDay);
  const endOfDayTimestamp = Timestamp.fromDate(endOfDay);

  // ATENÇÃO: Esta query requer um índice composto no Firestore.
  // Coleção: ai_meal_plan_requests
  // Campos: userId (Ascendente), createdAt (Ascendente ou Descendente) - verifique a ordem que melhor se adapta
  try {
    const q = query(
      collection(db, 'ai_meal_plan_requests'),
      where('userId', '==', userId),
      where('createdAt', '>=', startOfDayTimestamp),
      where('createdAt', '<=', endOfDayTimestamp)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error: any) {
    console.error("Error counting today's meal plan requests:", error);
    if (error.code === 'failed-precondition' && error.message && typeof error.message === 'string' && error.message.includes('index')) {
        console.error(
        `Firestore Index Required for countTodaysMealPlanRequests: 
        Collection ID: 'ai_meal_plan_requests'. 
        Fields: 'userId' (Ascending), 'createdAt' (Ascending/Descending - check query needs).
        Query scopes: Collection.
        Please create this index in your Firebase console.`
        );
    }
    return 0; // Return 0 on error to avoid blocking functionality, or rethrow if critical
  }
}
