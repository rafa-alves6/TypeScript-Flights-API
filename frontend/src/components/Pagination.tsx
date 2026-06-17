interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '25px', alignItems: 'center', flexWrap: 'wrap' }}>
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        style={{ padding: '8px 16px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, borderRadius: '4px', border: '1px solid #ccc', background: 'white' }}
      >
        Anterior
      </button>
      
      {start > 1 && <span style={{ padding: '0 8px' }}>...</span>}
      
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          style={{
            padding: '8px 14px',
            background: p === currentPage ? '#003366' : '#f8f9fa',
            color: p === currentPage ? 'white' : '#333',
            border: p === currentPage ? 'none' : '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: p === currentPage ? 'bold' : 'normal'
          }}
        >
          {p}
        </button>
      ))}

      {end < totalPages && <span style={{ padding: '0 8px' }}>...</span>}

      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
        style={{ padding: '8px 16px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, borderRadius: '4px', border: '1px solid #ccc', background: 'white' }}
      >
        Próxima
      </button>
    </div>
  );
};