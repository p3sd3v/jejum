
"use server";
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, getDoc, query, where, orderBy, limit, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';

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
function toClientFastingSession(session: FastingSession): ClientFastingSession {
  return {
    ...session,
    startTime: session.startTime.toDate().toISOString(),
    endTime: session.endTime ? session.endTime.toDate().toISOString() : null,
  };
}


export async function startNewFast(userId: string, goalDurationHours?: number): Promise<string> {
  if (!userId) throw new Error("User ID is required.");

  const newFast: Omit<FastingSession, 'id' | 'startTime'> & { startTime: Timestamp } = {
    userId,
    startTime: Timestamp.now(),
    status: 'active',
    goalDurationHours: goalDurationHours,
  };

  const docRef = await addDoc(collection(db, 'fasting_sessions'), newFast);
  return docRef.id;
}

export async function endCurrentFast(sessionId: string, notes?: string): Promise<void> {
  if (!sessionId) throw new Error("Session ID is required.");

  const sessionRef = doc(db, 'fasting_sessions', sessionId);
  const sessionDoc = await getDoc(sessionRef);

  if (!sessionDoc.exists()) {
    throw new Error("Fasting session not found.");
  }

  const sessionData = sessionDoc.data() as FastingSession;
  const startTime = sessionData.startTime.toDate();
  const endTime = new Date();
  const actualDurationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

  await updateDoc(sessionRef, {
    endTime: Timestamp.fromDate(endTime),
    status: 'completed',
    actualDurationMinutes,
    notes: notes || '',
  });
}

export async function getActiveFast(userId: string): Promise<ClientFastingSession | null> {
  if (!userId) return null;

  const q = query(
    collection(db, 'fasting_sessions'),
    where('userId', '==', userId),
    where('status', '==', 'active'),
    orderBy('startTime', 'desc'),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const docData = querySnapshot.docs[0];
    const session = { id: docData.id, ...docData.data() } as FastingSession;
    return toClientFastingSession(session);
  }
  return null;
}

export async function getFastingHistory(userId: string, count: number = 7): Promise<ClientFastingSession[]> {
  if (!userId) return [];
  
  const q = query(
    collection(db, 'fasting_sessions'),
    where('userId', '==', userId),
    where('status', '==', 'completed'),
    orderBy('startTime', 'desc'),
    limit(count)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docData => {
    const session = { id: docData.id, ...docData.data() } as FastingSession;
    return toClientFastingSession(session);
  });
}

