import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { UserSummary } from '../types/api'

interface AuthState {
  user: UserSummary | null
  isAuthenticated: boolean
  isAdmin: boolean
  loginSession: (accessToken: string, refreshToken: string, user: UserSummary) => void
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

function loadUser(): UserSummary | null {
  const raw = localStorage.getItem('authUser')
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserSummary
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(loadUser)

  const loginSession = useCallback(
    (accessToken: string, refreshToken: string, u: UserSummary) => {
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('authUser', JSON.stringify(u))
      setUser(u)
    },
    [],
  )

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('authUser')
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user && !!localStorage.getItem('accessToken'),
      isAdmin: user?.vaiTro === 'ADMIN' || user?.vaiTro === 'ROLE_ADMIN',
      loginSession,
      logout,
    }),
    [user, loginSession, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
