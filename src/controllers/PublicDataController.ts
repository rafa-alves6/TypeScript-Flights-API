import { Request, Response } from 'express';
import prisma from '../prisma';

export class PublicDataController {
  static async getAllAircrafts(req: Request, res: Response) {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [data, total] = await prisma.$transaction([
      prisma.aircraft.findMany({ skip, take: limit, orderBy: { aircraftId: 'asc' } }),
      prisma.aircraft.count()
    ]);

    res.json({ data, total, page, limit });
  }

  static async getAllFlights(req: Request, res: Response) {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [data, total] = await prisma.$transaction([
      prisma.flight.findMany({ skip, take: limit, orderBy: { flightId: 'asc' } }),
      prisma.flight.count()
    ]);

    res.json({ data, total, page, limit });
  }

  static async getAllPassengers(req: Request, res: Response) {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [data, total] = await prisma.$transaction([
      prisma.passenger.findMany({ skip, take: limit, orderBy: { passengerId: 'asc' } }),
      prisma.passenger.count()
    ]);

    res.json({ data, total, page, limit });
  }

  static async getBoardingPassDetails(req: Request, res: Response) {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    try {
      const [results, total] = await prisma.$transaction([
        prisma.boardingPass.findMany({
          skip,
          take: limit,
          include: {
            passenger: true,
            flight: { include: { aircraft: true } }
          },
          orderBy: { boardingPassId: 'asc' }
        }),
        prisma.boardingPass.count()
      ]);

      const formattedResponse = results.map(bp => ({
        boarding_pass_id: bp.boardingPassId,
        seat_number: bp.seatNumber,
        issue_time: bp.issueTime,
        passenger_first_name: bp.passenger.firstName,
        passenger_last_name: bp.passenger.lastName,
        passenger_birth_date: bp.passenger.birthDate,
        passenger_passport_number: bp.passenger.passportNumber,
        flight_number: bp.flight.flightNumber,
        departure_airport: bp.flight.departureAirport,
        arrival_airport: bp.flight.arrivalAirport,
        departure_time: bp.flight.departureTime,
        arrival_time: bp.flight.arrivalTime,
        aircraft_model: bp.flight.aircraft.model,
        aircraft_manufacturer: bp.flight.aircraft.manufacturer,
        aircraft_capacity: bp.flight.aircraft.capacity
      }));

      res.json({ data: formattedResponse, total, page, limit });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar detalhes de embarque.' });
    }
  }
}