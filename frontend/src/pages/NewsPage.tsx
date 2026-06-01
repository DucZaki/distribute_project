import { useEffect, useState } from 'react'
import { fetchLatestNews } from '../api/integration'

type Article = {
  title?: string
  description?: string
  url?: string
  urlToImage?: string
  publishedAt?: string
  author?: string
  source?: { name?: string }
}

export function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([])

  useEffect(() => {
    fetchLatestNews()
      .then((r) => setArticles((r.data?.articles as Article[]) ?? []))
      .catch(() => setArticles([]))
  }, [])

  const featured = articles.length > 2 ? articles[2] : articles[0]

  return (
    <div className="container py-5" style={{ marginTop: 50 }}>
      <div className="border-start border-4 border-primary ps-3 mb-5">
        <h2 className="fw-bold text-uppercase m-0">Tin tức mới nhất</h2>
        <p className="text-muted mb-0">Cập nhật tin tức du lịch 2026</p>
      </div>

      {articles.length === 0 && (
        <div className="alert alert-light">Chưa có tin (cấu hình NEWS_API_KEY cho integration-service).</div>
      )}

      <div className="row g-4">
        {featured && (
          <div className="col-12 mb-4">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-dark text-white">
              <img
                src={featured.urlToImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200'}
                className="card-img opacity-50"
                style={{ height: 450, objectFit: 'cover' }}
                alt=""
              />
              <div className="card-img-overlay d-flex flex-column justify-content-end p-4 p-md-5">
                <span className="badge bg-danger mb-3" style={{ width: 'fit-content' }}>NỔI BẬT</span>
                <h1 className="card-title fw-bold">{featured.title}</h1>
                <p className="card-text fs-5 d-none d-md-block">{featured.description}</p>
                {featured.url && (
                  <a href={featured.url} target="_blank" rel="noreferrer" className="btn btn-primary rounded-pill px-4" style={{ width: 'fit-content' }}>
                    Đọc ngay
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {articles.map((a, i) => {
          if (articles.length > 2 && i === 2) return null
          return (
            <div key={i} className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden news-card">
                <div className="position-relative">
                  <img
                    src={a.urlToImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
                    className="card-img-top"
                    style={{ height: 200, objectFit: 'cover' }}
                    alt=""
                  />
                  <span className="position-absolute top-0 start-0 m-3 badge bg-warning text-dark">
                    {a.source?.name ?? 'News'}
                  </span>
                </div>
                <div className="card-body d-flex flex-column">
                  <small className="text-muted mb-2">
                    <i className="bi bi-calendar-event me-1" />
                    {a.publishedAt ? String(a.publishedAt).slice(0, 10) : '—'}
                  </small>
                  <h5 className="card-title fw-bold mb-3">{a.title}</h5>
                  <p className="card-text text-muted small">{(a.description ?? '').slice(0, 120)}...</p>
                  <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                    <span className="small fw-bold">{a.author ?? '—'}</span>
                    {a.url && (
                      <a href={a.url} target="_blank" rel="noreferrer" className="text-decoration-none fw-bold small text-warning">
                        Xem thêm <i className="bi bi-arrow-right" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        .news-card { transition: all 0.3s ease; }
        .news-card:hover { transform: translateY(-5px); box-shadow: 0 1rem 3rem rgba(0,0,0,.175)!important; }
      `}</style>
    </div>
  )
}
