
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Leaf, UserCircle, LogOut, Settings, ListChecks, Award, Info, Menu, BookOpenCheck, Palette, ShieldCheck } from 'lucide-react'; 
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import React from 'react';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    setIsSheetOpen(false); // Close sheet on logout
    router.push('/login');
  };

  const navLinks = [
    { href: "/planejamento", label: "Planejamento", icon: ListChecks },
    { href: "/progresso", label: "Progresso", icon: Award },
    { href: "/desafios", label: "Desafios", icon: ShieldCheck }, // Novo link "Desafios"
    { href: "/dicas", label: "Dicas", icon: Info },
    { href: "/guia", label: "Guia", icon: BookOpenCheck },
    { href: "/profile", label: "Perfil", icon: UserCircle },
    { href: "/configuracoes", label: "Configurações", icon: Settings }, 
  ];

  const NavLinkItem = ({ href, label, icon: Icon }: { href: string, label: string, icon: React.ElementType }) => (
    <Button variant="ghost" size="sm" asChild className="w-full justify-start text-foreground hover:text-primary hover:bg-primary/10">
      <Link href={href} onClick={() => setIsSheetOpen(false)}>
        <Icon className="h-5 w-5 mr-3" />
        {label}
      </Link>
    </Button>
  );
  
  const DesktopNavLinkItem = ({ href, label, icon: Icon }: { href: string, label: string, icon: React.ElementType }) => (
     <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-primary hover:bg-primary/10">
        <Link href={href} className="flex items-center">
          <Icon className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline text-xs sm:text-sm">{label}</span>
        </Link>
      </Button>
  );


  return (
    <nav className="bg-background border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Leaf className="h-8 w-8 text-primary" data-ai-hint="logo app" />
          <h1 className="text-2xl font-headline font-semibold text-primary">Seca Jejum</h1>
        </Link>
        
        {currentUser && (
          <>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 sm:space-x-2 flex-wrap justify-center">
              {navLinks.map(link => (
                <DesktopNavLinkItem key={link.href + link.label} href={link.href} label={link.label} icon={link.icon} />
              ))}
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-foreground hover:text-destructive hover:bg-destructive/10" title="Sair">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>

            {/* Mobile Navigation Trigger */}
            <div className="md:hidden">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6 text-primary" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] bg-card p-4">
                  <SheetHeader className="mb-6 text-left">
                    <SheetTitle className="flex items-center font-headline text-primary">
                       <Leaf className="h-7 w-7 mr-2 text-primary" />
                       Seca Jejum
                    </SheetTitle>
                  </SheetHeader>
                  <div className="space-y-2 flex flex-col h-full">
                    {navLinks.map(link => (
                      <NavLinkItem key={link.href + link.label} href={link.href} label={link.label} icon={link.icon} />
                    ))}
                    <div className="mt-auto">
                       <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-destructive hover:bg-destructive/10">
                        <LogOut className="h-5 w-5 mr-3" />
                        Sair
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
