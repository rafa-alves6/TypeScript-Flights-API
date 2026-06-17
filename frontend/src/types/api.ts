export interface User {
  id: number;
  username: string;
  role: 'admin' | 'regular';
}

export interface Flight {
  flightId: number;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  aircraftId: number;
}

export interface Passenger {
  passengerId: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  passportNumber: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  errors?: { field: string; message: string }[];
}

export interface CreateUserPayload {
  username: string;
  password: string;
  role: 'admin' | 'regular';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}