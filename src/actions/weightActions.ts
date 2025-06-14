
"use server";
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, Timestamp, serverTimestamp, limit, doc, getDoc, updateDoc } from 'firebase/firestore';

// Note: FastingSession and related functions are duplicated from fastingActions.ts
// Consider moving to a shared types file if they are truly identical.
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


// Weight Entry specific types and functions
export interface WeightEntry {
  id?: string;
  userId: string;
  weight: number; // in kg or lbs, be consistent
  date: Timestamp; // Firestore Timestamp
  unit?: 'kg' | 'lbs';
}

export interface ClientWeightEntry {
  id?: string;
  userId: string;
  weight: number;
  date: string; // ISO string
  unit?: 'kg' | 'lbs';
}

// Helper to convert Firestore Timestamp to Date object for client-side use
function toClientWeightEntry(entry: WeightEntry): ClientWeightEntry {
  return {
    ...entry,
    date: entry.date.toDate().toISOString(),
  };
}

export async function addWeightEntry(userId: string, weight: number, entryDate?: Date, unit?: 'kg' | 'lbs'): Promise<string> {
  if (!userId) throw new Error("User ID is required.");
  if (weight <= 0) throw new Error("Weight must be a positive number.");

  const newEntryData: Omit<WeightEntry, 'id' | 'date'> & { date: Timestamp } = {
    userId,
    weight,
    date: entryDate ? Timestamp.fromDate(entryDate) : Timestamp.now(),
    unit,
  };
  const docRef = await addDoc(collection(db, 'weight_entries'), newEntryData);
  return docRef.id;
}

export async function getWeightHistory(
  userId: string,
  limitCount: number = 90
): Promise<ClientWeightEntry[]> {
  if (!userId) return [];

  try {
    // Simplified query: fetch all entries for the user.
    // This requires a simple index on 'userId' (ASC), which Firestore often handles automatically.
    const q = query(
      collection(db, 'weight_entries'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);

    // Map Firestore documents to an intermediate array, converting Timestamp to Date object for sorting.
    const allUserEntries = querySnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data() as Omit<WeightEntry, 'id' | 'date'> & { date: Timestamp }; // Ensure date is Timestamp
      return {
        id: docSnapshot.id,
        userId: data.userId,
        weight: data.weight,
        date: data.date, // Keep as Firestore Timestamp for now
        unit: data.unit,
        dateObj: data.date.toDate(), // Convert to JS Date for sorting
      };
    });

    // Sort all entries by date descending (newest first) using JS Date objects.
    allUserEntries.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

    // Take the most recent 'limitCount' entries.
    const latestEntries = allUserEntries.slice(0, limitCount);

    // Convert these selected entries to ClientWeightEntry format (which converts Timestamp to ISO string).
    // Then, sort them by date ascending for the chart.
    const clientEntries = latestEntries
      .map(entry => toClientWeightEntry({
        id: entry.id,
        userId: entry.userId,
        weight: entry.weight,
        date: entry.date, // Pass the original Firestore Timestamp to toClientWeightEntry
        unit: entry.unit,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return clientEntries;

  } catch (error: any) {
    console.error("Error fetching weight history:", error);
    // Re-throw the original error or a custom error
    throw new Error(`Failed to fetch weight history: ${error.message}`);
  }
}
