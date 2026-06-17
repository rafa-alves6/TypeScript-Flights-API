import { Link } from 'react-router-dom';

export const Unauthorized = () => {
  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2 style={{ color: 'red' }}>Acesso Negado (403)</h2>
      <p>Você não possui privilégios administrativos para acessar esta área.</p>
      <Link to="/" style={{ color: '#003366', fontWeight: 'bold' }}>Voltar ao Painel</Link>
    </div>
  );
};