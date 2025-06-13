
import AISuggestionForm from '@/components/AISuggestionForm';

export default function SuggestionsPage() {
  return (
    <div className="space-y-8">
       <header>
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">Sugestões com IA</h1>
        <p className="text-muted-foreground mt-2">Receba recomendações de horários de jejum baseadas no seu perfil e rotina.</p>
      </header>
      <AISuggestionForm />
    </div>
  );
}
