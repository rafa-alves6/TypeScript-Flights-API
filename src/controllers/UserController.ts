import { Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import prisma from '../prisma'; 
import bcrypt from 'bcryptjs';

const userRepo = new UserRepository(prisma);

export class UserController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await userRepo.findAll();
      // Remove a senha do retorno por segurança
      const usersWithoutPassword = users.map(({ password, ...rest }) => rest);
      res.json(usersWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar usuários.' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    const { username, password, role } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await userRepo.create({
        username,
        password: hashedPassword,
        role: role || 'regular',
      });
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(400).json({ message: 'Nome de usuário já existe.' });
      } else {
        res.status(400).json({ message: 'Erro ao criar usuário.' });
      }
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string);
    const { username, password } = req.body;
    
    const requestUser = (req as any).user;

    if (requestUser.role !== 'admin' && requestUser.id !== id) {
       res.status(403).json({ message: 'Proibido: Você só pode alterar seu próprio perfil.' });
       return;
    }

    try {
      const data: any = {};
      if (username) data.username = username;
      if (password) {
        data.password = await bcrypt.hash(password, 10);
      }
      
      const updatedUser = await userRepo.update(id, data);
      const { password: _, ...userResponse } = updatedUser;
      res.json(userResponse);
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(400).json({ message: 'Nome de usuário já existe.' });
      } else {
        res.status(400).json({ message: 'Erro ao atualizar usuário.' });
      }
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string);
    try {
      await userRepo.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: 'Erro ao deletar usuário.' });
    }
  }
}