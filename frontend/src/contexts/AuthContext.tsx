import { createContext } from 'react';
import type { User } from '../types/api';

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOperator: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);