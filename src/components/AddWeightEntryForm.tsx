
"use client";

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { addWeightEntry } from '@/actions/weightActions';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const addWeightSchema = z.object({
  weight: z.coerce.number().positive("O peso deve ser um número positivo."),
  date: z.date({ required_error: "A data é obrigatória." }),
  unit: z.enum(['kg', 'lbs']).optional().default('kg'),
});

type AddWeightFormValues = z.infer<typeof addWeightSchema>;

interface AddWeightEntryFormProps {
  onWeightAdded?: () => void;
  // onOpenChange prop is removed as this form will be inline
}

const AddWeightEntryForm: React.FC<AddWeightEntryFormProps> = ({ onWeightAdded }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AddWeightFormValues>({
    resolver: zodResolver(addWeightSchema),
    defaultValues: {
      date: new Date(),
      unit: 'kg',
      weight: undefined, // Ensure weight is initially undefined for the placeholder
    },
  });

  const onSubmit: SubmitHandler<AddWeightFormValues> = async (data) => {
    if (!currentUser) {
      toast({ title: "Erro", description: "Você precisa estar logado para registrar o peso.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await addWeightEntry(currentUser.uid, data.weight, data.date, data.unit);
      toast({ title: "Sucesso!", description: "Peso registrado com sucesso.", className: "bg-success text-success-foreground" });
      form.reset({ date: new Date(), weight: undefined, unit: 'kg' });
      if (onWeightAdded) {
        onWeightAdded();
      }
    } catch (error: any) {
      toast({ title: "Erro ao Registrar Peso", description: error.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="weight" className="sr-only">Peso ({form.watch('unit')})</Label>
        <Input 
          id="weight" 
          type="number" 
          step="0.1" 
          {...form.register('weight')} 
          placeholder={`Digite seu peso (ex: 70.5 ${form.watch('unit')})`} 
          disabled={isLoading} 
          className="text-lg p-3"
        />
        {form.formState.errors.weight && <p className="text-sm text-destructive mt-1">{form.formState.errors.weight.message}</p>}
      </div>
      
      <div>
        <Label htmlFor="date" className="sr-only">Data</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal text-lg p-3",
                !form.watch('date') && "text-muted-foreground"
              )}
              disabled={isLoading}
            >
              <CalendarIcon className="mr-2 h-5 w-5" />
              {form.watch('date') ? format(form.watch('date'), "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card border-border shadow-lg">
            <Calendar
              mode="single"
              selected={form.watch('date')}
              onSelect={(date) => date && form.setValue('date', date, { shouldValidate: true })}
              initialFocus
              locale={ptBR}
              disabled={(date) => date > new Date() || date < new Date("2000-01-01") || isLoading}
            />
          </PopoverContent>
        </Popover>
        {form.formState.errors.date && <p className="text-sm text-destructive mt-1">{form.formState.errors.date.message}</p>}
      </div>

      <Button type="submit" className="w-full bg-success hover:bg-success/90 text-success-foreground text-lg py-6" disabled={isLoading || !currentUser?.uid}>
        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
        Salvar Peso
      </Button>
    </form>
  );
};

export default AddWeightEntryForm;

    