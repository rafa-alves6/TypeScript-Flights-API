import { useEffect, useState, type SyntheticEvent } from "react";
import api from "../services/api";
import type {
  Flight,
  PaginatedResponse,
  Aircraft,
  CreateFlightPayload,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { PlaneTakeoff, Plus, Pencil, Trash2, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "../hooks/useAuth";
import { cn } from "@/lib/utils"; // Importação do utilitário de classes do shadcn

export const Flights = () => {
  const { isAdmin, isOperator, user, isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [flights, setFlights] = useState<Flight[] | null>(null);
  const [total, setTotal] = useState(0);
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
  const limit = 20;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [flightNumber, setFlightNumber] = useState("");
  const [departureAirport, setDepartureAirport] = useState("");
  const [arrivalAirport, setArrivalAirport] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [aircraftId, setAircraftId] = useState<string>("");

  useEffect(() => {
    api
      .get<PaginatedResponse<Aircraft>>("/aircrafts", {
        params: { limit: 100 },
      })
      .then((res) => {
        if (Array.isArray(res.data.data)) setAircrafts(res.data.data);
      })
      .catch((err) => console.error("Erro ao carregar aeronaves:", err));
  }, []);

  const fetchFlights = async () => {
    try {
      const res = await api.get<PaginatedResponse<Flight>>("/flights", {
        params: { page, limit },
      });
      setFlights(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let ignore = false;
    api
      .get<PaginatedResponse<Flight>>("/flights", { params: { page, limit } })
      .then((res) => {
        if (!ignore) {
          setFlights(res.data.data);
          setTotal(res.data.total);
        }
      })
      .catch((err) => {
        if (!ignore) console.error(err);
      });
    return () => {
      ignore = true;
    };
  }, [page, limit]);

  const resetForm = () => {
    setFlightNumber("");
    setDepartureAirport("");
    setArrivalAirport("");
    setDepartureTime("");
    setArrivalTime("");
    setAircraftId("");
    setEditingFlight(null);
    setFormError("");
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const formatDateTimeLocal = (dateString: string) => {
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const openEditDialog = (flight: Flight) => {
    setEditingFlight(flight);
    setFlightNumber(flight.flightNumber);
    setDepartureAirport(flight.departureAirport);
    setArrivalAirport(flight.arrivalAirport);
    setDepartureTime(formatDateTimeLocal(flight.departureTime));
    setArrivalTime(formatDateTimeLocal(flight.arrivalTime));
    setAircraftId(String(flight.aircraftId));
    setFormError("");
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const payload: CreateFlightPayload = {
        flightNumber,
        departureAirport,
        arrivalAirport,
        departureTime: new Date(departureTime).toISOString(),
        arrivalTime: new Date(arrivalTime).toISOString(),
        aircraftId: Number(aircraftId),
      };
      if (editingFlight)
        await api.put(`/flights/${editingFlight.flightId}`, payload);
      else await api.post("/flights", payload);

      setIsDialogOpen(false);
      resetForm();
      await fetchFlights();
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setFormError(axiosError.response?.data?.message || "Erro ao salvar voo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, flightNumber: string) => {
    if (
      !window.confirm(`Tem certeza que deseja excluir o voo ${flightNumber}?`)
    )
      return;
    try {
      await api.delete(`/flights/${id}`);
      await fetchFlights();
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      alert(axiosError.response?.data?.message || "Erro ao excluir voo.");
    }
  };

  const totalPages = Math.ceil(total / limit);

  const totalCols = 5 + (isAuthenticated ? 1 : 0) + (isOperator ? 1 : 0);

  const getHead = (idx: number) =>
    cn(
      "whitespace-nowrap",
      idx === 0 ? "pl-4 md:pl-30 text-left" : "text-center",
      idx === totalCols - 1 && "pr-4 md:pr-6",
    );

  const getCell = (idx: number, isActions = false) =>
    cn(
      "whitespace-nowrap text-xs md:text-sm",
      idx === 0
        ? "pl-4 md:pl-30 text-left font-medium"
        : !isActions && "text-center",
      idx === totalCols - 1 && "pr-4 md:pr-6",
      isActions && "flex justify-center gap-2",
    );

  return (
    <div className="container mx-auto py-4 md:py-8 space-y-4 md:space-y-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <PlaneTakeoff className="h-6 w-6 md:h-8 md:w-8" /> Malha Aérea
        </h2>
        <div className="flex items-center gap-4">
          {flights && (
            <p className="text-xs md:text-sm text-muted-foreground">
              Exibindo {flights.length} de {total}
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
                  <Plus className="h-4 w-4 mr-2" /> Novo Voo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingFlight ? "Editar Voo" : "Criar Novo Voo"}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Formulário de voo
                  </DialogDescription>
                </DialogHeader>
                {formError && (
                  <Alert variant="destructive">
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Número do Voo</Label>
                    <Input
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Origem (IATA)</Label>
                      <Input
                        value={departureAirport}
                        onChange={(e) => setDepartureAirport(e.target.value)}
                        maxLength={3}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Destino (IATA)</Label>
                      <Input
                        value={arrivalAirport}
                        onChange={(e) => setArrivalAirport(e.target.value)}
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Partida</Label>
                      <Input
                        type="datetime-local"
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Chegada</Label>
                      <Input
                        type="datetime-local"
                        value={arrivalTime}
                        onChange={(e) => setArrivalTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Aeronave</Label>
                    <Select
                      value={aircraftId}
                      onValueChange={setAircraftId}
                      required
                      disabled={aircrafts.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            aircrafts.length === 0
                              ? "Carregando..."
                              : "Selecione a aeronave"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(aircrafts) &&
                          aircrafts.map((a) => (
                            <SelectItem
                              key={a.aircraftId}
                              value={String(a.aircraftId)}
                            >
                              {a.manufacturer} {a.model} ({a.capacity} lugares)
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Salvando..."
                      : editingFlight
                        ? "Atualizar"
                        : "Criar"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {flights === null ? (
            <div className="flex justify-center items-center h-32 md:h-40">
              <p className="text-sm md:text-base text-muted-foreground">
                Carregando dados...
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={getHead(0)}>Voo</TableHead>
                      <TableHead className={getHead(1)}>Origem</TableHead>
                      <TableHead className={getHead(2)}>Destino</TableHead>
                      <TableHead className={getHead(3)}>Partida</TableHead>
                      <TableHead className={getHead(4)}>Chegada</TableHead>

                      {isAuthenticated && (
                        <TableHead className={getHead(5)}>Criado por</TableHead>
                      )}

                      {isOperator && (
                        <TableHead className={getHead(isAuthenticated ? 6 : 5)}>
                          Ações
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {flights.map((f) => (
                      <TableRow key={f.flightId}>
                        <TableCell className={getCell(0)}>
                          {f.flightNumber}
                        </TableCell>
                        <TableCell className={getCell(1)}>
                          {f.departureAirport}
                        </TableCell>
                        <TableCell className={getCell(2)}>
                          {f.arrivalAirport}
                        </TableCell>
                        <TableCell className={getCell(3)}>
                          {new Date(f.departureTime).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell className={getCell(4)}>
                          {new Date(f.arrivalTime).toLocaleString("pt-BR")}
                        </TableCell>

                        {isAuthenticated && (
                          <TableCell
                            className={cn(getCell(5), "text-muted-foreground")}
                          >
                            {f.createdBy ? (
                              <span className="inline-flex items-center justify-center gap-1">
                                <User className="h-3 w-3" />
                                {f.createdBy.username}
                              </span>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        )}

                        {isOperator && (
                          <TableCell
                            className={getCell(isAuthenticated ? 6 : 5, true)}
                          >
                            {(isAdmin || f.createdBy?.id === user?.id) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(f)}
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
                                  handleDelete(f.flightId, f.flightNumber)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};
