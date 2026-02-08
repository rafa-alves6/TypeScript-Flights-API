import { Router } from 'express';
import { AuthController } from './controllers/AuthController';
import { UserController } from './controllers/UserController';
import { PublicDataController } from './controllers/PublicDataController';
import { authenticateToken, requireAdmin } from './middleware/auth';

const router = Router();

// rotas publicas 
router.post('/login', AuthController.login);
router.get('/aircrafts', PublicDataController.getAllAircrafts);
router.get('/flights', PublicDataController.getAllFlights);
router.get('/passengers', PublicDataController.getAllPassengers);
router.get('/boarding-details', PublicDataController.getBoardingPassDetails); 

// rotas privadas 
router.post('/users', authenticateToken, requireAdmin, UserController.create);
router.put('/users/:id', authenticateToken, UserController.update);
router.delete('/users/:id', authenticateToken, requireAdmin, UserController.delete);

export default router;
