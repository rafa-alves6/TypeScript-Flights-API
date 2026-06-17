import { useEffect, useState, type SyntheticEvent } from "react";
import api from "../services/api";
import type {
  Passenger,
  PaginatedResponse,
  CreatePassengerPayload,
  ApiError,
} from "../types/api";
import { AxiosError } from "axios";
import { Pagination } from "../components/Pagination";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Users, Plus, Pencil, Trash2, User } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export const Passengers = () => {
  const { isAdmin, isOperator, user } = useAuth();
  const [page, setPage] = useState(1);
  const [passengers, setPassengers] = useState<Passenger[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const limit = 20;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(
    null,
  );
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [passportNumber, setPassportNumber] = useState("");

  const fetchPassengers = async () => {
    try {
      const res = await api.get<PaginatedResponse<Passenger>>("/passengers", {
        params: { page, limit },
      });
      setPassengers(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let ignore = false;
    api
      .get<PaginatedResponse<Passenger>>("/passengers", {
        params: { page, limit },
      })
      .then((res) => {
        if (!ignore) {
          setPassengers(res.data.data);
          setTotal(res.data.total);
        }
      })
      .catch((err: AxiosError<ApiError>) => {
        if (!ignore) setError(err.response?.data?.message || "Acesso negado.");
      });
    return () => {
      ignore = true;
    };
  }, [page, limit]);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setBirthDate("");
    setPassportNumber("");
    setEditingPassenger(null);
    setFormError("");
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (p: Passenger) => {
    setEditingPassenger(p);
    setFirstName(p.firstName);
    setLastName(p.lastName);
    setBirthDate(new Date(p.birthDate).toISOString().split("T")[0]);
    setPassportNumber(p.passportNumber);
    setFormError("");
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const payload: CreatePassengerPayload = {
        firstName,
        lastName,
        birthDate,
        passportNumber,
      };
      if (editingPassenger) {
        await api.put(`/passengers/${editingPassenger.passengerId}`, payload);
      } else {
        await api.post("/passengers", payload);
      }
      setIsDialogOpen(false);
      resetForm();
      await fetchPassengers();
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setFormError(
        axiosError.response?.data?.message || "Erro ao salvar passageiro.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir ${name}?`)) return;
    try {
      await api.delete(`/passengers/${id}`);
      await fetchPassengers();
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      alert(
        axiosError.response?.data?.message || "Erro ao excluir passageiro.",
      );
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto py-4 md:py-8 space-y-4 md:space-y-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6 md:h-8 md:w-8" /> Manifesto de Passageiros
        </h2>
        <div className="flex items-center gap-4">
          {passengers && (
            <p className="text-xs md:text-sm text-muted-foreground">
              Exibindo {passengers.length} de {total}
            </p>
          )}
          {isOperator && (
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                if (!open) resetForm();
                setIsDialogOpen(open);
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm" onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" /> Novo Passageiro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingPassenger
                      ? "Editar Passageiro"
                      : "Criar Novo Passageiro"}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Formulário de passageiro
                  </DialogDescription>
                </DialogHeader>
                {formError && (
                  <Alert variant="destructive">
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sobrenome</Label>
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Nascimento</Label>
                    <Input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Passaporte</Label>
                    <Input
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Salvando..."
                      : editingPassenger
                        ? "Atualizar"
                        : "Criar"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Alert className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-200">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-xs md:text-sm">
          <strong>Atenção (LGPD):</strong> Esta tela contém Dados Pessoais
          Sensíveis (PII). O acesso é restrito e auditado.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs md:text-sm">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          {passengers === null && !error ? (
            <div className="flex justify-center items-center h-32 md:h-40">
              <p className="text-sm md:text-base text-muted-foreground">
                Carregando dados sensíveis...
              </p>
            </div>
          ) : (
            !error &&
            passengers && (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">
                          Nome Completo
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Passaporte
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Nascimento
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Criado por
                        </TableHead>
                        {isOperator && (
                          <TableHead className="text-right whitespace-nowrap">
                            Ações
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {passengers.map((p) => (
                        <TableRow key={p.passengerId}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {p.firstName} {p.lastName}
                          </TableCell>
                          <TableCell className="font-mono whitespace-nowrap text-xs md:text-sm">
                            {p.passportNumber}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs md:text-sm">
                            {new Date(p.birthDate).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {p.createdBy ? (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {p.createdBy.username}
                              </span>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          {isOperator && (
                            <TableCell className="text-right whitespace-nowrap">
                              <div className="flex justify-end gap-2">
                                {(isAdmin || p.createdBy?.id === user?.id) && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditDialog(p)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                                {isAdmin && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() =>
                                      handleDelete(
                                        p.passengerId,
                                        `${p.firstName} ${p.lastName}`,
                                      )
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="p-3 md:p-4 border-t">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              </>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};
