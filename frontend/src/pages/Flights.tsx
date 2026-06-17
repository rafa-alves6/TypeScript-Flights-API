import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Flight, PaginatedResponse } from '../types/api';
import { Pagination } from '../components/Pagination';

export const Flights = () => {
  const [page, setPage] = useState(1);
  const [flights, setFlights] = useState<Flight[] | null>(null);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    let ignore = false;

    api.get<PaginatedResponse<Flight>>('/flights', { params: { page, limit } })
      .then(res => {
        if (!ignore) {
          setFlights(res.data.data);
          setTotal(res.data.total);
        }
      })
      .catch(err => {
        if (!ignore) console.error(err);
      });

    return () => {
      ignore = true; // Ignora respostas stale se o usuário mudar de página rápido
    };
  }, [page, limit]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container">
      <h2>Malha Aérea (Voos)</h2>
      <p style={{ color: '#666' }}>Exibindo {flights?.length || 0} de {total} voos totais.</p>
      
      {flights === null ? (
        <p>Carregando dados...</p>
      ) : (
        <>
          <table>
            <thead><tr><th>Voo</th><th>Origem</th><th>Destino</th><th>Partida</th></tr></thead>
            <tbody>
              {flights.map(f => (
                <tr key={f.flightId}>
                  <td>{f.flightNumber}</td>
                  <td>{f.departureAirport}</td>
                  <td>{f.arrivalAirport}</td>
                  <td>{new Date(f.departureTime).toLocaleString('pt-BR')}</td>
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