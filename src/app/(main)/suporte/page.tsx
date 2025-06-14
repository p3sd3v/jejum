// src/app/(main)/suporte/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HelpCircle, Mail } from "lucide-react";

export default function SuportePage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">Suporte</h1>
        <p className="text-muted-foreground mt-2">Precisa de ajuda? Entre em contato conosco.</p>
      </header>
      
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <HelpCircle className="mr-2 h-6 w-6 text-primary" />
            Central de Ajuda
          </CardTitle>
          <CardDescription>
            Informações de contato.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Se você tiver alguma dúvida ou problema, nossa equipe de suporte está pronta para ajudar.</p>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-primary" />
            <a href="mailto:secajejumofcial@gmail.com" className="text-accent hover:underline">
              secajejumofcial@gmail.com
            </a>
          </div>
          <p className="text-muted-foreground text-sm">
            Responderemos o mais breve possível.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
