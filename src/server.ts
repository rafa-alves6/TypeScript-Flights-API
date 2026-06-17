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

// CORS Dinâmico para aceitar localhost e qualquer IP da rede local (Wi-Fi)
const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) {
    // Permite requisições sem origem (como Postman, Insomnia ou curl)
    if (!origin) return callback(null, true);

    // Regex que aceita localhost, 127.0.0.1 e qualquer IP (192.168.x.x, 10.x.x.x) na porta 5173
    const isLocalOrNetwork =
      /^http:\/\/(localhost|127\.0\.0\.1|\d{1,3}(\.\d{1,3}){3})(:5173)?$/.test(
        origin,
      );

    if (isLocalOrNetwork) {
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

// Opcional: Adicione '0.0.0.0' para garantir que o Express ouça em todas as interfaces de rede
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API rodando na porta ${PORT}`);
});
