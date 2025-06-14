
"use client";

import React, { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserMealPreferences, type UserProfile } from '@/actions/userProfileActions';
import { Loader2 } from 'lucide-react';

const mealPlannerFormSchema = z.object({
  dietType: z.string().optional(),
  foodIntolerances: z.string().optional(),
  calorieGoal: z.coerce.number().positive("Meta calórica deve ser positiva").optional(),
});

type MealPlannerFormValues = z.infer<typeof mealPlannerFormSchema>;

interface MealPlannerFormProps {
  onPreferencesSaved?: () => void;
}

const MealPlannerForm: React.FC<MealPlannerFormProps> = ({ onPreferencesSaved }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  const form = useForm<MealPlannerFormValues>({
    resolver: zodResolver(mealPlannerFormSchema),
  });

  useEffect(() => {
    if (currentUser) {
      setIsFetchingProfile(true);
      getUserProfile(currentUser.uid)
        .then(profile => {
          if (profile?.mealPreferences) {
            form.reset({
              dietType: profile.mealPreferences.dietType || '',
              foodIntolerances: profile.mealPreferences.foodIntolerances || '',
              calorieGoal: profile.mealPreferences.calorieGoal,
            });
          }
        })
        .catch(err => {
          console.error("Failed to fetch meal preferences", err);
          toast({ title: "Erro", description: "Não foi possível carregar suas preferências alimentares.", variant: "destructive" });
        })
        .finally(() => setIsFetchingProfile(false));
    } else {
      setIsFetchingProfile(false);
    }
  }, [currentUser, form, toast]);

  const onSubmit: SubmitHandler<MealPlannerFormValues> = async (data) => {
    if (!currentUser) {
      toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await updateUserMealPreferences(currentUser.uid, data);
      toast({ title: "Preferências Salvas!", description: "Suas preferências alimentares foram atualizadas.", className: "bg-success text-success-foreground" });
      if (onPreferencesSaved) {
        onPreferencesSaved();
      }
    } catch (error: any) {
      toast({ title: "Erro ao Salvar", description: error.message || "Não foi possível salvar suas preferências.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingProfile) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Carregando preferências...</div>;
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-primary">Suas Preferências Alimentares</CardTitle>
        <CardDescription>Nos ajude a personalizar suas sugestões de cardápio.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="dietType">Tipo de Dieta Preferida</Label>
            <Select onValueChange={(value) => form.setValue('dietType', value)} defaultValue={form.getValues('dietType')}>
              <SelectTrigger id="dietType"><SelectValue placeholder="Selecione um tipo de dieta..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="balanced">Equilibrada</SelectItem>
                <SelectItem value="low-carb">Low-Carb</SelectItem>
                <SelectItem value="keto">Cetogênica</SelectItem>
                <SelectItem value="vegan">Vegana</SelectItem>
                <SelectItem value="vegetarian">Vegetariana</SelectItem>
                <SelectItem value="paleo">Paleo</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.dietType && <p className="text-sm text-destructive mt-1">{form.formState.errors.dietType.message}</p>}
          </div>

          <div>
            <Label htmlFor="foodIntolerances">Intolerâncias ou Alergias Alimentares (separadas por vírgula)</Label>
            <Textarea
              id="foodIntolerances"
              {...form.register('foodIntolerances')}
              placeholder="Ex: glúten, lactose, amendoim"
              rows={3}
            />
            {form.formState.errors.foodIntolerances && <p className="text-sm text-destructive mt-1">{form.formState.errors.foodIntolerances.message}</p>}
          </div>

          <div>
            <Label htmlFor="calorieGoal">Meta Calórica Diária Aproximada (kcal)</Label>
            <Input
              id="calorieGoal"
              type="number"
              {...form.register('calorieGoal')}
              placeholder="Ex: 1800"
            />
            {form.formState.errors.calorieGoal && <p className="text-sm text-destructive mt-1">{form.formState.errors.calorieGoal.message}</p>}
          </div>

          <Button type="submit" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading || !currentUser}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Salvar Preferências
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MealPlannerForm;
