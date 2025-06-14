
// src/actions/types.ts
import type { Timestamp } from 'firebase/firestore';

export interface FastingSession {
  id?: string;
  userId: string;
  startTime: Timestamp;
  endTime?: Timestamp | null;
  goalDurationHours?: number; // in hours
  actualDurationMinutes?: number; // in minutes
  notes?: string;
  status: 'active' | 'completed';
}

// New interface for client-side data to ensure serializability
export interface ClientFastingSession {
  id?: string;
  userId: string;
  startTime: string; // ISO string
  endTime?: string | null; // ISO string
  goalDurationHours?: number;
  actualDurationMinutes?: number;
  notes?: string;
  status: 'active' | 'completed';
}

// Helper function to convert FastingSession to ClientFastingSession
export function toClientFastingSession(session: FastingSession): ClientFastingSession {
  return {
    ...session,
    startTime: session.startTime.toDate().toISOString(),
    endTime: session.endTime ? session.endTime.toDate().toISOString() : null,
  };
}
