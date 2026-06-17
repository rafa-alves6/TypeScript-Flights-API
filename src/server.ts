import express from "express";
import cors from "cors";
import helmet from "helmet";
import router from "./routes";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerOptions from "./swaggerOptions";

dotenv.config();

const app = express();
const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
const PORT = Number(process.env.PORT) || 3000;

app.use(helmet());

// Lista de origens permitidas (Dev + Produção)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://rafaelalves.dev.br",
  "https://www.rafaelalves.dev.br",
];

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api", router);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API Zephyros rodando na porta ${PORT}`);
});
