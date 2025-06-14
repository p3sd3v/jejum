
"use client";
import React, { useState, useEffect, useCallback } from 'react';
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
import { Loader2, Sparkles, Lightbulb, AlertTriangle, History, CalendarDays } from 'lucide-react';
import { createAISuggestionRequest, getAISuggestionHistory } from '@/actions/aiSuggestionActions';
import type { SuggestFastingTimesInput } from '@/ai/flows/suggest-fasting-times';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserAIProfile } from '@/actions/userProfileActions';
import { doc, onSnapshot, Unsubscribe, Timestamp } from 'firebase/firestore'; // Added Timestamp
import { db } from '@/lib/firebase';
import type { AISuggestionRequest, ClientAISuggestionRequest } from '@/actions/aiSuggestionTypes';
import { toClientAISuggestionRequest } from '@/actions/aiSuggestionTypes';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from './ui/scroll-area';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [currentSuggestionRequest, setCurrentSuggestionRequest] = useState<ClientAISuggestionRequest | null>(null);
  const [suggestionHistory, setSuggestionHistory] = useState<ClientAISuggestionRequest[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { toast } = useToast();

  const form = useForm<AISuggestionFormValues>({
    resolver: zodResolver(aiSuggestionFormSchema),
  });

  const fetchHistory = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingHistory(true);
    try {
      const history = await getAISuggestionHistory(currentUser.uid);
      setSuggestionHistory(history);
    } catch (error) {
      console.error("Failed to fetch suggestion history", error);
      toast({ title: "Erro ao Carregar Histórico", description: "Não foi possível buscar o histórico de sugestões.", variant: "destructive" });
      setSuggestionHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [currentUser, toast]);

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
      
      fetchHistory();
    } else {
      setIsFetchingProfile(false);
      setIsLoadingHistory(false);
    }
  }, [currentUser, form, fetchHistory]);

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    if (currentUser && currentSuggestionRequest?.id && (currentSuggestionRequest.status === 'pending' || currentSuggestionRequest.status === 'processing')) {
      const requestDocRef = doc(db, 'ai_suggestion_requests', currentSuggestionRequest.id);
      unsubscribe = onSnapshot(requestDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Ensure Timestamps are handled correctly before passing to toClientAISuggestionRequest
           if (data && data.createdAt instanceof Timestamp && data.updatedAt instanceof Timestamp) {
            const firestoreData = data as Omit<AISuggestionRequest, 'id'>; // Cast after checking
            const clientData = toClientAISuggestionRequest(docSnap.id, firestoreData);
            setCurrentSuggestionRequest(clientData);

            if (clientData.status === 'completed') {
              toast({ title: "Sugestão Gerada!", description: "Confira a sugestão personalizada para você." });
              fetchHistory(); 
              if (unsubscribe) unsubscribe();
            } else if (clientData.status === 'error') {
              toast({ title: "Erro ao Processar Sugestão", description: clientData.error || "Ocorreu um erro no servidor.", variant: "destructive" });
              fetchHistory(); 
              if (unsubscribe) unsubscribe();
            }
          } else {
             console.warn("Suggestion document data is malformed or missing Timestamps, cannot process update:", docSnap.id, JSON.stringify(data, null, 2));
             // Optionally, set status to error if data is unusable
          }
        } else {
          toast({ title: "Erro", description: "Solicitação de sugestão não encontrada.", variant: "destructive" });
          setCurrentSuggestionRequest(null);
          fetchHistory(); 
          if (unsubscribe) unsubscribe();
        }
      }, (error) => {
        console.error("Error listening to suggestion request:", error);
        toast({ title: "Erro de Conexão", description: "Não foi possível ouvir as atualizações da sugestão.", variant: "destructive" });
        setCurrentSuggestionRequest(prev => prev ? {...prev, status: 'error', error: 'Erro de conexão'} : null);
        fetchHistory(); 
        if (unsubscribe) unsubscribe();
      });
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentSuggestionRequest?.id, currentSuggestionRequest?.status, currentUser, toast, fetchHistory]);


  const onSubmit: SubmitHandler<AISuggestionFormValues> = async (data) => {
    if (!currentUser) {
      toast({ title: "Usuário não autenticado", description: "Faça login para obter sugestões.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    setCurrentSuggestionRequest(null);

    const input: SuggestFastingTimesInput = { userProfile: data };

    try {
      const requestId = await createAISuggestionRequest(currentUser.uid, input);
      setCurrentSuggestionRequest({
        id: requestId,
        userId: currentUser.uid,
        userInput: data,
        status: 'pending', 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast({ title: "Solicitação Enviada!", description: "Sua sugestão está sendo processada. Aguarde..." });
      await updateUserAIProfile(currentUser.uid, data);
    } catch (error: any) {
      toast({ title: "Erro ao Solicitar Sugestão", description: error.message, variant: "destructive" });
      setCurrentSuggestionRequest(null);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isFetchingProfile && currentUser) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Carregando perfil...</div>;
  }

  const isProcessingCurrent = currentSuggestionRequest?.status === 'pending' || currentSuggestionRequest?.status === 'processing';

  const getStatusBadgeVariant = (status: ClientAISuggestionRequest['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'error':
        return 'destructive';
      case 'pending':
      case 'processing':
        return 'secondary'; 
      default:
        return 'outline';
    }
  };


  return (
    <>
      <Card className="w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <Lightbulb className="mr-2 h-7 w-7 text-primary" />
            Sugestões Inteligentes de Jejum
          </CardTitle>
          <CardDescription>
            Preencha seu perfil para receber sugestões de horários de jejum personalizadas pela nossa IA.
            A sugestão será processada em segundo plano e aparecerá abaixo quando pronta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="age">Idade</Label>
                <Input id="age" type="number" {...form.register('age')} disabled={isSubmitting || isProcessingCurrent} />
                {form.formState.errors.age && <p className="text-sm text-destructive">{form.formState.errors.age.message}</p>}
              </div>
              <div>
                <Label htmlFor="gender">Gênero</Label>
                <Select onValueChange={(value) => form.setValue('gender', value)} defaultValue={form.getValues('gender')} disabled={isSubmitting || isProcessingCurrent}>
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
                <Select onValueChange={(value) => form.setValue('activityLevel', value)} defaultValue={form.getValues('activityLevel')} disabled={isSubmitting || isProcessingCurrent}>
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
                <Select onValueChange={(value) => form.setValue('fastingExperience', value)} defaultValue={form.getValues('fastingExperience')} disabled={isSubmitting || isProcessingCurrent}>
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
                <Input id="sleepSchedule" type="text" {...form.register('sleepSchedule')} placeholder="Ex: 22:30 - 07:00" disabled={isSubmitting || isProcessingCurrent}/>
                {form.formState.errors.sleepSchedule && <p className="text-sm text-destructive">{form.formState.errors.sleepSchedule.message}</p>}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="dailyRoutine">Rotina Diária</Label>
                <Textarea id="dailyRoutine" {...form.register('dailyRoutine')} placeholder="Descreva seus horários de refeição, trabalho, exercícios, etc." rows={4} disabled={isSubmitting || isProcessingCurrent}/>
                {form.formState.errors.dailyRoutine && <p className="text-sm text-destructive">{form.formState.errors.dailyRoutine.message}</p>}
              </div>
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting || isFetchingProfile || isProcessingCurrent}>
              {(isSubmitting || isProcessingCurrent) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {isProcessingCurrent ? 'Processando Sugestão...' : isSubmitting ? 'Enviando Solicitação...' : 'Obter Sugestão da IA'}
            </Button>
          </form>
        </CardContent>
        {currentSuggestionRequest && currentSuggestionRequest.status === 'completed' && currentSuggestionRequest.suggestionOutput && (
          <CardFooter className="mt-6 border-t border-border pt-6">
            <div className="space-y-4 w-full">
              <h3 className="text-xl font-headline text-primary">Sugestão Personalizada Recebida:</h3>
              <p><strong className="font-medium">Início do Jejum:</strong> {currentSuggestionRequest.suggestionOutput.suggestedStartTime}</p>
              <p><strong className="font-medium">Fim do Jejum:</strong> {currentSuggestionRequest.suggestionOutput.suggestedEndTime}</p>
              <p className="text-sm break-words"><strong className="font-medium">Raciocínio:</strong> {currentSuggestionRequest.suggestionOutput.reasoning}</p>
            </div>
          </CardFooter>
        )}
        {currentSuggestionRequest && currentSuggestionRequest.status === 'error' && (
           <CardFooter className="mt-6 border-t border-border pt-6">
            <div className="space-y-2 w-full text-destructive">
              <h3 className="text-xl font-headline flex items-center"><AlertTriangle className="mr-2 h-6 w-6"/>Erro na Sugestão Atual</h3>
              <p className="break-words">{currentSuggestionRequest.error || "Não foi possível gerar sua sugestão no momento. Tente novamente mais tarde."}</p>
            </div>
          </CardFooter>
        )}
         {isProcessingCurrent && (
           <CardFooter className="mt-6 border-t border-border pt-6">
              <div className="flex items-center text-muted-foreground w-full justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
                  <span>Sua sugestão está sendo preparada pela IA. Isso pode levar alguns instantes...</span>
              </div>
          </CardFooter>
        )}
      </Card>

      <Card className="mt-8 w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center">
            <History className="mr-2 h-6 w-6 text-primary" />
            Histórico de Sugestões
          </CardTitle>
          <CardDescription>
            Aqui são exibidas todas as suas solicitações de sugestões da IA, com seus respectivos status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Carregando histórico...</div>
          ) : suggestionHistory.length > 0 ? (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {suggestionHistory.map((item) => (
                  <Card key={item.id} className="p-4 bg-card shadow-sm">
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start mb-2">
                      <p className="text-sm text-muted-foreground flex items-center">
                        <CalendarDays className="h-4 w-4 mr-1.5 flex-shrink-0" />
                        {format(new Date(item.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                       <Badge variant={getStatusBadgeVariant(item.status)} className="capitalize self-start sm:self-auto">
                        {item.status === 'pending' ? 'Pendente' : 
                         item.status === 'processing' ? 'Processando' :
                         item.status === 'completed' ? 'Concluído' :
                         'Erro'}
                      </Badge>
                    </div>
                    {/* "Perfil Usado" section removed as per request */}
                    {item.status === 'completed' && item.suggestionOutput && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-sm"><strong className="font-medium text-primary">Sugestão:</strong> Início: {item.suggestionOutput.suggestedStartTime}, Fim: {item.suggestionOutput.suggestedEndTime}</p>
                        <p className="text-xs text-muted-foreground mt-1 break-words"><strong className="font-medium">Raciocínio:</strong> {item.suggestionOutput.reasoning}</p>
                      </div>
                    )}
                    {item.status === 'error' && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-sm text-destructive break-words">
                          <strong className="font-medium">Erro:</strong> {item.error || "Detalhes do erro não disponíveis."}
                        </p>
                      </div>
                    )}
                     {(item.status === 'pending' || item.status === 'processing') && (
                       <div className="mt-2 pt-2 border-t border-border/50">
                         <p className="text-sm text-muted-foreground">Aguardando processamento da IA...</p>
                       </div>
                     )}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhuma sugestão no histórico ainda.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default AISuggestionForm;
