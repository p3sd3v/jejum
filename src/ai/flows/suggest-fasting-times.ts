
// src/ai/flows/suggest-fasting-times.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting personalized fasting times based on user profile and daily habits.
 *
 * The flow uses an AI model to generate suggestions based on user information.
 * It exports the SuggestFastingTimesInput, SuggestFastingTimesOutput types and the suggestFastingTimes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFastingTimesInputSchema = z.object({
  userProfile: z.object({
    age: z.number().describe('The age of the user.'),
    gender: z.string().describe('The gender of the user.'),
    activityLevel: z.string().describe('The activity level of the user (e.g., sedentary, moderate, active).'),
    sleepSchedule: z.string().describe('The typical sleep schedule of the user (e.g., 10 PM - 6 AM).'),
    dailyRoutine: z.string().describe('A description of the user\u2019s daily routine, including meal times and workout schedule.'),
    fastingExperience: z.string().describe('The user\u2019s fasting experience level (e.g., beginner, intermediate, advanced).'),
  }).describe('The profile of the user, including age, gender, activity level, sleep schedule, and daily routine.'),
});
export type SuggestFastingTimesInput = z.infer<typeof SuggestFastingTimesInputSchema>;

const SuggestFastingTimesOutputSchema = z.object({
  suggestedStartTime: z.string().describe('The suggested start time for the fasting period (e.g., 8:00 PM).'),
  suggestedEndTime: z.string().describe('The suggested end time for the fasting period (e.g., 12:00 PM).'),
  reasoning: z.string().describe('The reasoning behind the suggested fasting times, based on the user profile and daily habits.'),
});
export type SuggestFastingTimesOutput = z.infer<typeof SuggestFastingTimesOutputSchema>;

export async function suggestFastingTimes(input: SuggestFastingTimesInput): Promise<SuggestFastingTimesOutput> {
  return suggestFastingTimesFlow(input);
}

const suggestFastingTimesPrompt = ai.definePrompt({
  name: 'suggestFastingTimesPrompt',
  input: {schema: SuggestFastingTimesInputSchema},
  output: {schema: SuggestFastingTimesOutputSchema},
  prompt: `Você é um assistente de IA especialista em jejum intermitente e bem-estar. Sua tarefa é sugerir horários de jejum personalizados para os usuários com base em seu perfil e hábitos diários.

  Analise o seguinte perfil de usuário:
  Idade: {{{userProfile.age}}}
  Gênero: {{{userProfile.gender}}}
  Nível de Atividade: {{{userProfile.activityLevel}}}
  Horário de Sono: {{{userProfile.sleepSchedule}}}
  Rotina Diária: {{{userProfile.dailyRoutine}}}
  Experiência com Jejum: {{{userProfile.fastingExperience}}}

  Com base nessas informações, sugira um horário de início e um horário de término para o jejum, juntamente com uma breve explicação (raciocínio) para as sugestões.
  RESPONDA EM PORTUGUÊS BRASILEIRO.
  Certifique-se de que a saída corresponda ao esquema definido.
  `,
});

const suggestFastingTimesFlow = ai.defineFlow(
  {
    name: 'suggestFastingTimesFlow',
    inputSchema: SuggestFastingTimesInputSchema,
    outputSchema: SuggestFastingTimesOutputSchema,
  },
  async input => {
    const {output} = await suggestFastingTimesPrompt(input);
    return output!;
  }
);

