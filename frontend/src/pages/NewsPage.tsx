import { useEffect, useState } from 'react'
import { fetchLatestNews } from '../api/integration'
import { ensureNewsArticleCount } from '../data/newsFallback'
import type { NewsArticle } from '../types/news'

export function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLatestNews()
      .then((r) => {
        const raw = (r.data?.articles as NewsArticle[]) ?? []
        setArticles(ensureNewsArticleCount(raw, 12))
      })
      .catch(() => setArticles(ensureNewsArticleCount([], 12)))
      .finally(() => setLoading(false))
  }, [])

  const featured = articles.length > 2 ? articles[2] : articles[0]

  return (
    <div className="container py-5" style={{ marginTop: 50 }}>
      <div className="border-start border-4 border-primary ps-3 mb-5">
        <h2 className="fw-bold text-uppercase m-0">Tin tức mới nhất</h2>
        <p className="text-muted mb-0">Cập nhật tin tức du lịch 2026</p>
      </div>

      {loading && (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 mb-0">Đang tải tin tức...</p>
        </div>
      )}

      {!loading && articles.length === 0 && (
        <div className="alert alert-light">Chưa có tin. Kiểm tra integration-service và NEWS_API_KEY.</div>
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
                <span className="badge bg-danger mb-3 w-fit-content">NỔI BẬT</span>
                <h1 className="card-title fw-bold">{featured.title}</h1>
                <p className="card-text fs-5 d-none d-md-block">{featured.description}</p>
                {featured.url && (
                  <a
                    href={featured.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary rounded-pill px-4 w-fit-content"
                  >
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
            <div key={`${a.title}-${i}`} className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden news-card">
                <div className="position-relative">
                  <img
                    src={a.urlToImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
                    className="card-img-top"
                    style={{ height: 200, objectFit: 'cover' }}
                    alt=""
                  />
                  <span className="position-absolute top-0 start-0 m-3 badge bg-warning text-dark">
                    {a.source?.name ?? 'Tin tức'}
                  </span>
                </div>
                <div className="card-body d-flex flex-column">
                  <small className="text-muted mb-2">
                    <i className="bi bi-calendar-event me-1" />
                    {a.publishedAt ? String(a.publishedAt).slice(0, 10) : '—'}
                  </small>
                  <h5 className="card-title fw-bold mb-3 line-clamp-2">{a.title}</h5>
                  <p className="card-text text-muted small line-clamp-3">{a.description}</p>
                  <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                    <span className="small fw-bold text-dark">{a.author ?? '—'}</span>
                    {a.url && (
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-decoration-none fw-bold small text-warning"
                      >
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
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .w-fit-content { width: fit-content; }
      `}</style>
    </div>
  )
}
