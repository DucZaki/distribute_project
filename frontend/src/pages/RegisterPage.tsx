import { type FormEvent, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../api/client'
import { resolvePostLoginPath } from '../auth/redirectAfterAuth'
import { AuthLogo, AuthShell } from '../components/auth/AuthShell'
import { PasswordInput } from '../components/auth/PasswordInput'

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
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    if (!fd.get('terms')) {
      setError('Vui lòng đồng ý điều khoản dịch vụ.')
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
      navigate(resolvePostLoginPath(d.user), { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể đăng ký. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      layout="register"
      heroOverlay="caption"
      heroTitle="Khám phá những điểm đến tuyệt vời"
      heroSubtitle="Hàng nghìn tour du lịch đang chờ bạn khám phá"
      footer={
        <p className="auth-footer-text">
          Đã là thành viên? <Link to="/login">Đăng nhập ngay</Link>
        </p>
      }
    >
      <AuthLogo variant="register" />

      <header className="auth-header">
        <h1 className="auth-title font-heading">Tạo tài khoản mới</h1>
        <p className="auth-subtitle">Đăng ký để bắt đầu hành trình khám phá cùng ZakiBooking</p>
      </header>

      {error && (
        <div className="auth-alert auth-alert-danger" role="alert">
          <i className="bi bi-exclamation-circle flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="auth-stack auth-stack--register" autoComplete="off">
        <div className="auth-field-row">
          <div className="auth-field">
            <label htmlFor="reg-username" className="auth-label-upper">
              Tên đăng nhập
            </label>
            <input
              id="reg-username"
              name="tenDangNhap"
              className="auth-input"
              placeholder="username"
              required
              minLength={3}
              autoComplete="username"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="reg-name" className="auth-label-upper">
              Họ và tên
            </label>
            <input
              id="reg-name"
              name="hoTen"
              className="auth-input"
              placeholder="Nguyễn Văn A"
              required
              autoComplete="name"
            />
          </div>
        </div>

        <div className="auth-field-row">
          <div className="auth-field">
            <label htmlFor="reg-phone" className="auth-label-upper">
              Số điện thoại
            </label>
            <input
              id="reg-phone"
              name="number"
              type="tel"
              className="auth-input"
              placeholder="0901234567"
              autoComplete="tel"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="reg-email" className="auth-label-upper">
              Email
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className="auth-input"
              placeholder="yourname@gmail.com"
              defaultValue={prefEmail}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="reg-password" className="auth-label-upper">
            Mật khẩu
          </label>
          <PasswordInput
            id="reg-password"
            name="password"
            className="auth-input"
            placeholder="••••••••"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        <div className="auth-field">
          <label htmlFor="reg-confirm" className="auth-label-upper">
            Xác nhận mật khẩu
          </label>
          <PasswordInput
            id="reg-confirm"
            name="confirmPassword"
            className="auth-input"
            placeholder="••••••••"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        <div className="auth-check">
          <input id="terms" name="terms" type="checkbox" value="1" required />
          <label htmlFor="terms">
            Tôi đồng ý với <Link to="/contact">Điều khoản dịch vụ</Link> và{' '}
            <Link to="/contact">Chính sách bảo mật</Link>
          </label>
        </div>

        <div className="auth-actions">
          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Bắt đầu hành trình ngay'}
          </button>
        </div>
      </form>
    </AuthShell>
  )
}
