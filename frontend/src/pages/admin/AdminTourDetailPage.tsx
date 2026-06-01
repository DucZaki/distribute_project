import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  createTourSchedule,
  deleteAdminTour,
  deleteTourSchedule,
  getAdminTour,
  listTourSchedules,
  toggleTourSchedule,
  updateAdminTour,
  type NgayKhoiHanhDto,
} from '../../api/adminTours'
import type { TourDetail } from '../../types/api'
import { formatVnd } from '../../utils/format'

export function AdminTourDetailPage() {
  const { id } = useParams()
  const tourId = Number(id)
  const [search] = useSearchParams()
  const source = search.get('source') || 'active'
  const [tour, setTour] = useState<TourDetail | null>(null)
  const [schedules, setSchedules] = useState<NgayKhoiHanhDto[]>([])
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState<'info' | 'schedule' | 'itinerary'>('info')
  const [scheduleForm, setScheduleForm] = useState({ ngayKhoiHanh: '', ngayKetThuc: '', soChoToiDa: '30', giaOverride: '' })
  const [itineraryForm, setItineraryForm] = useState({ ngayThu: '1', tieuDe: '', hoatDongChinh: '', moTa: '' })

  function reload() {
    getAdminTour(tourId).then((r) => setTour(r.data)).catch(() => setTour(null))
    listTourSchedules(tourId).then((r) => setSchedules(r.data ?? [])).catch(() => setSchedules([]))
  }

  useEffect(() => { if (tourId) reload() }, [tourId])

  async function onSaveInfo(e: FormEvent) {
    e.preventDefault()
    if (!tour) return
    try {
      await updateAdminTour(tourId, {
        tieuDe: tour.tieuDe,
        moTa: tour.moTa,
        gia: tour.gia,
        hinhAnh: tour.hinhAnh,
        highlight: tour.highlight,
        noiBat: tour.noiBat,
        ngayKhoiHanh: tour.ngayKhoiHanh,
        ngayKetThuc: tour.ngayKetThuc,
      })
      setMsg('Đã lưu thông tin tour')
      reload()
    } catch (err: any) {
      setMsg(err.message ?? 'Lỗi')
    }
  }

  async function onAddSchedule(e: FormEvent) {
    e.preventDefault()
    try {
      await createTourSchedule(tourId, {
        ngayKhoiHanh: scheduleForm.ngayKhoiHanh,
        ngayKetThuc: scheduleForm.ngayKetThuc || scheduleForm.ngayKhoiHanh,
        soChoToiDa: Number(scheduleForm.soChoToiDa),
        giaOverride: scheduleForm.giaOverride ? Number(scheduleForm.giaOverride) : undefined,
      })
      setMsg('Đã thêm lịch khởi hành')
      reload()
    } catch (err: any) {
      setMsg(err.message ?? 'Lỗi')
    }
  }

  async function onDeleteTour() {
    if (!confirm('Xóa tour này?')) return
    await deleteAdminTour(tourId)
    window.location.href = `/admin/tour/${source}`
  }

  async function onToggleSchedule(scheduleId?: number) {
    if (!scheduleId) return
    await toggleTourSchedule(tourId, scheduleId)
    setMsg('Đã đổi trạng thái lịch khởi hành')
    reload()
  }

  async function saveItineraries(next = tour?.lichTrinhs ?? []) {
    if (!tour) return
    await updateAdminTour(tourId, {
      tieuDe: tour.tieuDe,
      moTa: tour.moTa,
      gia: tour.gia,
      hinhAnh: tour.hinhAnh,
      highlight: tour.highlight,
      noiBat: tour.noiBat,
      ngayKhoiHanh: tour.ngayKhoiHanh,
      ngayKetThuc: tour.ngayKetThuc,
      lichTrinhs: next,
    })
    setMsg('Đã lưu lịch trình')
    reload()
  }

  async function onAddItinerary(e: FormEvent) {
    e.preventDefault()
    const next = [
      ...(tour?.lichTrinhs ?? []),
      {
        ngayThu: Number(itineraryForm.ngayThu),
        tieuDe: itineraryForm.tieuDe,
        hoatDongChinh: itineraryForm.hoatDongChinh,
        moTa: itineraryForm.moTa,
      },
    ].sort((a, b) => Number(a.ngayThu) - Number(b.ngayThu))
    await saveItineraries(next)
    setItineraryForm({ ngayThu: String(next.length + 1), tieuDe: '', hoatDongChinh: '', moTa: '' })
  }

  async function onDeleteItinerary(index: number) {
    if (!confirm('Xóa ngày lịch trình này?')) return
    const next = [...(tour?.lichTrinhs ?? [])]
    next.splice(index, 1)
    await saveItineraries(next)
  }

  async function onDeleteSchedule(scheduleId?: number) {
    if (!scheduleId || !confirm('Xóa lịch khởi hành này?')) return
    await deleteTourSchedule(tourId, scheduleId)
    setMsg('Đã xóa lịch khởi hành')
    reload()
  }

  if (!tour) return <div className="text-muted py-5">Đang tải...</div>

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">{tour.tieuDe}</h2>
        <div className="d-flex gap-2">
          <Link to={`/admin/tour/${source}`} className="btn btn-outline-secondary btn-sm">Quay lại</Link>
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={onDeleteTour}>Xóa tour</button>
        </div>
      </div>
      {msg && <div className="alert alert-success py-2">{msg}</div>}

      <ul className="nav nav-tabs mb-4">
        {(['info', 'schedule', 'itinerary'] as const).map((t) => (
          <li className="nav-item" key={t}>
            <button type="button" className={`nav-link ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'info' ? 'Thông tin' : t === 'schedule' ? 'Ngày khởi hành' : 'Lịch trình'}
            </button>
          </li>
        ))}
      </ul>

      {tab === 'info' && (
        <form className="card border-0 shadow-sm rounded-4 p-4" onSubmit={onSaveInfo}>
          <div className="row g-3">
            <div className="col-md-8">
              <label className="form-label">Tiêu đề</label>
              <input className="form-control" value={tour.tieuDe ?? ''} onChange={(e) => setTour({ ...tour, tieuDe: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Giá</label>
              <input className="form-control" type="number" value={tour.gia ?? ''} onChange={(e) => setTour({ ...tour, gia: Number(e.target.value) })} />
              <div className="small text-muted mt-1">{formatVnd(Number(tour.gia ?? 0))}</div>
            </div>
            <div className="col-12">
              <label className="form-label">Mô tả</label>
              <textarea className="form-control" rows={5} value={tour.moTa ?? ''} onChange={(e) => setTour({ ...tour, moTa: e.target.value })} />
            </div>
            <div className="col-12">
              <label className="form-label">Ảnh URL</label>
              <input className="form-control" value={tour.hinhAnh ?? ''} onChange={(e) => setTour({ ...tour, hinhAnh: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Highlight</label>
              <input className="form-control" value={tour.highlight ?? ''} onChange={(e) => setTour({ ...tour, highlight: e.target.value })} />
            </div>
            <div className="col-md-6 d-flex align-items-end">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" checked={!!tour.noiBat} onChange={(e) => setTour({ ...tour, noiBat: e.target.checked })} />
                <label className="form-check-label">Nổi bật</label>
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary mt-3">Lưu thông tin</button>
        </form>
      )}

      {tab === 'schedule' && (
        <div className="row g-4">
          <div className="col-lg-5">
            <form className="card border-0 shadow-sm rounded-4 p-4" onSubmit={onAddSchedule}>
              <h5 className="fw-bold mb-3">Thêm ngày khởi hành</h5>
              <div className="mb-2">
                <label className="form-label">Ngày đi</label>
                <input type="date" className="form-control" required value={scheduleForm.ngayKhoiHanh} onChange={(e) => setScheduleForm({ ...scheduleForm, ngayKhoiHanh: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="form-label">Ngày về</label>
                <input type="date" className="form-control" value={scheduleForm.ngayKetThuc} onChange={(e) => setScheduleForm({ ...scheduleForm, ngayKetThuc: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="form-label">Số chỗ</label>
                <input type="number" className="form-control" value={scheduleForm.soChoToiDa} onChange={(e) => setScheduleForm({ ...scheduleForm, soChoToiDa: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label">Giá override</label>
                <input type="number" className="form-control" value={scheduleForm.giaOverride} onChange={(e) => setScheduleForm({ ...scheduleForm, giaOverride: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">Thêm</button>
            </form>
          </div>
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="table-responsive">
                <table className="table mb-0">
                  <thead className="bg-light"><tr><th>Ngày đi</th><th>Ngày về</th><th>Chỗ</th><th>Đã đặt</th><th>Giá</th><th>Trạng thái</th><th></th></tr></thead>
                  <tbody>
                    {schedules.map((s) => (
                      <tr key={s.id}>
                        <td>{s.ngayKhoiHanh}</td>
                        <td>{s.ngayKetThuc}</td>
                        <td>{s.soChoToiDa}</td>
                        <td>{s.soChoDaDat ?? 0}</td>
                        <td>{s.giaOverride != null ? formatVnd(Number(s.giaOverride)) : '-'}</td>
                        <td><span className={`badge ${s.trangThai === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>{s.trangThai ?? 'ACTIVE'}</span></td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button type="button" className="btn btn-outline-secondary" onClick={() => onToggleSchedule(s.id)}>
                              {s.trangThai === 'ACTIVE' ? 'Ẩn' : 'Mở'}
                            </button>
                            <button type="button" className="btn btn-outline-danger" onClick={() => onDeleteSchedule(s.id)}>Xóa</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {schedules.length === 0 && <tr><td colSpan={7} className="text-center py-4 text-muted">Chưa có lịch.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'itinerary' && (
        <div className="row g-4">
          <div className="col-lg-5">
            <form className="card border-0 shadow-sm rounded-4 p-4" onSubmit={onAddItinerary}>
              <h5 className="fw-bold mb-3">Thêm ngày lịch trình</h5>
              <div className="mb-2">
                <label className="form-label">Ngày thứ</label>
                <input type="number" min={1} className="form-control" value={itineraryForm.ngayThu} onChange={(e) => setItineraryForm({ ...itineraryForm, ngayThu: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="form-label">Tiêu đề</label>
                <input className="form-control" required value={itineraryForm.tieuDe} onChange={(e) => setItineraryForm({ ...itineraryForm, tieuDe: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="form-label">Hoạt động chính</label>
                <input className="form-control" value={itineraryForm.hoatDongChinh} onChange={(e) => setItineraryForm({ ...itineraryForm, hoatDongChinh: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label">Nội dung</label>
                <textarea className="form-control" rows={5} value={itineraryForm.moTa} onChange={(e) => setItineraryForm({ ...itineraryForm, moTa: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">Thêm lịch trình</button>
            </form>
          </div>
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-4">
              {(tour.lichTrinhs ?? []).length === 0 && <p className="text-muted">Chưa có lịch trình.</p>}
              {(tour.lichTrinhs ?? []).map((lt, idx) => (
                <div key={lt.id ?? `${lt.ngayThu}-${idx}`} className="border-bottom py-3">
                  <div className="d-flex justify-content-between gap-2">
                    <div className="fw-bold">Ngày {lt.ngayThu}: {lt.tieuDe}</div>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onDeleteItinerary(idx)}>Xóa</button>
                  </div>
                  <div className="text-muted small">{lt.moTa ?? lt.noiDungLines?.join(' ') ?? ''}</div>
                  {lt.hoatDongChinh && <div className="small mt-1"><strong>Hoạt động:</strong> {lt.hoatDongChinh}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
