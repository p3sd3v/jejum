// src/app/(main)/guia/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpenCheck } from "lucide-react";

export default function GuiaPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">Guia do Usuário</h1>
        <p className="text-muted-foreground mt-2">Encontre todas as informações para aproveitar ao máximo o Seca Jejum.</p>
      </header>
      
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpenCheck className="mr-2 h-6 w-6 text-primary" />
            Como Usar o App
          </CardTitle>
          <CardDescription>
            Esta seção conterá um guia detalhado sobre todas as funcionalidades do aplicativo.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">Conteúdo do guia em breve...</p>
        </CardContent>
      </Card>
    </div>
  );
}
