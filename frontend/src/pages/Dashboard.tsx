import { useAuth } from '../hooks/useAuth';

export const Dashboard = () => {
  const { user, isOperator, isAdmin } = useAuth();
  return (
    <div className="container">
      <h2>Painel de Controle</h2>
      <div className="card">
        <h3>Bem-vindo, {user?.username}!</h3>
        <p>Seu nível de acesso atual permite as seguintes ações:</p>
        <ul>
          <li>Consultar frota de aeronaves e voos.</li>
          {isOperator && <li>Acessar manifestos de passageiros e dados de embarque (PII).</li>}
          {isAdmin && <li>Criar, editar e excluir usuários do sistema.</li>}
        </ul>
      </div>
    </div>
  );
};