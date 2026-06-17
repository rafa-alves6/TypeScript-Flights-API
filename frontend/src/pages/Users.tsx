import { useEffect, useState, type FormEvent } from 'react';
import api from '../services/api';
import type { User, ApiError, CreateUserPayload } from '../types/api';
import { AxiosError } from 'axios';
import { useAuth } from '../hooks/useAuth';

export const Users = () => {
  const { isAdmin } = useAuth();
  
  // Inicializamos users como null. Se for null, significa que ainda está carregando ou buscando dados.
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Estados do formulário
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'regular'>('regular');
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sincronização com a API (Busca inicial de dados)
  useEffect(() => {
    if (!isAdmin) return;
    
    let ignore = false; 
    
    // Não chamamos setLoading(true) aqui. O estado inicial 'null' já indica carregamento.
    api.get<User[]>('/users')
      .then(res => {
        if (!ignore) {
          setUsers(res.data);
          setError(null);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError('Erro ao carregar a lista de usuários.');
        }
      });

    return () => {
      ignore = true; // Previne race conditions
    };
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const res = await api.get<User[]>('/users');
      setUsers(res.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao recarregar usuários", err);
    }
  };

  // Event Handler: Criação de usuário (Lógica de evento, não de efeito)
  const handleCreateUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      const payload: CreateUserPayload = {
        username: newUsername,
        password: newPassword,
        role: newRole
      };
      
      await api.post('/users', payload);
      
      setFormSuccess(`Usuário "${newUsername}" criado com sucesso!`);
      setNewUsername('');
      setNewPassword('');
      setNewRole('regular');
      
      await fetchUsers(); 
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setFormError(axiosError.response?.data?.message || 'Erro ao criar usuário.');
    } finally {
      setSubmitting(false);
    }
  };

  // Event Handler: Exclusão de usuário
  const handleDeleteUser = async (id: number, username: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${username}"?`)) return;

    try {
      await api.delete(`/users/${id}`);
      // Atualiza o estado local removendo o usuário excluído
      setUsers(prev => prev ? prev.filter(u => u.id !== id) : null); 
      setFormSuccess(`Usuário "${username}" excluído.`);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setFormError(axiosError.response?.data?.message || 'Erro ao excluir usuário.');
    }
  };

  if (!isAdmin) return <div className="container"><h2>Acesso Restrito</h2></div>;

  // Derivação de estado: Se users é null e não há erro, está carregando.
  if (users === null && !error) {
    return <div className="container"><h2>Carregando usuários...</h2></div>;
  }

  return (
    <div className="container">
      <h2>Gestão de Usuários do Sistema</h2>
      
      {formError && <div className="alert alert-danger">{formError}</div>}
      {formSuccess && (
        <div style={{ color: '#155724', backgroundColor: '#d4edda', borderColor: '#c3e6cb', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
          {formSuccess}
        </div>
      )}

      <div className="card">
        <h3>Criar Novo Usuário</h3>
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
          <div>
            <label>Nome de Usuário</label>
            <input 
              type="text" 
              value={newUsername} 
              onChange={e => setNewUsername(e.target.value)} 
              required 
              minLength={3}
              style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} 
            />
          </div>
          <div>
            <label>Senha</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              required 
              minLength={6}
              style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} 
            />
          </div>
          <div>
            <label>Nível de Acesso</label>
            <select 
              value={newRole} 
              onChange={e => setNewRole(e.target.value as 'admin' | 'regular')}
              style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
            >
              <option value="regular">Operador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={submitting} 
            style={{ padding: '10px 15px', background: '#003366', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: 'fit-content' }}
          >
            {submitting ? 'Criando...' : '+ Criar Usuário'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Usuários Cadastrados</h3>
        {error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuário</th>
                <th>Perfil</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users && users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.role === 'admin' ? 'Administrador' : 'Operador'}</td>
                  <td>
                    <button 
                      onClick={() => handleDeleteUser(u.id, u.username)}
                      style={{ padding: '5px 10px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};