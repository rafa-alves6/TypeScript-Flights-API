import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import prisma from '../prisma'; 

const userRepo = new UserRepository(prisma);

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    try {
      const user = await userRepo.findByUsername(username);

      if (!user) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
      );

      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
