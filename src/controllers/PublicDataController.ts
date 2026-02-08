import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PublicDataController {
  static async getAllAircrafts(req: Request, res: Response) {
    const data = await prisma.aircraft.findMany();
    res.json(data);
  }

  static async getAllFlights(req: Request, res: Response) {
    const data = await prisma.flight.findMany();
    res.json(data);
  }

  static async getAllPassengers(req: Request, res: Response) {
    const data = await prisma.passenger.findMany();
    res.json(data);
  }

  static async getBoardingPassDetails(req: Request, res: Response) {
    try {
      const results = await prisma.boardingPass.findMany({
        include: {
          passenger: true,
          flight: {
            include: {
              aircraft: true
            }
          }
        },
        orderBy: {
          boardingPassId: 'asc'
        }
      });

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

      res.json(formattedResponse);
    } catch (error) {
        console.error(error);
      res.status(500).json({ message: 'Error fetching details' });
    }
  }
}
