// src/app/(main)/dicas/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function DicasPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">Dicas e Receitas</h1>
        <p className="text-muted-foreground mt-2">Informações valiosas para sua jornada de jejum.</p>
      </header>
      
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="mr-2 h-6 w-6 text-primary" />
            Conteúdo Exclusivo
          </CardTitle>
          <CardDescription>
            Esta seção trará dicas, artigos e receitas para auxiliar no seu jejum (Em breve).
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">Dicas e receitas em breve...</p>
        </CardContent>
      </Card>

       {/* AISuggestionForm can be moved here if "Dicas" should include AI suggestions */}
       {/* <AISuggestionForm /> */}
    </div>
  );
}
