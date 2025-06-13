
"use server";
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  fastingGoalHours?: number; // e.g., 16 for 16:8 fasting
  aiProfile?: {
    age?: number;
    gender?: string;
    activityLevel?: string;
    sleepSchedule?: string;
    dailyRoutine?: string;
    fastingExperience?: string;
  };
}

export async function createUserProfile(user: User, additionalData: Partial<UserProfile> = {}): Promise<void> {
  const userRef = doc(db, 'user_profiles', user.uid);
  const profileData: UserProfile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    ...additionalData,
  };
  await setDoc(userRef, profileData, { merge: true });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;
  const userRef = doc(db, 'user_profiles', userId);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  if (!userId) throw new Error("User ID is required to update profile.");
  const userRef = doc(db, 'user_profiles', userId);
  // Use setDoc with merge: true to create the document if it doesn't exist, or update/merge if it does.
  await setDoc(userRef, data, { merge: true });
}

export interface FastingGoal {
  fastingGoalHours: number;
}

export async function updateUserFastingGoal(userId: string, goal: FastingGoal): Promise<void> {
  if (!userId) throw new Error("User ID is required.");
  await updateUserProfile(userId, { fastingGoalHours: goal.fastingGoalHours });
}

export async function updateUserAIProfile(userId: string, aiProfileData: UserProfile['aiProfile']): Promise<void> {
  if (!userId) throw new Error("User ID is required.");
  await updateUserProfile(userId, { aiProfile: aiProfileData });
}

// Ensure profile is created on first login/signup
// This could be called client-side after successful auth or via a trigger
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const profile = await getUserProfile(user.uid);
    if (!profile) {
      await createUserProfile(user);
    }
  }
});
