import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../api/client'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginSession } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const from = (location.state as { from?: string })?.from ?? '/'

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    try {
      const res = await login(String(fd.get('email')), String(fd.get('password')))
      const d = res.data
      loginSession(d.accessToken, d.refreshToken, d.user)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Tên đăng nhập hoặc mật khẩu không chính xác.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0A0A0B] text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-block mb-8">
            <span className="fs-2 fw-bold text-warning">ZakiBooking</span>
          </Link>
          <h2 className="display-6 fw-bold mb-3">
            Chào mừng <span style={{ color: '#FECF2F' }}>trở lại!</span>
          </h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={onSubmit} className="vstack gap-3" autoComplete="off">
            <div>
              <label className="form-label text-white-50">Email</label>
              <input name="email" type="email" className="form-control bg-dark text-white border-secondary" required />
            </div>
            <div>
              <label className="form-label text-white-50">Mật khẩu</label>
              <input name="password" type="password" className="form-control bg-dark text-white border-secondary" required />
            </div>
            <button type="submit" className="btn btn-warning fw-bold py-3" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
            <Link to="/" className="btn btn-outline-light">Tiếp tục với tư cách khách</Link>
          </form>
          <p className="mt-4 text-white-50">
            Chưa có tài khoản? <Link to="/register" className="text-warning fw-bold">Tham gia ngay</Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1723065219121-3bfaf2170563?auto=format&fit=crop&w=1080&q=80"
          alt=""
          className="w-100 h-100 object-fit-cover"
          style={{ minHeight: '100vh' }}
        />
      </div>
    </div>
  )
}
