import { useEffect, useState } from 'react'
import { fetchNews } from '../api/integration'

export function NewsPage() {
  const [articles, setArticles] = useState<Record<string, string>[]>([])

  useEffect(() => {
    fetchNews()
      .then((r) => setArticles((r.data?.articles as Record<string, string>[]) ?? []))
      .catch(() => setArticles([]))
  }, [])

  return (
    <div className="container py-5">
      <h1 className="fw-bold mb-2">Tin tức du lịch</h1>
      <p className="text-muted mb-4">Cập nhật xu hướng và cảm hứng cho chuyến đi tiếp theo</p>
      {articles.length === 0 && (
        <div className="alert alert-light">Chưa có tin (cấu hình NEWS_API_KEY cho integration-service).</div>
      )}
      <div className="row g-4">
        {articles.map((a, i) => (
          <div key={i} className="col-md-4">
            <div className="card h-100 border-0 shadow-sm">
              <img src={a.urlToImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'} alt="" className="card-img-top" style={{ height: 180, objectFit: 'cover' }} />
              <div className="card-body">
                <h6 className="fw-bold">{a.title}</h6>
                <p className="small text-muted">{(a.description ?? '').slice(0, 120)}...</p>
                {a.url && (
                  <a href={a.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">Đọc thêm</a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
