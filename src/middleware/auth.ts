import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ZodSchema } from 'zod';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Acesso negado: Token ausente.' });

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Sessão inválida ou expirada.' });
    (req as any).user = user;
    next();
  });
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado: Requer privilégios de Administrador.' });
  }
  next();
};

export const requireOperator = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  // Admins e Operadores (regular) podem acessar rotas operacionais
  if (user.role !== 'admin' && user.role !== 'regular') {
    return res.status(403).json({ message: 'Acesso negado: Requer privilégios de Operador.' });
  }
  next();
};

export const validateSchema = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error: any) {
    res.status(400).json({ 
      message: 'Dados inválidos.', 
      errors: error.errors.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }
};