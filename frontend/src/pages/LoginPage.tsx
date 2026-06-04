import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../api/client'
import { resolvePostLoginPath } from '../auth/redirectAfterAuth'
import { AuthLogo, AuthShell } from '../components/auth/AuthShell'
import { PasswordInput } from '../components/auth/PasswordInput'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99H7.9v-2.89h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.25c-1.23 0-1.61.77-1.61 1.56v1.87h2.74l-.44 2.89h-2.3v6.99C18.34 21.13 22 16.99 22 12z" />
    </svg>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginSession } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(() => localStorage.getItem('authRemember') === '1')
  const from = (location.state as { from?: string })?.from ?? '/'

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    try {
      const res = await login(String(fd.get('email')), String(fd.get('password')))
      const d = res.data
      if (remember) localStorage.setItem('authRemember', '1')
      else localStorage.removeItem('authRemember')
      loginSession(d.accessToken, d.refreshToken, d.user)
      navigate(resolvePostLoginPath(d.user, from), { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Tên đăng nhập hoặc mật khẩu không chính xác.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      layout="login"
      heroOverlay="card"
      heroTitle={
        <>
          Khám phá thế giới, <br />
          <span className="auth-brand-gradient">Kiến tạo hành trình.</span>
        </>
      }
      heroSubtitle="Trải nghiệm những dịch vụ du lịch hàng đầu với ZakiBooking."
      footer={
        <p className="auth-footer-text">
          Chưa có tài khoản? <Link to="/register">Tham gia ngay</Link>
        </p>
      }
    >
      <AuthLogo variant="login" />

      <header className="auth-header">
        <h1 className="auth-title font-heading">
          Chào mừng <span className="auth-brand-gradient">trở lại!</span>
        </h1>
      </header>

      {error && (
        <div className="auth-alert auth-alert-danger" role="alert">
          <i className="bi bi-exclamation-circle flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="auth-stack" autoComplete="off">
        <div className="auth-field">
          <label htmlFor="login-email">Tên đăng nhập / Email</label>
          <input
            id="login-email"
            name="email"
            type="text"
            className="auth-input"
            placeholder="admin hoặc admin@bookingtour.com"
            required
            autoComplete="username"
          />
        </div>

        <div className="auth-field">
          <div className="auth-row-link">
            <label htmlFor="login-password">Mật khẩu</label>
            <a href="#forgot" className="auth-forgot" onClick={(e) => e.preventDefault()} title="Sắp có">
              Quên mật khẩu?
            </a>
          </div>
          <PasswordInput
            id="login-password"
            name="password"
            className="auth-input"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            minLength={6}
          />
        </div>

        <div className="auth-check">
          <input
            id="remember-me"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <label htmlFor="remember-me">Duy trì đăng nhập</label>
        </div>

        <div className="auth-actions">
          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
          <Link to="/" className="auth-btn-ghost">
            Tiếp tục với tư cách khách
          </Link>
        </div>
      </form>

      <div className="auth-below-form">
        <div className="auth-divider auth-divider--lowercase">
          <span>hoặc đăng nhập bằng</span>
        </div>
        <div className="auth-social-grid">
          <a href="/api/oauth2/authorization/google" className="auth-social-btn" title="Đăng nhập Google">
            <GoogleIcon />
            <span>Google</span>
          </a>
          <span className="auth-social-btn" style={{ opacity: 0.45, cursor: 'not-allowed' }} title="Sắp có">
            <FacebookIcon />
            <span>Facebook</span>
          </span>
        </div>
      </div>
    </AuthShell>
  )
}
