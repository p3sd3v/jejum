
// src/app/(main)/desafios/page.tsx
import ChallengesDisplay from "@/components/ChallengesDisplay";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function DesafiosPage() {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <Trophy className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">Desafios de Jejum</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Participe dos desafios e ganhe pontos ao alcançar suas metas de jejum diárias! 
          Os desafios são uma ótima maneira de se manter motivado e alcançar seus objetivos de forma saudável.
        </p>
      </header>
      
      <ChallengesDisplay />

      <Card className="bg-card shadow-lg mt-8">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-primary">Recompensas (Em Breve!)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Continue acumulando pontos! Em breve, você poderá trocá-los por recompensas incríveis, como:
          </p>
          <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
            <li>Medalhas digitais e badges exclusivos.</li>
            <li>Acesso a conteúdos premium: dicas de refeições, receitas e guias avançados.</li>
            <li>Desbloqueio de desafios mais avançados.</li>
            <li>Participação em desafios de comunidade.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
