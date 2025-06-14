
"use server";
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, Timestamp, serverTimestamp, limit } from 'firebase/firestore';

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

  const q = query(
    collection(db, 'weight_entries'),
    where('userId', '==', userId),
    orderBy('date', 'desc'), // Get newest first
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  const entries = querySnapshot.docs.map(doc => {
    const data = doc.data() as WeightEntry;
    return toClientWeightEntry({ ...data, id: doc.id });
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort ascending for chart display

  return entries;
}
