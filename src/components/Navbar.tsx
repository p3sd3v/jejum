
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, UserCircle, Brain, LogOut, SunMoon } from 'lucide-react'; // SunMoon for logo placeholder

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <SunMoon className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-semibold text-primary">JejumZen</h1>
        </Link>
        
        {currentUser && (
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-primary hover:bg-primary/10">
              <Link href="/dashboard" className="flex items-center">
                <LayoutDashboard className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-primary hover:bg-primary/10">
              <Link href="/profile" className="flex items-center">
                <UserCircle className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Perfil</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-primary hover:bg-primary/10">
              <Link href="/suggestions" className="flex items-center">
                <Brain className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sugestões IA</span>
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
