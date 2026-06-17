import { useState, type FormEvent } from 'react';
import api from '../services/api';
import type { User, ApiError } from '../types/api';
import { AxiosError } from 'axios';
import { useAuth } from '../hooks/useAuth';

export const MyProfile = () => {
  const { user, updateUser } = useAuth();
  
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    // Monta o payload apenas com o que foi alterado
    const payload: { username?: string; password?: string } = {};
    if (newUsername !== user.username) payload.username = newUsername;
    if (newPassword) payload.password = newPassword;

    if (Object.keys(payload).length === 0) {
      setError('Nenhuma alteração detectada.');
      setSubmitting(false);
      return;
    }

    try {
      const response = await api.put<User>(`/users/${user.id}`, payload);
      
      // Atualiza o Contexto e o SessionStorage com o novo nome de usuário
      updateUser(response.data);
      
      setSuccess('Perfil atualizado com sucesso!');
      setNewPassword(''); // Limpa o campo de senha
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(axiosError.response?.data?.message || 'Erro ao atualizar perfil.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2>Meu Perfil</h2>
      <div className="card">
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Aqui você pode alterar seu nome de usuário ou redefinir sua senha de acesso ao sistema.
        </p>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div style={{ color: '#155724', backgroundColor: '#d4edda', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
            <label>Nova Senha <span style={{ fontSize: '0.8rem', color: '#888' }}>(Deixe em branco para manter a atual)</span></label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              minLength={6}
              placeholder="••••••••"
              style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={submitting} 
            style={{ padding: '12px', background: '#003366', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}
          >
            {submitting ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  );
};