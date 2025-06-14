
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Leaf, UserCircle, LogOut, Settings, ListChecks, Award, BookOpenCheck, Palette, ShieldCheck, Lightbulb } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import React from 'react';

const navLinksDefinition = [
  { href: "/planejamento", label: "Planejamento", icon: ListChecks },
  { href: "/progresso", label: "Progresso", icon: Award },
  { href: "/desafios", label: "Desafios", icon: ShieldCheck },
  { href: "/guia", label: "Guia", icon: BookOpenCheck },
  { href: "/profile", label: "Perfil", icon: UserCircle },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

const IconMenu = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const NavLinkItem = React.memo(({ href, label, icon: Icon, onClick }: { href: string, label: string, icon: React.ElementType, onClick: () => void }) => (
  <Button variant="ghost" size="sm" asChild className="w-full justify-start text-foreground hover:text-primary hover:bg-primary/10">
    <Link href={href} onClick={onClick}>
      <Icon className="h-5 w-5 mr-3" />
      {label}
    </Link>
  </Button>
));
NavLinkItem.displayName = 'NavLinkItem';

const DesktopNavLinkItem = React.memo(({ href, label, icon: Icon }: { href: string, label: string, icon: React.ElementType }) => (
   <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-primary hover:bg-primary/10">
      <Link href={href} className="flex items-center">
        <Icon className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline text-xs sm:text-sm">{label}</span>
      </Link>
    </Button>
));
DesktopNavLinkItem.displayName = 'DesktopNavLinkItem';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    setIsSheetOpen(false);
    router.push('/login');
  };

  const closeSheet = () => setIsSheetOpen(false);

  return (
    <nav className="bg-background border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center space-x-2" onClick={closeSheet}>
          <Leaf className="h-8 w-8 text-primary" data-ai-hint="logo app" />
          <h1 className="text-2xl font-headline font-semibold text-primary">Seca Jejum</h1>
        </Link>
        
        {currentUser && (
          <>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 sm:space-x-2 flex-wrap justify-center">
              {navLinksDefinition.map(link => (
                <DesktopNavLinkItem key={link.href} href={link.href} label={link.label} icon={link.icon} />
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
                    <IconMenu className="h-6 w-6 text-primary" />
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
                    {navLinksDefinition.map(link => (
                      <NavLinkItem key={link.href} href={link.href} label={link.label} icon={link.icon} onClick={closeSheet} />
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
