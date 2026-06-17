import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// --- DADOS REALISTAS ---
const airports = ['GRU', 'GIG', 'BSB', 'JFK', 'MIA', 'CDG', 'LHR', 'NRT', 'DXB', 'EZE', 'LIM', 'SCL'];
const flightPrefixes = ['LA', 'AA', 'G3', 'AD', 'AF', 'BA', 'EK', 'LH', 'IB', 'TP'];
const aircraftModels = [
  { model: 'Boeing 737-800', manufacturer: 'Boeing', capacity: 162 },
  { model: 'Boeing 777-300ER', manufacturer: 'Boeing', capacity: 392 },
  { model: 'Boeing 787-9 Dreamliner', manufacturer: 'Boeing', capacity: 296 },
  { model: 'Airbus A320neo', manufacturer: 'Airbus', capacity: 165 },
  { model: 'Airbus A350-900', manufacturer: 'Airbus', capacity: 325 },
  { model: 'Airbus A330-900neo', manufacturer: 'Airbus', capacity: 287 },
  { model: 'Embraer E195-E2', manufacturer: 'Embraer', capacity: 146 },
];

const firstNames = ['João', 'Maria', 'José', 'Ana', 'Pedro', 'Mariana', 'Carlos', 'Juliana', 'Paulo', 'Fernanda', 'Lucas', 'Beatriz', 'Gabriel', 'Larissa', 'Rafael', 'Camila', 'John', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Yuki', 'Hiroshi', 'Chen', 'Wei', 'Mateo', 'Sofia', 'Diego', 'Valentina'];
const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Costa', 'Rodrigues', 'Martins', 'Almeida', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Tanaka', 'Sato', 'Wang', 'Li', 'Hernandez', 'Lopez', 'Gonzalez'];

function randomDate(startYear: number, endYear: number) {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  return new Date(start + Math.random() * (end - start));
}

function randomPassport() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let res = '';
  for(let i=0; i<8; i++) res += chars[Math.floor(Math.random() * chars.length)];
  return res;
}

async function main() {
  console.log('🌱 Iniciando Seed do Banco de Dados...');

  // 1. Limpar dados antigos (Opcional, mas recomendado para evitar duplicatas no seed)
  await prisma.boardingPass.deleteMany();
  await prisma.passenger.deleteMany();
  await prisma.flight.deleteMany();
  await prisma.aircraft.deleteMany();
  await prisma.sysUser.deleteMany();

  // 2. Criar Usuários
  console.log('👤 Criando usuários...');
  const password = await bcrypt.hash('123456', 10);
  await prisma.sysUser.createMany({
    data: [
      { username: 'admin', password, role: 'admin' },
      { username: 'operador.gru', password, role: 'regular' },
      { username: 'operador.gig', password, role: 'regular' },
      { username: 'operador.cdg', password, role: 'regular' },
    ],
  });

  // 3. Criar 50 Aeronaves Reais
  console.log('✈️ Criando frota de aeronaves...');
  const aircraftData = Array.from({ length: 50 }).map(() => {
    const template = aircraftModels[Math.floor(Math.random() * aircraftModels.length)];
    return { ...template };
  });
  await prisma.aircraft.createMany({ data: aircraftData });
  const aircrafts = await prisma.aircraft.findMany();

  // 4. Criar 500 Voos Realistas
  console.log('🌍 Criando malha aérea (voos)...');
  const flightsData = Array.from({ length: 500 }).map(() => {
    let dep = airports[Math.floor(Math.random() * airports.length)];
    let arr = airports[Math.floor(Math.random() * airports.length)];
    while (dep === arr) arr = airports[Math.floor(Math.random() * airports.length)]; // Evita voo de origem para a mesma origem

    const prefix = flightPrefixes[Math.floor(Math.random() * flightPrefixes.length)];
    const flightNumber = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Voos partindo nos próximos 30 dias
    const departureTime = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);
    const flightDurationMs = (2 + Math.random() * 12) * 60 * 60 * 1000; // Entre 2 e 14 horas de voo
    const arrivalTime = new Date(departureTime.getTime() + flightDurationMs);

    return {
      flightNumber,
      departureAirport: dep,
      arrivalAirport: arr,
      departureTime,
      arrivalTime,
      aircraftId: aircrafts[Math.floor(Math.random() * aircrafts.length)].aircraftId,
    };
  });
  await prisma.flight.createMany({ data: flightsData });
  const flights = await prisma.flight.findMany();

  // 5. Criar 10.000 Passageiros (Em lotes para performance)
  console.log('🧑‍🤝‍🧑 Gerando 10.000 passageiros...');
  const passengersData = Array.from({ length: 10000 }).map(() => ({
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    birthDate: randomDate(1950, 2015),
    passportNumber: randomPassport()
  }));

  const PASSENGER_BATCH = 1000;
  for (let i = 0; i < passengersData.length; i += PASSENGER_BATCH) {
    const chunk = passengersData.slice(i, i + PASSENGER_BATCH);
    await prisma.passenger.createMany({ data: chunk });
  }
  const passengers = await prisma.passenger.findMany();

  // 6. Criar Cartões de Embarque (Em lotes)
  console.log('🎫 Emitindo cartões de embarque...');
  const seats = ['A', 'B', 'C', 'D', 'E', 'F'];
  const boardingPassesData = passengers.map(p => {
    const flight = flights[Math.floor(Math.random() * flights.length)];
    const seatRow = Math.floor(Math.random() * 30) + 1;
    const seatLetter = seats[Math.floor(Math.random() * seats.length)];
    
    return {
      seatNumber: `${seatRow}${seatLetter}`,
      passengerId: p.passengerId,
      flightId: flight.flightId,
      issueTime: new Date(flight.departureTime.getTime() - Math.random() * 48 * 60 * 60 * 1000) // Emitido até 48h antes do voo
    };
  });

  const BOARDING_BATCH = 1000;
  for (let i = 0; i < boardingPassesData.length; i += BOARDING_BATCH) {
    const chunk = boardingPassesData.slice(i, i + BOARDING_BATCH);
    await prisma.boardingPass.createMany({ data: chunk });
  }

  console.log('✅ Seed concluído com sucesso! Banco populado com dados realistas.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());