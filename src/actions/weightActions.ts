
"use server";
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, Timestamp, serverTimestamp, limit, doc, getDoc, updateDoc } from 'firebase/firestore';

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
  limitCount: number = 90 // Fetch last 90 entries for chart flexibility
): Promise<ClientWeightEntry[]> {
  if (!userId) return [];

  try {
    const q = query(
      collection(db, 'weight_entries'),
      where('userId', '==', userId),
      orderBy('date', 'desc'), // Get latest entries first
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);

    // Entries are currently newest to oldest.
    // For charts, usually oldest to newest is preferred.
    const firestoreEntries = querySnapshot.docs.map(docSnapshot => {
      return { id: docSnapshot.id, ...docSnapshot.data() } as WeightEntry;
    });

    // Convert to client format and then sort chronologically (oldest to newest)
    const clientEntries = firestoreEntries
      .map(toClientWeightEntry)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    return clientEntries;

  } catch (error: any) {
    console.error("Error fetching weight history:", error);
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
        console.error(
        `Firestore Index Required: This query needs a composite index. 
        Please create it in your Firebase console:
        1. Go to Firestore Database -> Indexes.
        2. Click "Add Index" or "Create Index".
        3. Collection ID: 'weight_entries'.
        4. Fields to index:
           - 'userId', Order: Ascending
           - 'date', Order: Descending
        5. Query scopes: Collection.
        6. Click "Create". Index creation may take a few minutes.
        Alternatively, the error message in the browser console usually provides a direct link to create the index.`
        );
    }
    throw new Error(`Failed to fetch weight history: ${error.message}`);
  }
}

export async function getLatestWeightEntry(userId: string): Promise<ClientWeightEntry | null> {
  if (!userId) return null;
  try {
    const q = query(
      collection(db, 'weight_entries'), 
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }
    
    const latestDoc = querySnapshot.docs[0];
    const latestEntry = { id: latestDoc.id, ...latestDoc.data() } as WeightEntry;
    
    return toClientWeightEntry(latestEntry);

  } catch (error: any) {
    console.error("Error fetching latest weight entry:", error);
    // Check for index error, similar to getWeightHistory
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
      console.error(
        `Firestore Index Required for getLatestWeightEntry. 
        Collection ID: 'weight_entries'. Fields: 'userId' (Asc), 'date' (Desc).`
      );
    }
    return null; 
  }
}
