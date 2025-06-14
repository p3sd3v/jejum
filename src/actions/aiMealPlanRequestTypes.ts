// src/actions/aiMealPlanRequestTypes.ts
import type { Timestamp } from 'firebase/firestore';
import type { GenerateMealPlanInput, GenerateMealPlanOutput } from '@/ai/flows/generate-meal-plan-flow';

export interface AIMealPlanRequest {
  id?: string; // Document ID from Firestore
  userId: string;
  userInput: GenerateMealPlanInput;
  status: 'pending' | 'processing' | 'completed' | 'error';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  mealPlanOutput?: GenerateMealPlanOutput;
  error?: string; // Error message if processing fails
}

export interface ClientAIMealPlanRequest extends Omit<AIMealPlanRequest, 'createdAt' | 'updatedAt' | 'id'> {
  id: string; // Ensure ID is always present on the client object
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// Helper function to convert AIMealPlanRequest to ClientAIMealPlanRequest
export function toClientAIMealPlanRequest(docId: string, request: Omit<AIMealPlanRequest, 'id'>): ClientAIMealPlanRequest {
  return {
    id: docId,
    userId: request.userId,
    userInput: request.userInput,
    status: request.status,
    createdAt: request.createdAt.toDate().toISOString(),
    updatedAt: request.updatedAt.toDate().toISOString(),
    mealPlanOutput: request.mealPlanOutput,
    error: request.error,
  };
}
