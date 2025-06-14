// src/app/(main)/planejamento/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Utensils } from "lucide-react";

export default function PlanejamentoPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">Planejamento de Refeições</h1>
        <p className="text-muted-foreground mt-2">Organize suas refeições para otimizar seus jejuns.</p>
      </header>
      
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Utensils className="mr-2 h-6 w-6 text-primary" />
            Planejador Semanal
          </CardTitle>
          <CardDescription>
            Esta funcionalidade está em desenvolvimento. Em breve você poderá planejar suas refeições aqui!
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">Conteúdo do planejamento de refeições em breve...</p>
        </CardContent>
      </Card>
    </div>
  );
}
