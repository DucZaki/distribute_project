import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AUTH_HERO_IMAGE } from './authHero'

type AuthShellProps = {
  layout: 'login' | 'register'
  children: ReactNode
  footer?: ReactNode
  heroTitle?: ReactNode
  heroSubtitle?: string
  /** login: thẻ glass; register: chữ trên nền mờ đồng bộ vị trí */
  heroOverlay?: 'card' | 'caption'
}

export function AuthShell({
  layout,
  children,
  footer,
  heroTitle,
  heroSubtitle,
  heroOverlay = 'card',
}: AuthShellProps) {
  useEffect(() => {
    document.body.classList.add('auth-route')
    const prevTheme = document.documentElement.getAttribute('data-theme')
    document.documentElement.setAttribute('data-theme', 'dark')
    return () => {
      document.body.classList.remove('auth-route')
      if (prevTheme) document.documentElement.setAttribute('data-theme', prevTheme)
    }
  }, [])

  return (
    <div className={`auth-page auth-page--${layout}`}>
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          {children}
          {footer}
        </div>
      </div>

      <div className="auth-hero-panel">
        <div className="auth-hero-overlay" aria-hidden />
        <img src={AUTH_HERO_IMAGE} alt="" className="auth-hero-img" />
        {heroTitle &&
          (heroOverlay === 'card' ? (
            <div className="auth-hero-card font-heading">
              <h3>{heroTitle}</h3>
              {heroSubtitle && <p>{heroSubtitle}</p>}
            </div>
          ) : (
            <div className="auth-hero-caption font-heading">
              <h3>{heroTitle}</h3>
              {heroSubtitle && <p>{heroSubtitle}</p>}
            </div>
          ))}
      </div>
    </div>
  )
}

export function AuthLogo({ variant }: { variant: 'login' | 'register' }) {
  if (variant === 'register') {
    return (
      <div className="auth-logo-block auth-logo-block--register">
        <Link to="/">
          <img src="/favicon.icon" alt="Logo" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        </Link>
      </div>
    )
  }
  return (
    <div className="auth-logo-block">
      <Link to="/" className="auth-logo-link">
        <img src="/favicon.icon" alt="Logo" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
      </Link>
    </div>
  )
}
