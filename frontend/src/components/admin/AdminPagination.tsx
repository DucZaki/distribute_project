type Props = {
  page: number
  totalPages: number
  onPage: (page: number) => void
}

export function AdminPagination({ page, totalPages, onPage }: Props) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i)
  return (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center mt-4">
        <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
          <button type="button" className="page-link" disabled={page === 0} onClick={() => onPage(page - 1)}>
            &laquo;
          </button>
        </li>
        {pages.map((i) => (
          <li key={i} className={`page-item ${i === page ? 'active' : ''}`}>
            <button type="button" className="page-link" onClick={() => onPage(i)}>
              {i + 1}
            </button>
          </li>
        ))}
        <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            disabled={page >= totalPages - 1}
            onClick={() => onPage(page + 1)}
          >
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  )
}
