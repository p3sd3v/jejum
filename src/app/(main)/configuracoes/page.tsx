
// src/app/(main)/configuracoes/page.tsx
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react"; // Using Palette as a general settings icon

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">Configurações</h1>
        <p className="text-muted-foreground mt-2">Ajuste as preferências do aplicativo.</p>
      </header>
      
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="mr-2 h-6 w-6 text-primary" />
            Aparência
          </CardTitle>
          <CardDescription>
            Escolha o tema visual do aplicativo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSwitcher />
        </CardContent>
      </Card>

      {/* Add more settings sections here as needed */}
      {/* 
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-6 w-6 text-primary" />
            Notificações
          </CardTitle>
          <CardDescription>
            Gerencie suas preferências de notificação (Em breve).
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[100px] flex items-center justify-center">
          <p className="text-muted-foreground">Configurações de notificação em breve...</p>
        </CardContent>
      </Card>
      */}
    </div>
  );
}
