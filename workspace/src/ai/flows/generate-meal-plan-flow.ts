
// src/ai/flows/generate-meal-plan-flow.ts
'use server';
/**
 * @fileOverview A Genkit flow to generate personalized meal plans.
 *
 * - generateMealPlan - A function that handles the meal plan generation process.
 * - GenerateMealPlanInput - The input type for the generateMealPlan function.
 * - GenerateMealPlanOutput - The return type for the generateMealPlan function.
 * - DailyMealPlan - The type for a single day's meal plan.
 * - Meal - The type for an individual meal.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MealSchema = z.object({
  name: z.string().describe('O nome da refeição (ex: Café da manhã, Almoço, Lanche, Jantar).'),
  description: z.string().describe('A descrição detalhada da refeição, incluindo os principais ingredientes e uma breve sugestão de preparo se aplicável.'),
});
export type Meal = z.infer<typeof MealSchema>;

const DailyMealPlanSchema = z.object({
  day: z.string().describe('O dia do plano (ex: Dia 1, Segunda-feira).'),
  meals: z.array(MealSchema).describe('Uma lista de refeições para o dia.'),
});
export type DailyMealPlan = z.infer<typeof DailyMealPlanSchema>;

const GenerateMealPlanInputSchema = z.object({
  dietType: z.string().optional().describe('O tipo de dieta preferida pelo usuário (ex: equilibrada, low-carb, vegan, keto).'),
  foodIntolerances: z.string().optional().describe('Uma string com intolerâncias alimentares separadas por vírgula (ex: glúten, lactose).'),
  calorieGoal: z.number().optional().describe('A meta calórica diária aproximada do usuário em kcal.'),
  numberOfDays: z.number().min(1).max(7).default(3).describe('O número de dias para o qual o plano deve ser gerado.'),
});
export type GenerateMealPlanInput = z.infer<typeof GenerateMealPlanInputSchema>;

const GenerateMealPlanOutputSchema = z.object({
  mealPlan: z.array(DailyMealPlanSchema).describe('O plano de refeições gerado para o número de dias especificado.'),
  disclaimer: z.string().optional().describe('Um aviso sobre as sugestões serem geradas por IA e a importância de consultar um profissional.'),
});
export type GenerateMealPlanOutput = z.infer<typeof GenerateMealPlanOutputSchema>;

export async function generateMealPlan(input: GenerateMealPlanInput): Promise<GenerateMealPlanOutput> {
  return generateMealPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMealPlanPrompt',
  input: {schema: GenerateMealPlanInputSchema},
  output: {schema: GenerateMealPlanOutputSchema},
  prompt: `Você é um nutricionista virtual especialista em criar planos alimentares personalizados e saudáveis, com foco em complementar rotinas de jejum intermitente.
Sua tarefa é gerar um plano de refeições para o usuário com base nas seguintes preferências:

- Tipo de Dieta: {{{dietType}}} (Se não especificado, assuma uma dieta equilibrada e variada).
- Intolerâncias/Alergias: {{{foodIntolerances}}} (Leve em consideração estas restrições).
- Meta Calórica Diária (aproximada): {{{calorieGoal}}} kcal (Se não especificado, foque em refeições nutritivas e porções moderadas).
- Número de Dias: {{{numberOfDays}}}

Para cada dia do plano, forneça 3 refeições principais: Café da Manhã, Almoço e Jantar.
As descrições das refeições devem ser claras, sugerindo ingredientes e, se possível, uma breve ideia de preparo.
O plano deve ser prático, com alimentos acessíveis e preparações relativamente simples.
Priorize alimentos integrais, proteínas magras, gorduras saudáveis, frutas, verduras e legumes.
Evite alimentos ultraprocessados e excesso de açúcares.

Certifique-se de que a saída corresponda EXATAMENTE ao GenerateMealPlanOutputSchema definido.
Forneça um plano para {{{numberOfDays}}} dias.
Responda em Português Brasileiro.
Inclua um breve aviso (disclaimer) lembrando que as sugestões são geradas por IA e não substituem o aconselhamento de um profissional de saúde ou nutricionista.
`,
});

const generateMealPlanFlow = ai.defineFlow(
  {
    name: 'generateMealPlanFlow',
    inputSchema: GenerateMealPlanInputSchema,
    outputSchema: GenerateMealPlanOutputSchema,
  },
  async (input) => {
    // Adiciona um disclaimer padrão se a IA não gerar um
    const defaultDisclaimer = "Lembre-se: este cardápio é uma sugestão gerada por IA e não substitui o aconselhamento de um nutricionista ou profissional de saúde. Adapte-o às suas necessidades e consulte um especialista.";

    const {output} = await prompt(input);
    
    if (output && !output.disclaimer) {
      return { ...output, disclaimer: defaultDisclaimer };
    }
    return output || { mealPlan: [], disclaimer: defaultDisclaimer };
  }
);

