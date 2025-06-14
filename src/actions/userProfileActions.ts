
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
  mealPreferences?: {
    dietType?: string; // e.g., 'balanced', 'low-carb', 'vegan', 'keto'
    foodIntolerances?: string; // comma-separated string
    calorieGoal?: number;
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
  await setDoc(userRef, data, { merge: true }); // { merge: true } is crucial for partial updates
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

export async function updateUserMealPreferences(userId: string, preferences: UserProfile['mealPreferences']): Promise<void> {
  if (!userId) throw new Error("User ID is required.");
  await updateUserProfile(userId, { mealPreferences: preferences });
}

auth.onAuthStateChanged(async (user) => {
  if (user) {
    const profile = await getUserProfile(user.uid);
    if (!profile) {
      await createUserProfile(user);
    }
  }
});
