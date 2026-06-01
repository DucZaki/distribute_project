import { Navigate } from 'react-router-dom'

/** @deprecated Use /admin routes with AdminLayout */
export function AdminPage() {
  return <Navigate to="/admin" replace />
}
