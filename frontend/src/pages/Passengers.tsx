import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Passenger, PaginatedResponse, ApiError } from '../types/api';
import { AxiosError } from 'axios';
import { Pagination } from '../components/Pagination';

export const Passengers = () => {
  const [page, setPage] = useState(1);
  const [passengers, setPassengers] = useState<Passenger[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const limit = 20;

  useEffect(() => {
    let ignore = false;

    api.get<PaginatedResponse<Passenger>>('/passengers', { params: { page, limit } })
      .then(res => {
        if (!ignore) {
          setPassengers(res.data.data);
          setTotal(res.data.total);
        }
      })
      .catch((err: AxiosError<ApiError>) => {
        if (!ignore) {
          setError(err.response?.data?.message || 'Acesso negado ou erro ao buscar dados sensíveis.');
        }
      });

    return () => {
      ignore = true;
    };
  }, [page, limit]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container">
      <h2>Manifesto de Passageiros</h2>
      <div className="alert alert-info">⚠️ Atenção: Esta tela contém Dados Pessoais Sensíveis (PII) protegidos por lei (LGPD).</div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {passengers === null && !error ? (
        <p>Carregando dados sensíveis...</p>
      ) : !error && passengers && (
        <>
          <p style={{ color: '#666' }}>Exibindo {passengers.length} de {total} passageiros totais.</p>
          <table>
            <thead><tr><th>Nome</th><th>Passaporte</th><th>Nascimento</th></tr></thead>
            <tbody>
              {passengers.map(p => (
                <tr key={p.passengerId}>
                  <td>{p.firstName} {p.lastName}</td>
                  <td>{p.passportNumber}</td>
                  <td>{new Date(p.birthDate).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};