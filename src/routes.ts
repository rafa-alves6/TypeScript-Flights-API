import { Router } from 'express';
import { AuthController } from './controllers/AuthController';
import { UserController } from './controllers/UserController';
import { PublicDataController } from './controllers/PublicDataController';
import { authenticateToken, requireAdmin } from './middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Rotas de autenticação
 *   - name: Public Data
 *     description: Consultas públicas de voos e passageiros
 *   - name: Users
 *     description: Gestão de usuários do sistema (Requer Login)
 */

// --- ROTAS PÚBLICAS ---

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Realiza login no sistema
 *     tags: [Auth]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticação nas rotas privadas
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /api/aircrafts:
 *   get:
 *     summary: Lista todas as aeronaves
 *     tags: [Public Data]
 *     responses:
 *       200:
 *         description: Lista de aeronaves retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   aircraftId:
 *                     type: integer
 *                   model:
 *                     type: string
 *                   manufacturer:
 *                     type: string
 *                   capacity:
 *                     type: integer
 */
router.get('/aircrafts', PublicDataController.getAllAircrafts);

/**
 * @swagger
 * /api/flights:
 *   get:
 *     summary: Lista todos os voos
 *     tags: [Public Data]
 *     responses:
 *       200:
 *         description: Lista de voos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   flightId:
 *                     type: integer
 *                   flightNumber:
 *                     type: string
 *                   departureAirport:
 *                     type: string
 *                   arrivalAirport:
 *                     type: string
 *                   departureTime:
 *                     type: string
 *                     format: date-time
 *                   arrivalTime:
 *                     type: string
 *                     format: date-time
 */
router.get('/flights', PublicDataController.getAllFlights);

/**
 * @swagger
 * /api/passengers:
 *   get:
 *     summary: Lista todos os passageiros
 *     tags: [Public Data]
 *     responses:
 *       200:
 *         description: Lista de passageiros retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   passengerId:
 *                     type: integer
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   birthDate:
 *                     type: string
 *                     format: date-time
 *                   passportNumber:
 *                     type: string
 */
router.get('/passengers', PublicDataController.getAllPassengers);

/**
 * @swagger
 * /api/boarding-details:
 *   get:
 *     summary: Detalhes completos de embarque (Big Query)
 *     description: Retorna uma junção de dados (JOIN) entre Cartão de Embarque, Passageiro, Voo e Aeronave. Usado para teste de carga.
 *     tags: [Public Data]
 *     responses:
 *       200:
 *         description: Dados detalhados retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   boarding_pass_id:
 *                     type: integer
 *                   seat_number:
 *                     type: string
 *                   issue_time:
 *                     type: string
 *                     format: date-time
 *                   passenger_first_name:
 *                     type: string
 *                   passenger_last_name:
 *                     type: string
 *                   passenger_birth_date:
 *                     type: string
 *                     format: date-time
 *                   passenger_passport_number:
 *                     type: string
 *                   flight_number:
 *                     type: string
 *                   departure_airport:
 *                     type: string
 *                   arrival_airport:
 *                     type: string
 *                   departure_time:
 *                     type: string
 *                     format: date-time
 *                   arrival_time:
 *                     type: string
 *                     format: date-time
 *                   aircraft_model:
 *                     type: string
 *                   aircraft_manufacturer:
 *                     type: string
 *                   aircraft_capacity:
 *                     type: integer
 */
router.get('/boarding-details', PublicDataController.getBoardingPassDetails); 

// --- ROTAS PRIVADAS ---

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Cria um novo usuário operador
 *     description: Apenas usuários 'admin' podem criar novos operadores.
 *     tags: [Users]
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
 *                 default: regular
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       403:
 *         description: Acesso negado (Requer Admin)
 *       401:
 *         description: Não autorizado (Token inválido ou ausente)
 */
router.post('/users', authenticateToken, requireAdmin, UserController.create);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualiza um usuário existente
 *     description: Admins podem atualizar qualquer usuário. Usuários comuns só atualizam a si mesmos.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
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
 *         description: Proibido (Tentativa de alterar outro usuário sem ser admin)
 */
router.put('/users/:id', authenticateToken, UserController.update);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Remove um usuário do sistema
 *     description: Apenas administradores podem deletar usuários.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário a ser deletado
 *     responses:
 *       204:
 *         description: Usuário deletado com sucesso
 *       403:
 *         description: Acesso negado (Requer Admin)
 */
router.delete('/users/:id', authenticateToken, requireAdmin, UserController.delete);

export default router;
