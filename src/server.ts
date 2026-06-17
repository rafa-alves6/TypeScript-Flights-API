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

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) {
    // Permite requisições sem origem (Postman, curl, apps mobile)
    if (!origin) return callback(null, true);

    // Ambientes de desenvolvimento local
    const allowedExactOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
    ];

    // Regex mágica: Aceita o domínio principal, subdomínios e domínios do Amplify
    // Exemplos que passarão:
    // https://zephyros.rafaelalves.dev.br
    // https://rafaelalves.dev.br
    // https://main.d12345.amplifyapp.com
    const allowedRegex =
      /^https:\/\/([a-z0-9-]+\.)?(rafaelalves\.dev\.br|amplifyapp\.com)$/;

    if (allowedExactOrigins.includes(origin) || allowedRegex.test(origin)) {
      callback(null, true);
    } else {
      // Log para debug: Se algo for bloqueado, você verá no terminal do Docker
      console.log(`[CORS] Bloqueado: ${origin}`);
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
