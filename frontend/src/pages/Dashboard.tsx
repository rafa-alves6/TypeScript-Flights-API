import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Users, ShieldCheck } from "lucide-react";

export const Dashboard = () => {
  const { user, isOperator, isAdmin } = useAuth();

  return (
    // Reduzido py-8 para py-4 no mobile, px-4 para garantir margem
    <div className="container mx-auto py-4 md:py-8 space-y-6 px-4">
      {/* Título menor no mobile (text-2xl) */}
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
        Painel de Controle
      </h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Bem-vindo, {user?.username}!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm md:text-base text-muted-foreground">
            Seu nível de acesso atual permite as seguintes ações:
          </p>

          <ul className="flex flex-col gap-3">
            <li className="flex items-start gap-3 p-3 md:p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
              <Plane className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm md:text-base">
                  Consultar Frota e Voos
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Visualizar aeronaves e malha aérea.
                </p>
              </div>
            </li>

            {isOperator && (
              <li className="flex items-start gap-3 p-3 md:p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                <Users className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm md:text-base">
                    Acessar Passageiros (PII)
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Visualizar manifestos e dados sensíveis.
                  </p>
                </div>
              </li>
            )}

            {isAdmin && (
              <li className="flex items-start gap-3 p-3 md:p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm md:text-base">
                    Gerenciar Usuários
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Criar, editar e excluir operadores.
                  </p>
                </div>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
