import { BrowserRouter, Navigate, Route, Routes, useParams, useSearchParams } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ThemeProvider } from './theme/ThemeContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { ZakiLayout } from './components/ZakiLayout'
import { AdminLayout } from './components/admin/AdminLayout'
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage'
import { AdminContactDetailPage } from './pages/admin/AdminContactDetailPage'
import { AdminContactsPage } from './pages/admin/AdminContactsPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminPromoFormPage } from './pages/admin/AdminPromoFormPage'
import { AdminPromosPage } from './pages/admin/AdminPromosPage'
import { AdminRevenuePage } from './pages/admin/AdminRevenuePage'
import { AdminReviewsByTourPage } from './pages/admin/AdminReviewsByTourPage'
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage'
import { AdminTourCreatePage } from './pages/admin/AdminTourCreatePage'
import { AdminTourDetailPage } from './pages/admin/AdminTourDetailPage'
import { AdminTourEditPage } from './pages/admin/AdminTourEditPage'
import { AdminTourExtendPage } from './pages/admin/AdminTourExtendPage'
import { AdminTourPerformancePage } from './pages/admin/AdminTourPerformancePage'
import { AdminToursListPage } from './pages/admin/AdminToursListPage'
import { AdminUserDetailPage } from './pages/admin/AdminUserDetailPage'
import { AdminUserEditPage } from './pages/admin/AdminUserEditPage'
import { AdminUserFormPage } from './pages/admin/AdminUserFormPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { BookingNewPage } from './pages/BookingNewPage'
import { BookingsPage } from './pages/BookingsPage'
import { CheckInVerifyPage } from './pages/CheckInVerifyPage'
import { ContactPage } from './pages/ContactPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NewsPage } from './pages/NewsPage'
import { AboutPage } from './pages/AboutPage'
import { PromotionsPage } from './pages/PromotionsPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { PaymentResultPage } from './pages/PaymentResultPage'
import { TourDetailPage } from './pages/TourDetailPage'
import { ToursPage } from './pages/ToursPage'

function AdminTourDeparturesRedirect() {
  const { id } = useParams()
  const [search] = useSearchParams()
  const qs = new URLSearchParams(search)
  qs.set('tab', 'departures')
  return <Navigate to={`/admin/tour/detail/${id}?${qs.toString()}`} replace />
}

export default function App() {
  return (
    <ThemeProvider>
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
            <Route path="uu-dai" element={<PromotionsPage />} />
            <Route path="ve-chung-toi" element={<AboutPage />} />
            <Route path="payment/result" element={<PaymentResultPage />} />
            <Route path="check-in/:token" element={<CheckInVerifyPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="user/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
            <Route path="user/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="user/edit-profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="user/change-password" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="user/favorite" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
            <Route path="favorites/my-favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />

            {/* aliases monolith / compat */}
            <Route path="tours" element={<Navigate to="/tour" replace />} />
            <Route path="bookings" element={<Navigate to="/user/bookings" replace />} />
            <Route path="favorite" element={<Navigate to="/favorites/my-favorites" replace />} />
          </Route>

          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="revenue" element={<AdminRevenuePage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="tour-performance" element={<AdminTourPerformancePage />} />
            <Route path="user" element={<AdminUsersPage />} />
            <Route path="user/create" element={<AdminUserFormPage />} />
            <Route path="user/edit/:id" element={<AdminUserEditPage />} />
            <Route path="user/:id" element={<AdminUserDetailPage />} />
            <Route path="tour/active" element={<AdminToursListPage status="active" title="Danh sách chuyến đi đang hoạt động" />} />
            <Route path="tour/completed" element={<AdminToursListPage status="completed" title="Danh sách chuyến đi đã kết thúc" />} />
            <Route path="tour/create" element={<AdminTourCreatePage />} />
            <Route path="tour/detail/:id/ngay-khoi-hanh/edit/:scheduleId" element={<AdminTourDeparturesRedirect />} />
            <Route path="tour/detail/:id/ngay-khoi-hanh" element={<AdminTourDeparturesRedirect />} />
            <Route path="tour/detail/:id" element={<AdminTourDetailPage />} />
            <Route path="tour/edit/:id" element={<AdminTourEditPage />} />
            <Route path="tour/extend/:id" element={<AdminTourExtendPage />} />
            <Route path="promo" element={<AdminPromosPage />} />
            <Route path="promo/create" element={<AdminPromoFormPage />} />
            <Route path="promo/edit/:id" element={<AdminPromoFormPage />} />
            <Route path="contact" element={<AdminContactsPage />} />
            <Route path="contact/:id" element={<AdminContactDetailPage />} />
            <Route path="contact/detail/:id" element={<AdminContactDetailPage />} />
            <Route path="danh-gia" element={<AdminReviewsPage />} />
            <Route path="danh-gia/tour/:tourId" element={<AdminReviewsByTourPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  )
}
