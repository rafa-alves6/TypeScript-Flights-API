import { useState, type SyntheticEvent } from "react";
import api from "../services/api";
import type { User, ApiError } from "../types/api";
import { AxiosError } from "axios";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";

export const MyProfile = () => {
  const { user, updateUser } = useAuth();

  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword && newPassword !== confirmPassword) {
      setError("A nova senha e a confirmação não coincidem.");
      return;
    }

    setSubmitting(true);
    const payload: { username?: string; password?: string } = {};
    if (newUsername !== user.username) payload.username = newUsername;
    if (newPassword) payload.password = newPassword;

    if (Object.keys(payload).length === 0) {
      setError("Nenhuma alteração detectada.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await api.put<User>(`/users/${user.id}`, payload);
      updateUser(response.data);
      setSuccess("Perfil atualizado com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(
        axiosError.response?.data?.message || "Erro ao atualizar perfil.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl px-4">
      <Card>
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
          <CardDescription>
            Atualize seu nome de usuário ou redefina sua senha de acesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4 border-green-500 text-green-700 bg-green-50">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input
                id="username"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                minLength={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Nova Senha{" "}
                <span className="text-xs text-muted-foreground">
                  (Deixe em branco para manter)
                </span>
              </Label>
              <PasswordInput
                id="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={newPassword ? 6 : 0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={newPassword ? 6 : 0}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
