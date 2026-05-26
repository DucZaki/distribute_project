import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { ZakiLayout } from './components/ZakiLayout'
import { AdminPage } from './pages/AdminPage'
import { BookingNewPage } from './pages/BookingNewPage'
import { BookingsPage } from './pages/BookingsPage'
import { ContactPage } from './pages/ContactPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NewsPage } from './pages/NewsPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { TourDetailPage } from './pages/TourDetailPage'
import { ToursPage } from './pages/ToursPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ZakiLayout />}>
            <Route index element={<HomePage />} />
            <Route path="tour" element={<ToursPage />} />
            <Route path="tour/:id" element={<TourDetailPage />} />
            <Route path="tour/:id/dat-tour" element={<ProtectedRoute><BookingNewPage /></ProtectedRoute>} />
            <Route path="tin-tuc" element={<NewsPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />

            <Route path="user/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
            <Route path="user/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="favorites/my-favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />

            {/* aliases monolith / compat */}
            <Route path="tours" element={<Navigate to="/tour" replace />} />
            <Route path="bookings" element={<Navigate to="/user/bookings" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
