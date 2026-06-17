import { Request, Response } from "express";
import prisma from "../prisma";

export class PassengerController {
  static async create(req: Request, res: Response) {
    const { firstName, lastName, birthDate, passportNumber } = req.body;
    const userId = (req as any).user?.id;

    try {
      const passenger = await prisma.passenger.create({
        data: {
          firstName,
          lastName,
          birthDate: new Date(birthDate),
          passportNumber,
          createdById: userId,
        },
        include: { createdBy: { select: { id: true, username: true } } },
      });
      res.status(201).json(passenger);
    } catch (error: any) {
      res
        .status(400)
        .json({ message: "Erro ao criar passageiro.", error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    const id = parseInt(req.params.id as string);
    const { firstName, lastName, birthDate, passportNumber } = req.body;
    const user = (req as any).user;

    try {
      const passenger = await prisma.passenger.findUnique({
        where: { passengerId: id },
      });
      if (!passenger)
        return res.status(404).json({ message: "Passageiro não encontrado." });

      // Regra de negócio: Só admin ou o criador pode editar
      if (user.role !== "admin" && passenger.createdById !== user.id) {
        return res.status(403).json({
          message: "Acesso negado: Você só pode editar passageiros que criou.",
        });
      }

      const data: any = {};
      if (firstName !== undefined) data.firstName = firstName;
      if (lastName !== undefined) data.lastName = lastName;
      if (birthDate !== undefined) data.birthDate = new Date(birthDate);
      if (passportNumber !== undefined) data.passportNumber = passportNumber;

      const updatedPassenger = await prisma.passenger.update({
        where: { passengerId: id },
        data,
        include: { createdBy: { select: { id: true, username: true } } },
      });
      res.json(updatedPassenger);
    } catch (error: any) {
      res.status(400).json({
        message: "Erro ao atualizar passageiro.",
        error: error.message,
      });
    }
  }

  static async delete(req: Request, res: Response) {
    const id = parseInt(req.params.id as string);
    try {
      await prisma.$transaction([
        prisma.boardingPass.deleteMany({ where: { passengerId: id } }),
        prisma.passenger.delete({ where: { passengerId: id } }),
      ]);
      res.status(204).send();
    } catch (error: any) {
      res
        .status(400)
        .json({ message: "Erro ao deletar passageiro.", error: error.message });
    }
  }
}
