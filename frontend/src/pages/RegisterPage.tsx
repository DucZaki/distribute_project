import { type FormEvent, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../api/client'

export function RegisterPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { loginSession } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const prefEmail = params.get('email') ?? ''

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    if (fd.get('password') !== fd.get('confirmPassword')) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    setLoading(true)
    try {
      const res = await register({
        email: String(fd.get('email')),
        password: String(fd.get('password')),
        tenDangNhap: String(fd.get('tenDangNhap')),
        hoTen: String(fd.get('hoTen')),
        number: String(fd.get('number') ?? ''),
      })
      const d = res.data
      loginSession(d.accessToken, d.refreshToken, d.user)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể đăng ký')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-black text-white p-4">
      <div className="w-100 max-w-md mx-auto py-5">
        <Link to="/" className="d-block mb-4 fs-4 fw-bold text-warning">ZakiBooking</Link>
        <h2 className="fw-bold mb-2">Tạo tài khoản mới</h2>
        <p className="text-secondary mb-4">Đăng ký để bắt đầu hành trình khám phá</p>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={onSubmit} className="vstack gap-3">
          <input name="tenDangNhap" className="form-control bg-dark text-white border-secondary" placeholder="Tên đăng nhập" required />
          <input name="hoTen" className="form-control bg-dark text-white border-secondary" placeholder="Họ và tên" required />
          <input name="number" className="form-control bg-dark text-white border-secondary" placeholder="Số điện thoại" />
          <input name="email" type="email" className="form-control bg-dark text-white border-secondary" placeholder="Email" defaultValue={prefEmail} required />
          <input name="password" type="password" className="form-control bg-dark text-white border-secondary" placeholder="Mật khẩu" minLength={6} required />
          <input name="confirmPassword" type="password" className="form-control bg-dark text-white border-secondary" placeholder="Xác nhận mật khẩu" required />
          <button type="submit" className="btn btn-warning fw-bold py-3" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>
        <p className="mt-4 text-secondary">Đã có tài khoản? <Link to="/login" className="text-warning">Đăng nhập</Link></p>
      </div>
    </div>
  )
}
