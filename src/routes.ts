import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { AuthController } from "./controllers/AuthController";
import { UserController } from "./controllers/UserController";
import { PublicDataController } from "./controllers/PublicDataController";
import { FlightController } from "./controllers/FlightController";
import { PassengerController } from "./controllers/PassengerController";
import {
  authenticateToken,
  requireAdmin,
  requireOperator,
  validateSchema,
} from "./middleware/auth";

const router = Router();

// --- SCHEMAS DE VALIDAÇÃO (ZOD) ---
const loginSchema = z.object({
  username: z
    .string({ required_error: "Nome de usuário é obrigatório." })
    .min(1),
  password: z.string({ required_error: "Senha é obrigatória." }).min(1),
});

const createUserSchema = z.object({
  username: z
    .string({ required_error: "Nome de usuário é obrigatório." })
    .min(3),
  password: z.string({ required_error: "Senha é obrigatória." }).min(6),
  role: z.enum(["admin", "regular"]).optional().default("regular"),
});

const updateUserSchema = z
  .object({
    username: z.string().min(3).optional(),
    password: z.string().min(6).optional(),
  })
  .refine((data) => data.username || data.password, {
    message: "Forneça pelo menos um campo para atualizar.",
  });

const createFlightSchema = z.object({
  flightNumber: z
    .string({ required_error: "Número do voo é obrigatório." })
    .min(2),
  departureAirport: z
    .string({ required_error: "Origem é obrigatória." })
    .length(3, "Código IATA deve ter 3 letras.")
    .transform((val) => val.toUpperCase()),
  arrivalAirport: z
    .string({ required_error: "Destino é obrigatório." })
    .length(3, "Código IATA deve ter 3 letras.")
    .transform((val) => val.toUpperCase()),
  departureTime: z.string({ required_error: "Partida é obrigatória." }),
  arrivalTime: z.string({ required_error: "Chegada é obrigatória." }),
  aircraftId: z.coerce
    .number({ required_error: "Aeronave é obrigatória." })
    .int()
    .positive(),
});
const updateFlightSchema = createFlightSchema.partial();

const createPassengerSchema = z.object({
  firstName: z.string({ required_error: "Nome é obrigatório." }).min(1),
  lastName: z.string({ required_error: "Sobrenome é obrigatório." }).min(1),
  birthDate: z.string({ required_error: "Data de nascimento é obrigatória." }),
  passportNumber: z
    .string({ required_error: "Passaporte é obrigatório." })
    .min(5)
    .transform((val) => val.toUpperCase()),
});
const updatePassengerSchema = createPassengerSchema.partial();

// --- SEGURANÇA (RATE LIMITING) ---
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- ROTAS PÚBLICAS ---
router.post(
  "/login",
  loginLimiter,
  validateSchema(loginSchema),
  AuthController.login,
);
router.get("/aircrafts", PublicDataController.getAllAircrafts);
router.get("/flights", PublicDataController.getAllFlights);

// --- ROTAS PROTEGIDAS (OPERADOR E ADMIN) ---
router.get(
  "/passengers",
  authenticateToken,
  requireOperator,
  PublicDataController.getAllPassengers,
);
router.get(
  "/boarding-details",
  authenticateToken,
  requireOperator,
  PublicDataController.getBoardingPassDetails,
);

// CRUD DE VOOS
router.post(
  "/flights",
  authenticateToken,
  requireOperator,
  validateSchema(createFlightSchema),
  FlightController.create,
);
router.put(
  "/flights/:id",
  authenticateToken,
  requireOperator,
  validateSchema(updateFlightSchema),
  FlightController.update,
);
router.delete(
  "/flights/:id",
  authenticateToken,
  requireAdmin,
  FlightController.delete,
);

// CRUD DE PASSAGEIROS
router.post(
  "/passengers",
  authenticateToken,
  requireOperator,
  validateSchema(createPassengerSchema),
  PassengerController.create,
);
router.put(
  "/passengers/:id",
  authenticateToken,
  requireOperator,
  validateSchema(updatePassengerSchema),
  PassengerController.update,
);
router.delete(
  "/passengers/:id",
  authenticateToken,
  requireAdmin,
  PassengerController.delete,
);

// --- ROTAS PRIVADAS (ADMIN) ---
router.get("/users", authenticateToken, requireAdmin, UserController.getAll);
router.post(
  "/users",
  authenticateToken,
  requireAdmin,
  validateSchema(createUserSchema),
  UserController.create,
);
router.put(
  "/users/:id",
  authenticateToken,
  validateSchema(updateUserSchema),
  UserController.update,
);
router.delete(
  "/users/:id",
  authenticateToken,
  requireAdmin,
  UserController.delete,
);

export default router;
