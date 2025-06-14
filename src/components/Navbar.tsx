"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Leaf, UserCircle, LogOut, Settings, ListChecks, Award, Info } from 'lucide-react'; 

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <nav className="bg-background border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center">
        <Link href="/dashboard" className="flex items-center space-x-2 mb-2 sm:mb-0">
          <Leaf className="h-8 w-8 text-primary" data-ai-hint="logo app" />
          <h1 className="text-2xl font-headline font-semibold text-primary">Seca Jejum</h1>
        </Link>
        
        {currentUser && (
          <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap justify-center">
            <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-primary hover:bg-primary/10">
              <Link href="/planejamento" className="flex items-center">
                <ListChecks className="h-4 w-4 sm:mr-2" />
                <span className="text-xs sm:text-sm">Planejamento</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-primary hover:bg-primary/10">
              <Link href="/progresso" className="flex items-center">
                <Award className="h-4 w-4 sm:mr-2" />
                <span className="text-xs sm:text-sm">Progresso</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-primary hover:bg-primary/10">
              <Link href="/dicas" className="flex items-center">
                <Info className="h-4 w-4 sm:mr-2" />
                <span className="text-xs sm:text-sm">Dicas</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-primary hover:bg-primary/10">
              <Link href="/profile" className="flex items-center">
                <UserCircle className="h-4 w-4 sm:mr-2" />
                <span className="text-xs sm:text-sm">Perfil</span>
              </Link>
            </Button>
             <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-primary hover:bg-primary/10">
              <Link href="/profile" className="flex items-center">
                <Settings className="h-4 w-4 sm:mr-2" />
                <span className="text-xs sm:text-sm">Configurações</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-foreground hover:text-destructive hover:bg-destructive/10" title="Sair">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
