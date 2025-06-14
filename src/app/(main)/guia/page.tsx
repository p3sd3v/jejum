
// src/app/(main)/guia/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  BookOpenCheck, 
  LayoutDashboard, 
  ListChecks, 
  TrendingUp, 
  ShieldCheck, 
  Brain, 
  UserCircle, 
  Settings,
  Palette
} from "lucide-react";

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
            <BookOpenCheck className="mr-3 h-7 w-7 text-primary" />
            Como Usar o Seca Jejum
          </CardTitle>
          <CardDescription>
            Navegue pelas seções abaixo para entender cada funcionalidade do aplicativo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full space-y-3">
            
            {/* Seção: Meu Jejum (Dashboard) */}
            <AccordionItem value="meu-jejum" className="border border-border rounded-lg">
              <AccordionTrigger className="p-4 hover:no-underline text-lg font-semibold text-primary">
                <div className="flex items-center">
                  <LayoutDashboard className="mr-3 h-6 w-6" /> Meu Jejum (Dashboard)
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0 text-foreground/90 space-y-2">
                <p>Esta é sua central de comando para o jejum atual e acompanhamento de peso.</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><strong>Cronômetro do Jejum:</strong> Inicie, acompanhe e finalize seus períodos de jejum. Defina metas de duração ao iniciar um novo jejum.</li>
                  <li><strong>Registro de Peso:</strong> Adicione seu peso diário de forma rápida. Veja seu último peso registrado para fácil referência.</li>
                  <li><strong>Progresso de Emagrecimento:</strong> Visualize um gráfico com seu histórico de peso, permitindo filtrar por dia, semana ou mês.</li>
                  <li><strong>Lembretes:</strong> A seção de rodapé menciona que lembretes futuros (iniciar jejum, registrar peso, etc.) serão gerenciados via Firebase Cloud Messaging.</li>
                </ul>
                <p className="text-xs text-muted-foreground pt-2">Dica: Mantenha seus registros de peso atualizados para melhor visualização do seu progresso!</p>
              </AccordionContent>
            </AccordionItem>

            {/* Seção: Planejamento */}
            <AccordionItem value="planejamento" className="border border-border rounded-lg">
              <AccordionTrigger className="p-4 hover:no-underline text-lg font-semibold text-primary">
                <div className="flex items-center">
                 <ListChecks className="mr-3 h-6 w-6" /> Planejamento de Refeições
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0 text-foreground/90 space-y-2">
                <p>Receba sugestões de cardápios personalizadas pela Inteligência Artificial para complementar sua rotina de jejum.</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><strong>Preferências Alimentares:</strong> Defina seu tipo de dieta (equilibrada, low-carb, etc.), informe intolerâncias ou alergias, e sua meta calórica diária.</li>
                  <li><strong>Geração de Cardápio com IA:</strong> Com base nas suas preferências salvas, a IA gera um plano alimentar para alguns dias (atualmente 3 dias).</li>
                  <li><strong>Visualização do Cardápio:</strong> O cardápio gerado é apresentado dia a dia, com detalhes para café da manhã, almoço e jantar.</li>
                  <li><strong>Editar Preferências:</strong> Você pode ajustar suas preferências e gerar um novo cardápio a qualquer momento.</li>
                </ul>
                 <p className="text-xs text-muted-foreground pt-2">Importante: As sugestões da IA são um ponto de partida. Consulte um nutricionista para um plano alimentar totalmente personalizado e seguro.</p>
              </AccordionContent>
            </AccordionItem>

            {/* Seção: Progresso */}
            <AccordionItem value="progresso" className="border border-border rounded-lg">
              <AccordionTrigger className="p-4 hover:no-underline text-lg font-semibold text-primary">
                <div className="flex items-center">
                  <TrendingUp className="mr-3 h-6 w-6" /> Progresso
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0 text-foreground/90 space-y-2">
                <p>Acompanhe sua evolução, histórico detalhado de jejuns e sua pontuação de consistência.</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><strong>Pontuação de Jejum:</strong> Uma pontuação de 1 a 10 baseada na sua frequência e consistência em atingir metas nos últimos 30 dias.</li>
                  <li><strong>Detalhes da Pontuação:</strong> Veja o número de jejuns nos últimos 7 e 30 dias, e sua porcentagem de metas atingidas.</li>
                  <li><strong>Histórico Recente:</strong> Lista dos seus últimos jejuns completados, mostrando data, duração e se a meta foi atingida.</li>
                </ul>
                 <p className="text-xs text-muted-foreground pt-2">Dica: Defina metas realistas no seu perfil para melhorar sua pontuação de consistência!</p>
              </AccordionContent>
            </AccordionItem>

            {/* Seção: Desafios */}
            <AccordionItem value="desafios" className="border border-border rounded-lg">
              <AccordionTrigger className="p-4 hover:no-underline text-lg font-semibold text-primary">
                <div className="flex items-center">
                  <ShieldCheck className="mr-3 h-6 w-6" /> Desafios
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0 text-foreground/90 space-y-2">
                <p>Participe de desafios semanais para se manter motivado e ganhar pontos!</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><strong>Desafios da Semana:</strong> Uma tabela mostra os desafios para os últimos 7 dias, com metas de jejum progressivas.</li>
                  <li><strong>Pontuação:</strong> Ganhe pontos ao completar cada meta diária. Um bônus é concedido ao completar todos os 7 dias.</li>
                  <li><strong>Status:</strong> Verifique facilmente quais desafios você completou.</li>
                  <li><strong>Recompensas (Em Breve):</strong> Acumule pontos para futuras recompensas no aplicativo.</li>
                </ul>
                <p className="text-xs text-muted-foreground pt-2">Fique de olho: Novos tipos de desafios e recompensas podem ser adicionados!</p>
              </AccordionContent>
            </AccordionItem>

            {/* Seção: Sugestões IA */}
            <AccordionItem value="sugestoes-ia" className="border border-border rounded-lg">
              <AccordionTrigger className="p-4 hover:no-underline text-lg font-semibold text-primary">
                <div className="flex items-center">
                  <Brain className="mr-3 h-6 w-6" /> Sugestões IA
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0 text-foreground/90 space-y-2">
                <p>Receba recomendações personalizadas de horários de jejum com base no seu perfil e rotina diária.</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><strong>Perfil Detalhado:</strong> Preencha informações como idade, gênero, nível de atividade, horário de sono, rotina diária e experiência com jejum.</li>
                  <li><strong>Geração de Sugestão:</strong> A IA analisa seu perfil e sugere um horário de início e fim para o seu jejum.</li>
                  <li><strong>Raciocínio:</strong> Entenda o porquê da sugestão com uma breve explicação fornecida pela IA.</li>
                  <li><strong>Salvar Perfil de IA:</strong> As informações fornecidas podem ser salvas no seu perfil para futuras consultas ou para preencher automaticamente o formulário da próxima vez.</li>
                </ul>
                 <p className="text-xs text-muted-foreground pt-2">Lembre-se: As sugestões são baseadas nos dados fornecidos. Quanto mais preciso seu perfil, melhor a sugestão.</p>
              </AccordionContent>
            </AccordionItem>
            
            {/* Seção: Perfil */}
            <AccordionItem value="perfil" className="border border-border rounded-lg">
              <AccordionTrigger className="p-4 hover:no-underline text-lg font-semibold text-primary">
                <div className="flex items-center">
                  <UserCircle className="mr-3 h-6 w-6" /> Perfil
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0 text-foreground/90 space-y-2">
                <p>Gerencie suas informações pessoais, metas de jejum e os dados usados para as sugestões de IA.</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><strong>Meta de Jejum:</strong> Defina sua meta padrão de horas de jejum diárias (ex: 16 horas). Este valor será usado como padrão ao iniciar um novo jejum.</li>
                  <li><strong>Perfil para Sugestões de IA:</strong> Atualize aqui os mesmos dados solicitados na aba "Sugestões IA" (idade, gênero, rotina, etc.). Essas informações são usadas para personalizar as recomendações da IA.</li>
                </ul>
                 <p className="text-xs text-muted-foreground pt-2">Dica: Manter seu perfil atualizado ajuda a IA a fornecer recomendações mais precisas e personalizadas.</p>
              </AccordionContent>
            </AccordionItem>

            {/* Seção: Configurações */}
            <AccordionItem value="configuracoes" className="border border-border rounded-lg">
              <AccordionTrigger className="p-4 hover:no-underline text-lg font-semibold text-primary">
                <div className="flex items-center">
                  <Settings className="mr-3 h-6 w-6" /> Configurações
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0 text-foreground/90 space-y-2">
                <p>Ajuste as preferências gerais do aplicativo.</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><strong>Aparência (Tema):</strong> Escolha entre o tema claro, escuro ou sincronizado com as configurações do seu sistema operacional.</li>
                  {/* <li><strong>Notificações (Em Breve):</strong> Futuramente, você poderá gerenciar suas preferências de notificação aqui.</li> */}
                </ul>
                 <p className="text-xs text-muted-foreground pt-2">Explore os temas para encontrar o que mais lhe agrada visualmente!</p>
              </AccordionContent>
            </AccordionItem>

             {/* Seção: Suporte */}
            <AccordionItem value="suporte" className="border border-border rounded-lg">
              <AccordionTrigger className="p-4 hover:no-underline text-lg font-semibold text-primary">
                <div className="flex items-center">
                   <HelpCircle className="mr-3 h-6 w-6" /> Suporte
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0 text-foreground/90 space-y-2">
                <p>Precisa de ajuda ou tem alguma dúvida? Aqui você encontra como nos contatar.</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><strong>Contato:</strong> Um endereço de e-mail de suporte é fornecido para contato.</li>
                  <li><strong>Observação:</strong> Atualmente, a funcionalidade de suporte via e-mail é um exemplo, mas indica o canal de comunicação pretendido.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

    