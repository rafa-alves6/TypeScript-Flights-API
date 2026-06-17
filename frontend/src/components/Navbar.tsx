import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Plane, LogOut, User, Menu } from "lucide-react";

// Componente extraído (para evitar erro do ESLint)
interface NavLinksProps {
  isOperator: boolean;
  isAdmin: boolean;
  onNavigate?: () => void; // Função para fechar o menu ao clicar
}

const NavLinks = ({ isOperator, isAdmin, onNavigate }: NavLinksProps) => (
  <>
    <Link
      to="/"
      onClick={onNavigate}
      className="block py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
    >
      Painel
    </Link>
    <Link
      to="/voos"
      onClick={onNavigate}
      className="block py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
    >
      Voos
    </Link>
    {isOperator && (
      <Link
        to="/passageiros"
        onClick={onNavigate}
        className="block py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        Passageiros
      </Link>
    )}
    {isAdmin && (
      <Link
        to="/usuarios"
        onClick={onNavigate}
        className="block py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        Gerenciar Usuários
      </Link>
    )}
  </>
);

export const Navbar = () => {
  const { user, logout, isAdmin, isOperator, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // Controla o Sheet

  const handleLogout = () => {
    logout();
    navigate("/login");
    setOpen(false);
  };

  const closeSheet = () => setOpen(false);

  return (
    <nav className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg md:text-xl shrink-0"
        >
          <Plane className="h-5 w-5 md:h-6 md:w-6" />
          <span className="hidden sm:inline">Zephyros</span>
          <span className="sm:hidden">Zephyros</span>
        </Link>

        {/* --- DESKTOP VIEW --- */}
        <div className="hidden md:flex gap-6 ml-8">
          <NavLinks isOperator={isOperator} isAdmin={isAdmin} />
        </div>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated && user && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  Olá, {user.username}
                </span>
                <Badge variant={isAdmin ? "default" : "secondary"}>
                  {isAdmin ? "Admin" : "Operador"}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/perfil">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Sair
              </Button>
            </>
          )}
        </div>

        {/* --- MOBILE VIEW --- */}
        <div className="md:hidden flex items-center gap-3">
          {isAuthenticated && user && (
            <>
              {/* Nome do usuário (truncado) e Badge */}
              <div className="flex flex-col items-end leading-tight">
                <span className="text-xs font-medium truncate max-w-[80px]">
                  {user.username}
                </span>
                <Badge
                  variant={isAdmin ? "default" : "secondary"}
                  className="text-[10px] h-4 px-1.5 py-0 mt-0.5"
                >
                  {isAdmin ? "Admin" : "Op"}
                </Badge>
              </div>

              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[85vw] max-w-[350px] p-0 flex flex-col"
                >
                  <SheetHeader className="p-6 border-b bg-muted/40 text-left space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <SheetTitle className="text-base font-semibold truncate">
                          {user.username}
                        </SheetTitle>
                        <SheetDescription className="text-xs text-muted-foreground">
                          {isAdmin
                            ? "Administrador do Sistema"
                            : "Operador de Voo"}
                        </SheetDescription>
                      </div>
                    </div>
                  </SheetHeader>

                  <nav className="flex flex-col gap-1 p-4 flex-1">
                    <NavLinks
                      isOperator={isOperator}
                      isAdmin={isAdmin}
                      onNavigate={closeSheet}
                    />
                  </nav>

                  <div className="p-4 border-t mt-auto space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                      onClick={closeSheet}
                    >
                      <Link to="/perfil" className="flex items-center gap-2">
                        <User className="h-4 w-4" /> Meu Perfil
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Sair do Sistema
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
