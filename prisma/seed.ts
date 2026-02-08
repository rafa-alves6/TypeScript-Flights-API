import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. criar usuarios 
  const password = await bcrypt.hash('123456', 10);
  await prisma.sysUser.createMany({
    data: [
      { username: 'admin', password, role: 'admin' },
      { username: 'operator1', password, role: 'regular' },
      { username: 'operator2', password, role: 'regular' },
      { username: 'operator3', password, role: 'regular' },
    ],
    skipDuplicates: true,
  });

  // 2. criar 50 avioes 
  const aircraftData = Array.from({ length: 50 }).map((_, i) => ({
    model: `Model-${i}`,
    manufacturer: i % 2 === 0 ? 'Boeing' : 'Airbus',
    capacity: 150 + (i * 2),
  }));
  await prisma.aircraft.createMany({ data: aircraftData });
  
  const aircrafts = await prisma.aircraft.findMany();

  // 3. criar 500 voos 
  const flightsData = Array.from({ length: 500 }).map((_, i) => ({
    flightNumber: `FL${1000 + i}`,
    departureAirport: 'GRU',
    arrivalAirport: 'JFK',
    departureTime: new Date(),
    arrivalTime: new Date(new Date().getTime() + 5 * 60 * 60 * 1000), 
    aircraftId: aircrafts[i % 50].aircraftId,
  }));
  await prisma.flight.createMany({ data: flightsData });
  
  const flights = await prisma.flight.findMany();

  // 4. criar 10000 passageiros e passes 
  console.log('Criando passageiros e passes...');
  
  for (let i = 0; i < 100; i++) { 
    const passengersChunk = [];
    for (let j = 0; j < 100; j++) {
       passengersChunk.push({
         firstName: `Passenger${i}-${j}`,
         lastName: `Doe`,
         birthDate: new Date('1990-01-01'),
         passportNumber: `P${i}${j}X`
       });
    }
    
        for (const p of passengersChunk) {
        const createdPassenger = await prisma.passenger.create({ data: p });
        const randomFlight = flights[Math.floor(Math.random() * flights.length)];
        
        await prisma.boardingPass.create({
            data: {
                seatNumber: `${Math.floor(Math.random() * 30)}A`,
                passengerId: createdPassenger.passengerId,
                flightId: randomFlight.flightId
            }
        });
    }
  }

  console.log('Seed completo.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
