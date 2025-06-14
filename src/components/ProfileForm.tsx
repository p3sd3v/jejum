
"use client";
import React, { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile, getUserProfile, type UserProfile } from '@/actions/userProfileActions';
import { Loader2, Bell } from 'lucide-react';

const profileFormSchema = z.object({
  fastingGoalHours: z.coerce.number().min(12, "Mínimo 12 horas").max(72, "Máximo 72 horas").optional(),
  age: z.coerce.number().min(18, "Mínimo 18 anos").max(100, "Máximo 100 anos").optional(),
  gender: z.string().optional(),
  activityLevel: z.string().optional(),
  sleepSchedule: z.string().optional(),
  dailyRoutine: z.string().optional(),
  fastingExperience: z.string().optional(),
  emailNotifications: z.object({
    notifyOnFastStart: z.boolean().optional(),
    notifyOnFastEnd: z.boolean().optional(),
    preferredFastStartTime: z.string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato HH:MM inválido (ex: 20:00)")
      .optional()
      .or(z.literal('')), // Allow empty string
  }).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileForm: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fastingGoalHours: 16,
      emailNotifications: {
        notifyOnFastStart: false,
        notifyOnFastEnd: false,
        preferredFastStartTime: '',
      }
    }
  });

  const watchNotifyOnFastStart = form.watch('emailNotifications.notifyOnFastStart');

  useEffect(() => {
    if (currentUser) {
      setIsFetchingProfile(true);
      getUserProfile(currentUser.uid)
        .then(profile => {
          if (profile) {
            form.reset({
              fastingGoalHours: profile.fastingGoalHours || 16,
              age: profile.aiProfile?.age,
              gender: profile.aiProfile?.gender,
              activityLevel: profile.aiProfile?.activityLevel,
              sleepSchedule: profile.aiProfile?.sleepSchedule,
              dailyRoutine: profile.aiProfile?.dailyRoutine,
              fastingExperience: profile.aiProfile?.fastingExperience,
              emailNotifications: {
                notifyOnFastStart: profile.emailNotifications?.notifyOnFastStart || false,
                notifyOnFastEnd: profile.emailNotifications?.notifyOnFastEnd || false,
                preferredFastStartTime: profile.emailNotifications?.preferredFastStartTime || '',
              }
            });
          }
        })
        .catch(err => {
          console.error("Failed to fetch profile", err);
          toast({ title: "Erro", description: "Não foi possível carregar o perfil.", variant: "destructive" });
        })
        .finally(() => setIsFetchingProfile(false));
    }
  }, [currentUser, form, toast]);

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      // Construct the profile data to update, ensuring nested objects are handled correctly
      const profileUpdateData: Partial<UserProfile> = {
        fastingGoalHours: data.fastingGoalHours,
        aiProfile: {
          age: data.age,
          gender: data.gender,
          activityLevel: data.activityLevel,
          sleepSchedule: data.sleepSchedule,
          dailyRoutine: data.dailyRoutine,
          fastingExperience: data.fastingExperience,
        },
        emailNotifications: {
          notifyOnFastStart: data.emailNotifications?.notifyOnFastStart,
          notifyOnFastEnd: data.emailNotifications?.notifyOnFastEnd,
          preferredFastStartTime: data.emailNotifications?.preferredFastStartTime,
        }
      };
      
      await updateUserProfile(currentUser.uid, profileUpdateData);
      toast({ title: "Sucesso!", description: "Seu perfil foi atualizado.", className: "bg-success text-success-foreground" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Não foi possível atualizar o perfil.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingProfile) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Configurações do Perfil</CardTitle>
        <CardDescription>Ajuste suas metas de jejum, informações para IA e preferências de notificação.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <h3 className="text-lg font-medium font-headline mb-4 text-primary">Meta de Jejum</h3>
            <div className="space-y-2">
              <Label htmlFor="fastingGoalHours">Horas de Jejum Diárias</Label>
              <Input id="fastingGoalHours" type="number" {...form.register('fastingGoalHours')} />
              {form.formState.errors.fastingGoalHours && <p className="text-sm text-destructive">{form.formState.errors.fastingGoalHours.message}</p>}
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <h3 className="text-lg font-medium font-headline mb-4 text-primary">Perfil para Sugestões de IA</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <Input id="age" type="number" {...form.register('age')} />
                {form.formState.errors.age && <p className="text-sm text-destructive">{form.formState.errors.age.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gênero</Label>
                <Select onValueChange={(value) => form.setValue('gender', value)} defaultValue={form.getValues('gender')}>
                  <SelectTrigger id="gender"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityLevel">Nível de Atividade</Label>
                <Select onValueChange={(value) => form.setValue('activityLevel', value)} defaultValue={form.getValues('activityLevel')}>
                  <SelectTrigger id="activityLevel"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentário</SelectItem>
                    <SelectItem value="light">Leve</SelectItem>
                    <SelectItem value="moderate">Moderado</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="very_active">Muito Ativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fastingExperience">Experiência com Jejum</Label>
                 <Select onValueChange={(value) => form.setValue('fastingExperience', value)} defaultValue={form.getValues('fastingExperience')}>
                  <SelectTrigger id="fastingExperience"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="sleepSchedule">Horário de Sono Típico (ex: 22:00 - 06:00)</Label>
                <Input id="sleepSchedule" type="text" {...form.register('sleepSchedule')} placeholder="Ex: 22:00 - 06:00"/>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="dailyRoutine">Rotina Diária (refeições, treinos)</Label>
                <Textarea id="dailyRoutine" {...form.register('dailyRoutine')} placeholder="Descreva sua rotina diária..."/>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-8">
            <h3 className="text-lg font-medium font-headline mb-4 text-primary flex items-center">
              <Bell className="mr-2 h-5 w-5"/>
              Notificações por Email
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="notifyOnFastStart" 
                  checked={form.watch('emailNotifications.notifyOnFastStart')}
                  onCheckedChange={(checked) => form.setValue('emailNotifications.notifyOnFastStart', checked)}
                />
                <Label htmlFor="notifyOnFastStart">Lembrete para iniciar o jejum</Label>
              </div>
              {watchNotifyOnFastStart && (
                <div className="space-y-2 pl-8">
                  <Label htmlFor="preferredFastStartTime">Horário preferido para iniciar (HH:MM)</Label>
                  <Input 
                    id="preferredFastStartTime" 
                    type="time" 
                    {...form.register('emailNotifications.preferredFastStartTime')} 
                  />
                  {form.formState.errors.emailNotifications?.preferredFastStartTime && <p className="text-sm text-destructive">{form.formState.errors.emailNotifications.preferredFastStartTime.message}</p>}
                </div>
              )}
              <div className="flex items-center space-x-2">
                 <Switch 
                  id="notifyOnFastEnd"
                  checked={form.watch('emailNotifications.notifyOnFastEnd')}
                  onCheckedChange={(checked) => form.setValue('emailNotifications.notifyOnFastEnd', checked)}
                />
                <Label htmlFor="notifyOnFastEnd">Aviso quando o jejum terminar</Label>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Obs: O envio real dos emails requer configuração de backend (Firebase Functions e serviço de email) que não está incluída.
            </p>
          </div>
          
          <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground w-full md:w-auto" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Salvar Alterações
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;

