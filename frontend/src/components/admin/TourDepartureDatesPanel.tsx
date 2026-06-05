import { type FormEvent, Fragment, useEffect, useState } from 'react'
import {
  createTourSchedule,
  deleteTourSchedule,
  listTourSchedules,
  updateTourSchedule,
  type NgayKhoiHanhDto,
} from '../../api/adminTours'
import { formatTourDate } from '../../utils/tourAdminHelpers'
import { formatVnd } from '../../utils/format'

type DateRow = { ngayDi: string; ngayVe: string }

type Props = {
  tourId: number
  isFlightTour?: boolean
}

const NA = 'N/A'

export function TourDepartureDatesPanel({ tourId, isFlightTour }: Props) {
  const [schedules, setSchedules] = useState<NgayKhoiHanhDto[]>([])
  const [rows, setRows] = useState<DateRow[]>([{ ngayDi: '', ngayVe: '' }])
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [expandedBookingsId, setExpandedBookingsId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ ngayDi: '', ngayVe: '', soCho: '30', giaOverride: '' })

  function reload() {
    listTourSchedules(tourId)
      .then((r) => setSchedules(r.data ?? []))
      .catch(() => setSchedules([]))
  }

  useEffect(() => {
    if (tourId) reload()
  }, [tourId])

  async function onAddAll(e: FormEvent) {
    e.preventDefault()
    setErr('')
    setMsg('')
    try {
      let added = 0
      for (const row of rows) {
        if (!row.ngayDi || !row.ngayVe) continue
        await createTourSchedule(tourId, {
          ngayKhoiHanh: row.ngayDi,
          ngayKetThuc: row.ngayVe,
          soChoToiDa: 30,
        })
        added++
      }
      if (added === 0) {
        setErr('Vui lòng nhập ít nhất một cặp ngày đi / ngày về.')
        return
      }
      setMsg(`Đã thêm ${added} ngày khởi hành.`)
      setRows([{ ngayDi: '', ngayVe: '' }])
      reload()
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : 'Lỗi thêm lịch')
    }
  }

  function startEdit(s: NgayKhoiHanhDto) {
    if (!s.id) return
    setEditingId(s.id)
    setExpandedBookingsId(null)
    setEditForm({
      ngayDi: s.ngayKhoiHanh?.slice(0, 10) ?? '',
      ngayVe: s.ngayKetThuc?.slice(0, 10) ?? '',
      soCho: String(s.soChoToiDa ?? 30),
      giaOverride: s.giaOverride != null ? String(s.giaOverride) : '',
    })
  }

  async function onSaveEdit(e: FormEvent) {
    e.preventDefault()
    if (!editingId) return
    try {
      await updateTourSchedule(tourId, editingId, {
        ngayKhoiHanh: editForm.ngayDi,
        ngayKetThuc: editForm.ngayVe,
        soChoToiDa: Number(editForm.soCho),
        giaOverride: editForm.giaOverride.trim() ? Number(editForm.giaOverride) : undefined,
      })
      setMsg('Đã cập nhật ngày khởi hành.')
      setEditingId(null)
      reload()
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : 'Không thể cập nhật')
    }
  }

  function totalPrice(s: NgayKhoiHanhDto) {
    if (s.giaOverride != null) return formatVnd(Number(s.giaOverride))
    return NA
  }

  return (
    <div>
      {msg && <div className="alert alert-success py-2 small">{msg}</div>}
      {err && <div className="alert alert-danger py-2 small">{err}</div>}

      <div className="card mb-4 shadow-sm border-0">
        <div className="card-body">
          <h6 className="fw-bold mb-3">
            <i className="bi bi-plus-circle me-2" />
            Thêm ngày khởi hành
          </h6>
          <form onSubmit={onAddAll}>
            {rows.map((row, idx) => (
              <div className="row g-3 align-items-end mb-3 date-row" key={idx}>
                <div className="col-md-5">
                  <label className="form-label small fw-bold">
                    Ngày đi <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    required={idx === 0}
                    value={row.ngayDi}
                    onChange={(e) => {
                      const next = [...rows]
                      next[idx] = { ...next[idx], ngayDi: e.target.value }
                      setRows(next)
                    }}
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label small fw-bold">
                    Ngày về <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    required={idx === 0}
                    value={row.ngayVe}
                    onChange={(e) => {
                      const next = [...rows]
                      next[idx] = { ...next[idx], ngayVe: e.target.value }
                      setRows(next)
                    }}
                  />
                </div>
                <div className="col-md-2">
                  {rows.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm remove-row-btn"
                      title="Xóa dòng"
                      onClick={() => setRows(rows.filter((_, i) => i !== idx))}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className="mt-3">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm me-2"
                onClick={() => setRows([...rows, { ngayDi: '', ngayVe: '' }])}
              >
                <i className="bi bi-calendar-plus" /> Thêm ngày khác
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                <i className="bi bi-check-lg" /> Xác nhận thêm tất cả
              </button>
            </div>
          </form>
          <small className="text-muted mt-3 d-block">
            <i className="bi bi-info-circle me-1" />
            {isFlightTour
              ? 'Đối với tour Máy bay: hệ thống tự fetch giá Amadeus. Đối với tour Bus: giá mặc định 300,000đ.'
              : 'Đối với tour Máy bay: hệ thống tự fetch giá Amadeus. Đối với tour Bus: giá mặc định 300,000đ.'}
          </small>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          {schedules.length === 0 ? (
            <div className="text-center text-muted py-4">
              <i className="bi bi-calendar-x fs-1" />
              <p className="mt-2 mb-0">Chưa có ngày khởi hành nào. Hãy thêm ở trên.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Ngày đi</th>
                    <th>Ngày về</th>
                    <th>Mã CB đi</th>
                    <th>Giờ bay đi</th>
                    <th>Giá đi</th>
                    <th>Mã CB về</th>
                    <th>Giờ bay về</th>
                    <th>Giá về</th>
                    <th>Tổng</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s, statIdx) => (
                    <Fragment key={s.id}>
                      <tr>
                        <td>{statIdx + 1}</td>
                        <td>{formatTourDate(s.ngayKhoiHanh)}</td>
                        <td>{s.ngayKetThuc ? formatTourDate(s.ngayKetThuc) : NA}</td>
                        <td>{NA}</td>
                        <td>{NA}</td>
                        <td className="text-danger fw-bold">{NA}</td>
                        <td>{NA}</td>
                        <td>{NA}</td>
                        <td className="text-danger fw-bold">{NA}</td>
                        <td className="fw-bold text-primary">{totalPrice(s)}</td>
                        <td className="text-nowrap">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-info me-1"
                            title="Xem danh sách đặt chỗ"
                            onClick={() =>
                              setExpandedBookingsId(expandedBookingsId === s.id ? null : (s.id ?? null))
                            }
                          >
                            <i className="bi bi-people" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => startEdit(s)}
                          >
                            <i className="bi bi-pencil" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={async () => {
                              if (!s.id || !confirm('Xoá ngày khởi hành này?')) return
                              await deleteTourSchedule(tourId, s.id)
                              if (editingId === s.id) setEditingId(null)
                              reload()
                            }}
                          >
                            <i className="bi bi-trash" />
                          </button>
                        </td>
                      </tr>
                      {expandedBookingsId === s.id && (
                        <tr>
                          <td colSpan={11} className="bg-light p-3">
                            <div className="card border-0 shadow-sm">
                              <div className="card-body">
                                <h6 className="fw-bold mb-3 text-secondary">
                                  <i className="bi bi-people-fill me-2" />
                                  Khách hàng đặt ngày {formatTourDate(s.ngayKhoiHanh)}
                                </h6>
                                <div className="text-muted text-center py-2">
                                  <i className="bi bi-info-circle me-1" />
                                  chưa có khách hàng
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      {editingId === s.id && (
                        <tr>
                          <td colSpan={11} className="bg-light p-3">
                            <div className="card border-0 shadow-sm">
                              <div className="card-body">
                                <h6 className="fw-bold mb-3">Sửa ngày khởi hành</h6>
                                <form onSubmit={onSaveEdit}>
                                  <div className="row g-3">
                                    <div className="col-md-3">
                                      <label className="form-label small fw-bold">Ngày đi</label>
                                      <input
                                        type="date"
                                        className="form-control form-control-sm"
                                        required
                                        value={editForm.ngayDi}
                                        onChange={(e) => setEditForm({ ...editForm, ngayDi: e.target.value })}
                                      />
                                    </div>
                                    <div className="col-md-3">
                                      <label className="form-label small fw-bold">Ngày về</label>
                                      <input
                                        type="date"
                                        className="form-control form-control-sm"
                                        required
                                        value={editForm.ngayVe}
                                        onChange={(e) => setEditForm({ ...editForm, ngayVe: e.target.value })}
                                      />
                                    </div>
                                    <div className="col-md-2">
                                      <label className="form-label small fw-bold">Số chỗ</label>
                                      <input
                                        type="number"
                                        min={1}
                                        className="form-control form-control-sm"
                                        value={editForm.soCho}
                                        onChange={(e) => setEditForm({ ...editForm, soCho: e.target.value })}
                                      />
                                    </div>
                                    <div className="col-md-3">
                                      <label className="form-label small fw-bold">Giá override (₫)</label>
                                      <input
                                        type="number"
                                        min={0}
                                        className="form-control form-control-sm"
                                        value={editForm.giaOverride}
                                        onChange={(e) => setEditForm({ ...editForm, giaOverride: e.target.value })}
                                      />
                                    </div>
                                    <div className="col-12 text-end">
                                      <button type="submit" className="btn btn-success btn-sm me-2">
                                        Lưu
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setEditingId(null)}
                                      >
                                        Huỷ
                                      </button>
                                    </div>
                                  </div>
                                </form>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
