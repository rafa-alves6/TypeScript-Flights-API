import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const airports = [
  "GRU",
  "GIG",
  "BSB",
  "JFK",
  "MIA",
  "CDG",
  "LHR",
  "NRT",
  "DXB",
  "EZE",
  "LIM",
  "SCL",
];
const flightPrefixes = [
  "LA",
  "AA",
  "G3",
  "AD",
  "AF",
  "BA",
  "EK",
  "LH",
  "IB",
  "TP",
];
const aircraftModels = [
  { model: "737-800", manufacturer: "Boeing", capacity: 162 },
  { model: "777-300ER", manufacturer: "Boeing", capacity: 392 },
  { model: "787-9 Dreamliner", manufacturer: "Boeing", capacity: 296 },
  { model: "A320neo", manufacturer: "Airbus", capacity: 165 },
  { model: "A350-900", manufacturer: "Airbus", capacity: 325 },
  { model: "A330-900neo", manufacturer: "Airbus", capacity: 287 },
  { model: "E195-E2", manufacturer: "Embraer", capacity: 146 },
];

const firstNames = [
  "João",
  "Maria",
  "José",
  "Ana",
  "Pedro",
  "Mariana",
  "Carlos",
  "Juliana",
  "Paulo",
  "Fernanda",
  "Lucas",
  "Beatriz",
  "Gabriel",
  "Larissa",
  "Rafael",
  "Camila",
  "John",
  "Emma",
  "Liam",
  "Olivia",
  "Noah",
  "Ava",
  "Yuki",
  "Hiroshi",
  "Chen",
  "Wei",
  "Mateo",
  "Sofia",
  "Diego",
  "Valentina",
];
const lastNames = [
  "Silva",
  "Santos",
  "Oliveira",
  "Souza",
  "Lima",
  "Pereira",
  "Costa",
  "Rodrigues",
  "Martins",
  "Almeida",
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Tanaka",
  "Sato",
  "Wang",
  "Li",
  "Hernandez",
  "Lopez",
  "Gonzalez",
];

function randomDate(startYear: number, endYear: number) {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  return new Date(start + Math.random() * (end - start));
}

function randomPassport() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let res = "";
  for (let i = 0; i < 8; i++)
    res += chars[Math.floor(Math.random() * chars.length)];
  return res;
}

async function main() {
  console.log("🌱 Iniciando Seed do Banco de Dados...");

  await prisma.boardingPass.deleteMany();
  await prisma.passenger.deleteMany();
  await prisma.flight.deleteMany();
  await prisma.aircraft.deleteMany();
  await prisma.sysUser.deleteMany();

  console.log("👤 Criando usuários...");
  const password = await bcrypt.hash("123456", 10);
  await prisma.sysUser.createMany({
    data: [
      { username: "admin", password, role: "admin" },
      { username: "operador.gru", password, role: "regular" },
      { username: "operador.gig", password, role: "regular" },
      { username: "operador.cdg", password, role: "regular" },
    ],
  });

  const adminUser = await prisma.sysUser.findFirst({
    where: { username: "admin" },
  });
  const adminId = adminUser?.id;

  console.log("✈️ Criando frota de aeronaves...");
  const aircraftData = Array.from({ length: 50 }).map(() => {
    const template =
      aircraftModels[Math.floor(Math.random() * aircraftModels.length)];
    return { ...template };
  });
  await prisma.aircraft.createMany({ data: aircraftData });
  const aircrafts = await prisma.aircraft.findMany();

  console.log("🌍 Criando malha aérea (voos)...");
  const flightsData = Array.from({ length: 500 }).map(() => {
    let dep = airports[Math.floor(Math.random() * airports.length)];
    let arr = airports[Math.floor(Math.random() * airports.length)];
    while (dep === arr)
      arr = airports[Math.floor(Math.random() * airports.length)];

    const prefix =
      flightPrefixes[Math.floor(Math.random() * flightPrefixes.length)];
    const flightNumber = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;

    const departureTime = new Date(
      Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000,
    );
    const flightDurationMs = (2 + Math.random() * 12) * 60 * 60 * 1000;
    const arrivalTime = new Date(departureTime.getTime() + flightDurationMs);

    return {
      flightNumber,
      departureAirport: dep,
      arrivalAirport: arr,
      departureTime,
      arrivalTime,
      aircraftId:
        aircrafts[Math.floor(Math.random() * aircrafts.length)].aircraftId,
      createdById: adminId, // Atribuindo o Admin como criador
    };
  });
  await prisma.flight.createMany({ data: flightsData });
  const flights = await prisma.flight.findMany();

  console.log("🧑‍🤝‍🧑 Gerando 100 passageiros...");
  const passengersData = Array.from({ length: 100 }).map(() => ({
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    birthDate: randomDate(1950, 2015),
    passportNumber: randomPassport(),
    createdById: adminId, // Atribuindo o Admin como criador
  }));

  const PASSENGER_BATCH = 100;
  for (let i = 0; i < passengersData.length; i += PASSENGER_BATCH) {
    const chunk = passengersData.slice(i, i + PASSENGER_BATCH);
    await prisma.passenger.createMany({ data: chunk });
  }
  const passengers = await prisma.passenger.findMany();

  console.log("🎫 Emitindo cartões de embarque...");
  const seats = ["A", "B", "C", "D", "E", "F"];
  const boardingPassesData = passengers.map((p) => {
    const flight = flights[Math.floor(Math.random() * flights.length)];
    const seatRow = Math.floor(Math.random() * 30) + 1;
    const seatLetter = seats[Math.floor(Math.random() * seats.length)];

    return {
      seatNumber: `${seatRow}${seatLetter}`,
      passengerId: p.passengerId,
      flightId: flight.flightId,
      issueTime: new Date(
        flight.departureTime.getTime() - Math.random() * 48 * 60 * 60 * 1000,
      ),
    };
  });

  const BOARDING_BATCH = 1000;
  for (let i = 0; i < boardingPassesData.length; i += BOARDING_BATCH) {
    const chunk = boardingPassesData.slice(i, i + BOARDING_BATCH);
    await prisma.boardingPass.createMany({ data: chunk });
  }

  console.log("✅ Seed concluído com sucesso!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
