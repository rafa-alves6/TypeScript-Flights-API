import { useEffect, useState, type SyntheticEvent } from "react";
import api from "../services/api";
import type { User, ApiError, CreateUserPayload } from "../types/api";
import { AxiosError } from "axios";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";

export const Users = () => {
  const { isAdmin } = useAuth();

  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // NOVO ESTADO
  const [newRole, setNewRole] = useState<"admin" | "regular">("regular");

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    let ignore = false;
    api
      .get<User[]>("/users")
      .then((res) => {
        if (!ignore) {
          setUsers(res.data);
          setError(null);
        }
      })
      .catch(() => {
        if (!ignore) setError("Erro ao carregar a lista de usuários.");
      });
    return () => {
      ignore = true;
    };
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const res = await api.get<User[]>("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    // Validação de Confirmação de Senha
    if (newPassword !== confirmPassword) {
      setFormError("A senha e a confirmação não coincidem.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateUserPayload = {
        username: newUsername,
        password: newPassword,
        role: newRole,
      };
      await api.post("/users", payload);

      setFormSuccess(`Usuário "${newUsername}" criado com sucesso!`);
      setNewUsername("");
      setNewPassword("");
      setConfirmPassword(""); // LIMPA A CONFIRMAÇÃO
      setNewRole("regular");
      await fetchUsers();
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setFormError(
        axiosError.response?.data?.message || "Erro ao criar usuário.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: number, username: string) => {
    if (
      !window.confirm(`Tem certeza que deseja excluir o usuário "${username}"?`)
    )
      return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => (prev ? prev.filter((u) => u.id !== id) : null));
      setFormSuccess(`Usuário "${username}" excluído.`);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setFormError(
        axiosError.response?.data?.message || "Erro ao excluir usuário.",
      );
    }
  };

  if (!isAdmin)
    return (
      <div className="container mx-auto py-8">
        <h2 className="text-2xl font-bold text-destructive">Acesso Restrito</h2>
      </div>
    );
  if (users === null && !error)
    return <div className="container mx-auto py-8">Carregando...</div>;

  return (
    <div className="container mx-auto py-8 space-y-8 px-4">
      <h2 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h2>

      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      {formSuccess && (
        <Alert className="border-green-500 text-green-700 bg-green-50">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{formSuccess}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> Criar Novo Usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome de Usuário</Label>
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                  minLength={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmar Senha</Label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label>Nível de Acesso</Label>
                <Select
                  value={newRole}
                  onValueChange={(val: string) =>
                    setNewRole(val as "admin" | "regular")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Operador</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Criando..." : "Criar Usuário"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Total de usuários cadastrados:{" "}
              <span className="font-bold text-foreground">
                {users?.length || 0}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Administradores:{" "}
              <span className="font-bold text-foreground">
                {users?.filter((u) => u.role === "admin").length || 0}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Operadores:{" "}
              <span className="font-bold text-foreground">
                {users?.filter((u) => u.role === "regular").length || 0}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {error ? (
            <Alert variant="destructive">{error}</Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users &&
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.id}</TableCell>
                      <TableCell>{u.username}</TableCell>
                      <TableCell>
                        {u.role === "admin" ? "Administrador" : "Operador"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteUser(u.id, u.username)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
