-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'regular');

-- CreateTable
CREATE TABLE "sys_user" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'regular',

    CONSTRAINT "sys_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aircraft" (
    "aircraft_id" SERIAL NOT NULL,
    "model" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "aircraft_pkey" PRIMARY KEY ("aircraft_id")
);

-- CreateTable
CREATE TABLE "passenger" (
    "passenger_id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "birth_date" DATE NOT NULL,
    "passport_number" TEXT NOT NULL,

    CONSTRAINT "passenger_pkey" PRIMARY KEY ("passenger_id")
);

-- CreateTable
CREATE TABLE "flight" (
    "flight_id" SERIAL NOT NULL,
    "flight_number" TEXT NOT NULL,
    "departure_airport" TEXT NOT NULL,
    "arrival_airport" TEXT NOT NULL,
    "departure_time" TIMESTAMP(3) NOT NULL,
    "arrival_time" TIMESTAMP(3) NOT NULL,
    "aircraft_id" INTEGER NOT NULL,

    CONSTRAINT "flight_pkey" PRIMARY KEY ("flight_id")
);

-- CreateTable
CREATE TABLE "boarding_pass" (
    "boarding_pass_id" SERIAL NOT NULL,
    "seat_number" TEXT NOT NULL,
    "issue_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "passenger_id" INTEGER NOT NULL,
    "flight_id" INTEGER NOT NULL,

    CONSTRAINT "boarding_pass_pkey" PRIMARY KEY ("boarding_pass_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sys_user_username_key" ON "sys_user"("username");

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_aircraft_id_fkey" FOREIGN KEY ("aircraft_id") REFERENCES "aircraft"("aircraft_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boarding_pass" ADD CONSTRAINT "boarding_pass_passenger_id_fkey" FOREIGN KEY ("passenger_id") REFERENCES "passenger"("passenger_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boarding_pass" ADD CONSTRAINT "boarding_pass_flight_id_fkey" FOREIGN KEY ("flight_id") REFERENCES "flight"("flight_id") ON DELETE RESTRICT ON UPDATE CASCADE;
