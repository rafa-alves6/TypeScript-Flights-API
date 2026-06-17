import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import router from './routes';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerOptions from './swaggerOptions';

dotenv.config();

const app = express();
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
const PORT = process.env.PORT || 3000;

// Segurança Básica (Headers)
app.use(helmet());

// CORS configurado para o Frontend (Vite roda na porta 5173 por padrão)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
  credentials: true, // Necessário se formos usar cookies HttpOnly no futuro
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});