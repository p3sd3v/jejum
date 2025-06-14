
"use server";
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, Timestamp, serverTimestamp, limit } from 'firebase/firestore';

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


export interface WeightEntry {
  id?: string;
  userId: string;
  weight: number; // in kg or lbs, be consistent
  date: Timestamp;
  unit?: 'kg' | 'lbs';
}

export interface ClientWeightEntry {
  id?: string;
  userId: string;
  weight: number;
  date: string; // ISO string
  unit?: 'kg' | 'lbs';
}

function toClientWeightEntry(entry: WeightEntry): ClientWeightEntry {
  return {
    ...entry,
    date: entry.date.toDate().toISOString(),
  };
}

export async function addWeightEntry(userId: string, weight: number, entryDate?: Date, unit?: 'kg' | 'lbs'): Promise<string> {
  if (!userId) throw new Error("User ID is required.");
  if (weight <= 0) throw new Error("Weight must be a positive number.");

  const newEntry: Omit<WeightEntry, 'id' | 'date'> & { date: Timestamp } = {
    userId,
    weight,
    date: entryDate ? Timestamp.fromDate(entryDate) : Timestamp.now(),
    unit,
  };
  const docRef = await addDoc(collection(db, 'weight_entries'), newEntry);
  return docRef.id;
}

export async function getWeightHistory(
  userId: string,
  limitCount: number = 90 // Fetch up to 90 entries for client-side aggregation
): Promise<ClientWeightEntry[]> {
  if (!userId) return [];

  try {
    const q = query(
      collection(db, 'weight_entries'),
      where('userId', '==', userId),
      orderBy('date', 'desc'), 
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const entries = querySnapshot.docs.map(doc => {
      const data = doc.data() as WeightEntry;
      return toClientWeightEntry({ ...data, id: doc.id });
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); 

    return entries;
  } catch (error: any) {
    if (error.code === 'failed-precondition' && error.message && error.message.includes('requires an index')) {
      console.error("****************************************************************************************************");
      console.error("FIRESTORE INDEX REQUIRED - PLEASE FOLLOW THESE STEPS:");
      console.error("The current Firestore query needs a composite index that hasn't been created yet.");
      console.error("You can usually create this index by following the link provided in the original error message, OR manually:");
      console.error("1. Go to your Firebase project console.");
      console.error("2. Navigate to Firestore Database -> Indexes tab.");
      console.error("3. Click 'Add composite index' (or 'Start query' then 'Save Index' if using the query builder).");
      console.error("4. Set Collection ID to: 'weight_entries'");
      console.error("5. Add the following fields to the index IN THIS ORDER:");
      console.error("   - Field path: 'userId', Query scope: Collection, Array support: No, Order: Ascending");
      console.error("   - Field path: 'date', Query scope: Collection, Array support: No, Order: Descending  <-- IMPORTANT: DESCENDING ORDER FOR DATE");
      console.error("6. Click 'Create Index'. The index will take a few minutes to build.");
      console.error("   After the index status is 'Enabled', your query should work.");
      let directLink = "Could not extract link from error. Check the original browser console error for a direct link to create the index.";
      const linkMatch = error.message.match(/https?:\/\/[^\s]+/);
      if (linkMatch && linkMatch[0]) {
        directLink = `Direct link from error: ${linkMatch[0]}`;
      }
      console.error(directLink);
      console.error("****************************************************************************************************");
    }
    // Re-throw the original error to allow for other error handling or display
    throw error;
  }
}
