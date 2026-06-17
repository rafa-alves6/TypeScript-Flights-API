import { Request, Response } from "express";
import prisma from "../prisma";

export class FlightController {
  static async create(req: Request, res: Response) {
    const {
      flightNumber,
      departureAirport,
      arrivalAirport,
      departureTime,
      arrivalTime,
      aircraftId,
    } = req.body;
    const userId = (req as any).user?.id; // Pega o ID do usuário logado

    try {
      const flight = await prisma.flight.create({
        data: {
          flightNumber,
          departureAirport,
          arrivalAirport,
          departureTime: new Date(departureTime),
          arrivalTime: new Date(arrivalTime),
          aircraftId,
          createdById: userId, // Define quem criou
        },
        include: { createdBy: { select: { id: true, username: true } } }, // Retorna o criador
      });
      res.status(201).json(flight);
    } catch (error: any) {
      res
        .status(400)
        .json({ message: "Erro ao criar voo.", error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    const id = parseInt(req.params.id as string);
    const {
      flightNumber,
      departureAirport,
      arrivalAirport,
      departureTime,
      arrivalTime,
      aircraftId,
    } = req.body;
    const user = (req as any).user;

    try {
      // Verifica se o voo existe e quem é o dono
      const flight = await prisma.flight.findUnique({
        where: { flightId: id },
      });
      if (!flight)
        return res.status(404).json({ message: "Voo não encontrado." });

      // Regra de negócio: Só admin ou o criador pode editar
      if (user.role !== "admin" && flight.createdById !== user.id) {
        return res.status(403).json({
          message: "Acesso negado: Você só pode editar voos que criou.",
        });
      }

      const data: any = {};
      if (flightNumber !== undefined) data.flightNumber = flightNumber;
      if (departureAirport !== undefined)
        data.departureAirport = departureAirport;
      if (arrivalAirport !== undefined) data.arrivalAirport = arrivalAirport;
      if (departureTime !== undefined)
        data.departureTime = new Date(departureTime);
      if (arrivalTime !== undefined) data.arrivalTime = new Date(arrivalTime);
      if (aircraftId !== undefined) data.aircraftId = aircraftId;

      const updatedFlight = await prisma.flight.update({
        where: { flightId: id },
        data,
        include: { createdBy: { select: { id: true, username: true } } },
      });
      res.json(updatedFlight);
    } catch (error: any) {
      res
        .status(400)
        .json({ message: "Erro ao atualizar voo.", error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    const id = parseInt(req.params.id as string);
    try {
      await prisma.$transaction([
        prisma.boardingPass.deleteMany({ where: { flightId: id } }),
        prisma.flight.delete({ where: { flightId: id } }),
      ]);
      res.status(204).send();
    } catch (error: any) {
      res
        .status(400)
        .json({ message: "Erro ao deletar voo.", error: error.message });
    }
  }
}
