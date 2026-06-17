import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Navbar = () => {
  const { user, logout, isAdmin, isOperator, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#003366', color: 'white', marginBottom: '2rem' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>✈️ Gestão de Voos</div>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Painel</Link>
        <Link to="/voos" style={{ color: 'white', textDecoration: 'none' }}>Voos</Link>
        
        {isOperator && (
          <Link to="/passageiros" style={{ color: 'white', textDecoration: 'none' }}>Passageiros</Link>
        )}
        
        {isAdmin && (
          <Link to="/usuarios" style={{ color: 'white', textDecoration: 'none' }}>Gerenciar Usuários</Link>
        )}
      </div>
      
      {isAuthenticated && user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem' }}>
            Olá, <strong>{user.username}</strong> ({user.role === 'admin' ? 'Admin' : 'Operador'})
          </span>
          <Link to="/perfil" style={{ color: '#ffd700', textDecoration: 'none', fontSize: '0.9rem' }}>Meu Perfil</Link>
          <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sair</button>
        </div>
      )}
    </nav>
  );
};