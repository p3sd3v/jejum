
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

export async function startNewFast(userId: string, goalDurationHours?: number): Promise<string> {
  if (!userId) throw new Error("User ID is required.");

  const newFast: Omit<FastingSession, 'id'> = {
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

export async function getActiveFast(userId: string): Promise<FastingSession | null> {
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
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as FastingSession;
  }
  return null;
}

export async function getFastingHistory(userId: string, count: number = 7): Promise<FastingSession[]> {
  if (!userId) return [];
  
  const q = query(
    collection(db, 'fasting_sessions'),
    where('userId', '==', userId),
    where('status', '==', 'completed'),
    orderBy('startTime', 'desc'),
    limit(count)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FastingSession));
}
