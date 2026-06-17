import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Flights } from './pages/Flights';
import { Passengers } from './pages/Passengers';
import { Users } from './pages/Users';
import { MyProfile } from './pages/MyProfile'; // NOVO
import { Unauthorized } from './pages/Unauthorized';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/voos" element={<Flights />} />
          <Route path="/nao-autorizado" element={<Unauthorized />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/passageiros" element={
            <ProtectedRoute requiredRole="operator">
              <Passengers />
            </ProtectedRoute>
          } />
          
          <Route path="/usuarios" element={
            <ProtectedRoute requiredRole="admin">
              <Users />
            </ProtectedRoute>
          } />

          {/* Rota de Perfil: Qualquer usuário logado pode acessar */}
          <Route path="/perfil" element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;