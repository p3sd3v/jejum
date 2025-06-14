// src/app/(main)/dicas/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function DicasPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">Dicas & Insights</h1>
        <p className="text-muted-foreground mt-2">Conselhos e informações para otimizar seu jejum e bem-estar.</p>
      </header>
      
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="mr-2 h-6 w-6 text-primary" />
            Dica da Semana
          </CardTitle>
          <CardDescription>
            Hidrate-se! Beber água, chás sem açúcar ou café puro durante o jejum ajuda a controlar a fome e manter a energia.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[150px] flex items-center justify-center">
          <p className="text-muted-foreground">Mais dicas em breve...</p>
        </CardContent>
      </Card>

      {/* Placeholder for more tip cards or sections */}
      {/* 
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle>Tip Title 2</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Content for tip 2...</p>
        </CardContent>
      </Card>
      */}
    </div>
  );
}
