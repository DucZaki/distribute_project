import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getUserStatsBatch, listAdminUsers, type AdminUser, type UserBookingStats } from '../../api/adminUsers'
import { AdminPagination } from '../../components/admin/AdminPagination'
import { formatVnd } from '../../utils/format'

type SortKey = 'spending_desc' | 'spending_asc' | 'bookings_desc' | 'name_asc'

function userInitial(name?: string) {
  const n = (name ?? 'U').trim()
  return n.charAt(0).toUpperCase()
}

function formatJoinDate(iso?: string) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('vi-VN')
  } catch {
    return iso
  }
}

export function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [statsMap, setStatsMap] = useState<Record<number, UserBookingStats>>({})
  const [page, setPage] = useState(Number(searchParams.get('page') ?? 0))
  const [totalPages, setTotalPages] = useState(0)
  const [keyword, setKeyword] = useState(searchParams.get('q') ?? '')
  const [sort, setSort] = useState<SortKey>((searchParams.get('sort') as SortKey) ?? 'spending_desc')
  const [loading, setLoading] = useState(false)

  function load(p = page, q = keyword) {
    setLoading(true)
    listAdminUsers(p, 10, q)
      .then(async (r) => {
        const list = r.data.content ?? []
        setUsers(list)
        setTotalPages(r.data.totalPages ?? 0)
        setPage(r.data.page ?? p)
        const ids = list.map((u) => u.id)
        const statsRes = await getUserStatsBatch(ids).catch(() => ({ data: {} as Record<number, UserBookingStats> }))
        setStatsMap(statsRes.data ?? {})
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load(page, keyword)
  }, [])

  const sorted = useMemo(() => {
    const rows = users.map((u) => ({
      user: u,
      stat: statsMap[u.id] ?? { paidBookings: 0, totalSpending: 0 },
    }))
    rows.sort((a, b) => {
      switch (sort) {
        case 'spending_asc':
          return a.stat.totalSpending - b.stat.totalSpending
        case 'bookings_desc':
          return b.stat.paidBookings - a.stat.paidBookings
        case 'name_asc':
          return (a.user.hoTen ?? a.user.tenDangNhap ?? '').localeCompare(
            b.user.hoTen ?? b.user.tenDangNhap ?? '',
            'vi',
          )
        default:
          return b.stat.totalSpending - a.stat.totalSpending
      }
    })
    return rows
  }, [users, statsMap, sort])

  function onSearch(e: FormEvent) {
    e.preventDefault()
    setSearchParams({ q: keyword, sort, page: '0' })
    load(0, keyword)
  }

  function onSortChange(next: SortKey) {
    setSort(next)
    setSearchParams({ q: keyword, sort: next, page: String(page) })
  }

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h2 className="fw-bold mb-0">Quản lý người dùng</h2>
        <form onSubmit={onSearch} className="d-flex flex-wrap align-items-center gap-2">
          <div className="input-group" style={{ minWidth: 280 }}>
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Tìm theo tên, email, username, ID..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <select
            className="form-select form-select-sm"
            style={{ width: 220 }}
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
          >
            <option value="spending_desc">Chi tiêu cao → thấp</option>
            <option value="spending_asc">Chi tiêu thấp → cao</option>
            <option value="bookings_desc">Nhiều booking nhất</option>
            <option value="name_asc">Tên A → Z</option>
          </select>
          <button type="submit" className="btn btn-primary btn-sm px-3">
            <i className="bi bi-search me-1" /> Tìm kiếm
          </button>
          {keyword.trim() && (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setKeyword('')
                setSearchParams({ sort, page: '0' })
                load(0, '')
              }}
            >
              Xóa lọc
            </button>
          )}
        </form>
      </div>

      {keyword.trim() && (
        <div className="alert alert-light border small py-2 mb-3">
          Kết quả cho: <strong>“{keyword}”</strong> — sắp xếp theo chi tiêu / tiêu chí đã chọn
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">Người dùng</th>
                  <th className="py-3">Liên hệ</th>
                  <th className="py-3 text-center">Vai trò</th>
                  <th className="py-3 text-center">Booking PAID</th>
                  <th className="py-3 text-end">Tổng chi tiêu</th>
                  <th className="py-3">Ngày tham gia</th>
                  <th className="py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">Đang tải...</td>
                  </tr>
                )}
                {!loading &&
                  sorted.map(({ user: u, stat }) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold"
                            style={{ width: 40, height: 40 }}
                          >
                            {userInitial(u.hoTen ?? u.tenDangNhap)}
                          </div>
                          <div>
                            <div className="fw-bold">{u.hoTen || u.tenDangNhap}</div>
                            <div className="text-muted small">ID: #{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="small fw-semibold">{u.email}</div>
                        <div className="text-muted small">{u.number || '—'}</div>
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`badge rounded-pill px-3 py-1 ${u.vaiTro === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}
                        >
                          {u.vaiTro}
                        </span>
                      </td>
                      <td className="py-3 text-center fw-bold">{stat.paidBookings}</td>
                      <td className="py-3 text-end fw-bold text-success">{formatVnd(stat.totalSpending)}</td>
                      <td className="py-3 text-muted small">{formatJoinDate(u.ngayTao)}</td>
                      <td className="py-3 text-center">
                        <Link to={`/admin/user/${u.id}`} className="btn btn-sm btn-outline-dark rounded-pill">
                          Hồ sơ
                        </Link>
                      </td>
                    </tr>
                  ))}
                {!loading && sorted.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      Không tìm thấy người dùng phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AdminPagination
        page={page}
        totalPages={totalPages}
        onPage={(p) => {
          setSearchParams({ q: keyword, sort, page: String(p) })
          load(p, keyword)
        }}
      />
    </div>
  )
}
