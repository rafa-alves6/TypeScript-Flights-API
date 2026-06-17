import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { AuthController } from './controllers/AuthController';
import { UserController } from './controllers/UserController';
import { PublicDataController } from './controllers/PublicDataController';
import { authenticateToken, requireAdmin, requireOperator, validateSchema } from './middleware/auth';

const router = Router();

// --- SCHEMAS DE VALIDAÇÃO (ZOD) ---
const loginSchema = z.object({
  username: z.string({ required_error: "Nome de usuário é obrigatório." }).min(1),
  password: z.string({ required_error: "Senha é obrigatória." }).min(1)
});

const createUserSchema = z.object({
  username: z.string({ required_error: "Nome de usuário é obrigatório." }).min(3),
  password: z.string({ required_error: "Senha é obrigatória." }).min(6),
  role: z.enum(['admin', 'regular']).optional().default('regular')
});

const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  password: z.string().min(6).optional()
}).refine(data => data.username || data.password, {
  message: "Forneça pelo menos um campo para atualizar."
});

// --- SEGURANÇA (RATE LIMITING) ---
const retryTimerMinutes = 5;
const maxRequestsPerWindow = 10
const loginLimiter = rateLimit({
  windowMs: retryTimerMinutes * 60 * 1000,
  max: maxRequestsPerWindow,
  message: { message: `Muitas tentativas de login. Tente novamente em ${retryTimerMinutes} minutos.` },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * tags:
 *   - name: Autenticação
 *     description: Rotas de login e sessão
 *   - name: Dados Públicos
 *     description: Consultas de aeronaves e voos (Sem PII)
 *   - name: Gestão de Usuários
 *     description: CRUD de usuários do sistema (Requer Login)
 *   - name: Operações de Voo
 *     description: Acesso a passageiros e cartões de embarque (Requer Operador)
 */

// --- ROTAS PÚBLICAS ---

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Realiza login no sistema
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Credenciais inválidas
 *       429:
 *         description: Muitas tentativas de login
 */
router.post('/login', loginLimiter, validateSchema(loginSchema), AuthController.login);

/**
 * @swagger
 * /api/aircrafts:
 *   get:
 *     summary: Lista todas as aeronaves
 *     tags: [Dados Públicos]
 *     responses:
 *       200:
 *         description: Lista de aeronaves retornada com sucesso
 */
router.get('/aircrafts', PublicDataController.getAllAircrafts);

/**
 * @swagger
 * /api/flights:
 *   get:
 *     summary: Lista todos os voos
 *     tags: [Dados Públicos]
 *     responses:
 *       200:
 *         description: Lista de voos retornada com sucesso
 */
router.get('/flights', PublicDataController.getAllFlights);


// --- ROTAS PROTEGIDAS (OPERADOR E ADMIN) ---

/**
 * @swagger
 * /api/passengers:
 *   get:
 *     summary: Lista todos os passageiros (Requer Operador ou Admin)
 *     tags: [Operações de Voo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de passageiros
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.get('/passengers', authenticateToken, requireOperator, PublicDataController.getAllPassengers);

/**
 * @swagger
 * /api/boarding-details:
 *   get:
 *     summary: Detalhes completos de embarque (JOIN complexo)
 *     description: Retorna cartões de embarque com dados pessoais dos passageiros. (Requer Operador ou Admin)
 *     tags: [Operações de Voo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados detalhados retornados com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get('/boarding-details', authenticateToken, requireOperator, PublicDataController.getBoardingPassDetails); 


// --- ROTAS PRIVADAS (ADMIN) ---

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Cria um novo usuário (Apenas Admins)
 *     tags: [Gestão de Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, regular]
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       403:
 *         description: Acesso negado
 */
router.post('/users', authenticateToken, requireAdmin, validateSchema(createUserSchema), UserController.create);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista todos os usuários (Apenas Admins)
 *     tags: [Gestão de Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
router.get('/users', authenticateToken, requireAdmin, UserController.getAll);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualiza um usuário
 *     description: Admins atualizam qualquer um. Usuários comuns atualizam apenas a si mesmos.
 *     tags: [Gestão de Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       403:
 *         description: Proibido
 */
router.put('/users/:id', authenticateToken, validateSchema(updateUserSchema), UserController.update);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Remove um usuário (Apenas Admins)
 *     tags: [Gestão de Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Usuário deletado
 *       403:
 *         description: Acesso negado
 */
router.delete('/users/:id', authenticateToken, requireAdmin, UserController.delete);

export default router;