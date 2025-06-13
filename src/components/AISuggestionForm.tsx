
"use client";
import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Lightbulb } from 'lucide-react';
import { getAISuggestions } from '@/actions/aiSuggestionActions';
import type { SuggestFastingTimesInput, SuggestFastingTimesOutput } from '@/ai/flows/suggest-fasting-times';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserAIProfile, type UserProfile } from '@/actions/userProfileActions';


const aiSuggestionFormSchema = z.object({
  age: z.coerce.number().min(18, "Mínimo 18 anos").max(100, "Máximo 100 anos"),
  gender: z.string().nonempty("Gênero é obrigatório."),
  activityLevel: z.string().nonempty("Nível de atividade é obrigatório."),
  sleepSchedule: z.string().nonempty("Horário de sono é obrigatório."),
  dailyRoutine: z.string().nonempty("Rotina diária é obrigatória.").min(20, "Descreva com mais detalhes (mín. 20 caracteres)."),
  fastingExperience: z.string().nonempty("Experiência com jejum é obrigatória."),
});

type AISuggestionFormValues = z.infer<typeof aiSuggestionFormSchema>;

const AISuggestionForm: React.FC = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [suggestion, setSuggestion] = useState<SuggestFastingTimesOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<AISuggestionFormValues>({
    resolver: zodResolver(aiSuggestionFormSchema),
  });

  useEffect(() => {
    if (currentUser) {
      setIsFetchingProfile(true);
      getUserProfile(currentUser.uid)
        .then(profile => {
          if (profile?.aiProfile) {
            form.reset({
              age: profile.aiProfile.age,
              gender: profile.aiProfile.gender,
              activityLevel: profile.aiProfile.activityLevel,
              sleepSchedule: profile.aiProfile.sleepSchedule,
              dailyRoutine: profile.aiProfile.dailyRoutine,
              fastingExperience: profile.aiProfile.fastingExperience,
            });
          }
        })
        .catch(err => console.error("Failed to prefill form from profile", err))
        .finally(() => setIsFetchingProfile(false));
    }
  }, [currentUser, form]);


  const onSubmit: SubmitHandler<AISuggestionFormValues> = async (data) => {
    setIsLoading(true);
    setSuggestion(null);

    const input: SuggestFastingTimesInput = { userProfile: data };

    try {
      const result = await getAISuggestions(input);
      setSuggestion(result);
      toast({ title: "Sugestão Gerada!", description: "Confira a sugestão personalizada para você." });
      // Optionally save the used profile data to user's profile
      if (currentUser) {
        await updateUserAIProfile(currentUser.uid, data);
      }
    } catch (error: any) {
      toast({ title: "Erro ao Gerar Sugestão", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isFetchingProfile && currentUser) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Carregando perfil...</div>;
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center">
          <Lightbulb className="mr-2 h-7 w-7 text-primary" />
          Sugestões Inteligentes de Jejum
        </CardTitle>
        <CardDescription>
          Preencha seu perfil para receber sugestões de horários de jejum personalizadas pela nossa IA.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="age">Idade</Label>
              <Input id="age" type="number" {...form.register('age')} disabled={isLoading} />
              {form.formState.errors.age && <p className="text-sm text-destructive">{form.formState.errors.age.message}</p>}
            </div>
            <div>
              <Label htmlFor="gender">Gênero</Label>
              <Select onValueChange={(value) => form.setValue('gender', value)} defaultValue={form.getValues('gender')} disabled={isLoading}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                  <SelectItem value="other">Prefiro não dizer / Outro</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.gender && <p className="text-sm text-destructive">{form.formState.errors.gender.message}</p>}
            </div>
            <div>
              <Label htmlFor="activityLevel">Nível de Atividade Física</Label>
              <Select onValueChange={(value) => form.setValue('activityLevel', value)} defaultValue={form.getValues('activityLevel')} disabled={isLoading}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentário (pouco ou nenhum exercício)</SelectItem>
                  <SelectItem value="light">Leve (exercício leve 1-3 dias/semana)</SelectItem>
                  <SelectItem value="moderate">Moderado (exercício moderado 3-5 dias/semana)</SelectItem>
                  <SelectItem value="active">Ativo (exercício intenso 6-7 dias/semana)</SelectItem>
                  <SelectItem value="very_active">Muito Ativo (trabalho físico ou exercício muito intenso)</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.activityLevel && <p className="text-sm text-destructive">{form.formState.errors.activityLevel.message}</p>}
            </div>
            <div>
              <Label htmlFor="fastingExperience">Experiência com Jejum</Label>
              <Select onValueChange={(value) => form.setValue('fastingExperience', value)} defaultValue={form.getValues('fastingExperience')} disabled={isLoading}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Iniciante (nunca fiz ou poucas vezes)</SelectItem>
                  <SelectItem value="intermediate">Intermediário (faço regularmente)</SelectItem>
                  <SelectItem value="advanced">Avançado (muita experiência, jejuns longos)</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.fastingExperience && <p className="text-sm text-destructive">{form.formState.errors.fastingExperience.message}</p>}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="sleepSchedule">Horário de Sono (ex: 22:00 - 06:00)</Label>
              <Input id="sleepSchedule" type="text" {...form.register('sleepSchedule')} placeholder="Ex: 22:30 - 07:00" disabled={isLoading}/>
              {form.formState.errors.sleepSchedule && <p className="text-sm text-destructive">{form.formState.errors.sleepSchedule.message}</p>}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="dailyRoutine">Rotina Diária</Label>
              <Textarea id="dailyRoutine" {...form.register('dailyRoutine')} placeholder="Descreva seus horários de refeição, trabalho, exercícios, etc." rows={4} disabled={isLoading}/>
              {form.formState.errors.dailyRoutine && <p className="text-sm text-destructive">{form.formState.errors.dailyRoutine.message}</p>}
            </div>
          </div>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading || isFetchingProfile}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Obter Sugestão da IA
          </Button>
        </form>
      </CardContent>
      {suggestion && (
        <CardFooter className="mt-6 border-t border-border pt-6">
          <div className="space-y-4 w-full">
            <h3 className="text-xl font-headline text-primary">Sugestão Personalizada:</h3>
            <p><strong className="font-medium">Início do Jejum:</strong> {suggestion.suggestedStartTime}</p>
            <p><strong className="font-medium">Fim do Jejum:</strong> {suggestion.suggestedEndTime}</p>
            <p className="text-sm"><strong className="font-medium">Raciocínio:</strong> {suggestion.reasoning}</p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default AISuggestionForm;
