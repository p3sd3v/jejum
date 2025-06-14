
// src/actions/aiSuggestionTypes.ts
import type { Timestamp } from 'firebase/firestore';
import type { SuggestFastingTimesInput, SuggestFastingTimesOutput } from '@/ai/flows/suggest-fasting-times';

export interface AISuggestionRequest {
  id?: string; // Document ID from Firestore
  userId: string;
  userInput: SuggestFastingTimesInput['userProfile'];
  status: 'pending' | 'processing' | 'completed' | 'error';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  suggestionOutput?: SuggestFastingTimesOutput;
  error?: string; // Error message if processing fails
}

export interface ClientAISuggestionRequest extends Omit<AISuggestionRequest, 'createdAt' | 'updatedAt' | 'id'> {
  id: string; // Ensure ID is always present on the client object
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// Helper function to convert AISuggestionRequest to ClientAISuggestionRequest
export function toClientAISuggestionRequest(docId: string, request: Omit<AISuggestionRequest, 'id'>): ClientAISuggestionRequest {
  // Firestore data will not have 'id' field, it's the doc key
  return {
    id: docId,
    userId: request.userId,
    userInput: request.userInput,
    status: request.status,
    createdAt: request.createdAt.toDate().toISOString(),
    updatedAt: request.updatedAt.toDate().toISOString(),
    suggestionOutput: request.suggestionOutput,
    error: request.error,
  };
}
