import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  deleteAdminTour,
  getAdminTour,
  updateAdminTour,
  type LichTrinhDto,
  type TourResponse,
} from '../../api/adminTours'
import { TourDepartureDatesPanel } from '../../components/admin/TourDepartureDatesPanel'
import { formatTourDateInfo, linesToMoTa } from '../../utils/tourAdminHelpers'
import { formatVnd, imageUrl } from '../../utils/format'

type TabId = 'info' | 'departures' | 'itinerary'

const emptyItinerary = (ngayThu: number): LichTrinhDto => ({
  ngayThu,
  tieuDe: '',
  soBuaAn: '',
  moTa: '',
  nghiDem: '',
})

function itineraryNoiDung(lt: LichTrinhDto) {
  return lt.moTa ?? ''
}

export function AdminTourDetailPage() {
  const { id } = useParams()
  const tourId = Number(id)
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const source = search.get('source') || 'active'

  const [tour, setTour] = useState<TourResponse | null>(null)
  const [tab, setTab] = useState<TabId>('info')
  const [msg, setMsg] = useState('')
  const [showCreateItinerary, setShowCreateItinerary] = useState(false)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [itineraryForm, setItineraryForm] = useState<LichTrinhDto>(emptyItinerary(1))
  const [noiDungText, setNoiDungText] = useState('')

  function reload() {
    getAdminTour(tourId)
      .then((r) => setTour(r.data))
      .catch(() => setTour(null))
  }

  useEffect(() => {
    if (!tourId) return
    reload()
    const tabParam = search.get('tab')
    if (tabParam === 'departures' || tabParam === 'itinerary' || tabParam === 'info') {
      setTab(tabParam)
      return
    }
    const saved = sessionStorage.getItem('tourTab')
    if (saved === 'departures' || saved === 'itinerary' || saved === 'info') {
      setTab(saved as TabId)
    } else if (saved === 'schedule') {
      setTab('itinerary')
    }
  }, [tourId, search])

  useEffect(() => {
    sessionStorage.setItem('tourTab', tab)
  }, [tab])

  async function onDelete() {
    if (!confirm('Bạn có chắc muốn xóa chuyến đi này?')) return
    await deleteAdminTour(tourId)
    navigate(`/admin/tour/${source}`)
  }

  async function saveItineraries(next: LichTrinhDto[]) {
    if (!tour) return
    await updateAdminTour(tourId, {
      tieuDe: tour.tieuDe!,
      moTa: tour.moTa,
      gia: Number(tour.gia),
      idDiemDen: tour.diemDen!.id!,
      hinhAnh: tour.hinhAnh,
      highlight: tour.highlight,
      noiBat: tour.noiBat,
      ngayKhoiHanh: tour.ngayKhoiHanh,
      ngayKetThuc: tour.ngayKetThuc,
      lichTrinhs: next,
    })
    setMsg('Đã lưu lịch trình')
    setEditingIdx(null)
    setShowCreateItinerary(false)
    reload()
  }

  async function onSaveItinerary(e: FormEvent) {
    e.preventDefault()
    const payload: LichTrinhDto = {
      ...itineraryForm,
      moTa: linesToMoTa(noiDungText),
    }
    const list = [...(tour?.lichTrinhs ?? [])]
    if (editingIdx != null) {
      list[editingIdx] = { ...list[editingIdx], ...payload }
    } else {
      list.push(payload)
    }
    list.sort((a, b) => a.ngayThu - b.ngayThu)
    await saveItineraries(list)
    setItineraryForm(emptyItinerary(1))
    setNoiDungText('')
  }

  function openCreateForm() {
    const nextDay = (tour?.lichTrinhs?.length ?? 0) + 1
    setShowCreateItinerary(true)
    setEditingIdx(null)
    setItineraryForm(emptyItinerary(nextDay))
    setNoiDungText('')
  }

  function closeCreateForm() {
    setShowCreateItinerary(false)
    setItineraryForm(emptyItinerary(1))
    setNoiDungText('')
  }

  function startEdit(idx: number) {
    const lt = tour?.lichTrinhs?.[idx]
    if (!lt) return
    setEditingIdx(idx)
    setShowCreateItinerary(false)
    setItineraryForm({ ...lt })
    setNoiDungText(itineraryNoiDung(lt))
    setTab('itinerary')
  }

  function cancelEdit() {
    setEditingIdx(null)
    setItineraryForm(emptyItinerary(1))
    setNoiDungText('')
  }

  async function onDeleteItinerary(idx: number) {
    if (!confirm('Bạn chắc chắn muốn xoá?')) return
    const next = [...(tour?.lichTrinhs ?? [])]
    next.splice(idx, 1)
    await saveItineraries(next)
  }

  function renderItineraryForm(submitLabel: string, onCancel: () => void) {
    return (
      <form onSubmit={onSaveItinerary} autoComplete="off">
        <div className="mb-3">
          <label className="fw-semibold">Ngày {itineraryForm.ngayThu}</label>
        </div>
        <div className="mb-3">
          <label>Tiêu đề</label>
          <input
            type="text"
            className="form-control"
            required
            value={itineraryForm.tieuDe}
            onChange={(e) => setItineraryForm({ ...itineraryForm, tieuDe: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <label>Số bữa ăn</label>
          <input
            type="text"
            className="form-control"
            value={itineraryForm.soBuaAn ?? ''}
            onChange={(e) => setItineraryForm({ ...itineraryForm, soBuaAn: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <label>Nội dung</label>
          <textarea
            name="noiDung"
            rows={4}
            className="form-control"
            value={noiDungText}
            onChange={(e) => setNoiDungText(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label>Nghỉ đêm</label>
          <input
            type="text"
            className="form-control"
            value={itineraryForm.nghiDem ?? ''}
            onChange={(e) => setItineraryForm({ ...itineraryForm, nghiDem: e.target.value })}
          />
        </div>
        <div className="text-end">
          <button type="submit" className="btn btn-success me-2">
            {submitLabel}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Huỷ
          </button>
        </div>
      </form>
    )
  }

  if (!tour) return <div className="text-muted py-5">Đang tải...</div>

  const lichTrinhs = tour.lichTrinhs ?? []
  const isFlightTour =
    tour.phuongTien?.loai?.toLowerCase().includes('máy bay') ||
    tour.phuongTien?.ten?.toLowerCase().includes('máy bay') ||
    tour.phuongTien?.loai?.toLowerCase().includes('may bay')

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <Link to={`/admin/tour/${source}`} className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left" /> Quay lại
        </Link>
        <div>
          {source === 'active' && (
            <Link to={`/admin/tour/edit/${tourId}`} className="btn btn-warning me-2">
              <i className="bi bi-pencil" /> Sửa
            </Link>
          )}
          <button type="button" className="btn btn-danger" onClick={onDelete}>
            <i className="bi bi-trash" /> Xóa
          </button>
        </div>
      </div>

      <h3 className="fw-bold mb-3">{tour.tieuDe}</h3>
      {msg && <div className="alert alert-success py-2">{msg}</div>}

      <ul className="nav nav-tabs" id="tourTab" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            type="button"
            role="tab"
            className={`nav-link ${tab === 'info' ? 'active' : ''}`}
            onClick={() => setTab('info')}
          >
            Thông tin
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            type="button"
            role="tab"
            className={`nav-link ${tab === 'departures' ? 'active' : ''}`}
            onClick={() => setTab('departures')}
          >
            <i className="bi bi-calendar-event me-1" />
            Ngày khởi hành
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            type="button"
            role="tab"
            className={`nav-link ${tab === 'itinerary' ? 'active' : ''}`}
            onClick={() => setTab('itinerary')}
          >
            Lịch trình
          </button>
        </li>
      </ul>

      <div className="tab-content mt-3">
        {tab === 'info' && (
          <div className="tab-pane show active">
            <div className="row g-4">
              <div className="col-lg-4 text-center">
                <img
                  src={imageUrl(tour.hinhAnh)}
                  className="img-fluid rounded shadow"
                  style={{ maxHeight: 400, objectFit: 'cover' }}
                  alt={tour.tieuDe}
                />
              </div>
              <div className="col-lg-8">
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-4 fw-semibold text-muted">Tiêu đề</div>
                      <div className="col-md-8">{tour.tieuDe}</div>
                    </div>
                    <hr />
                    <div className="row mb-3">
                      <div className="col-md-4 fw-semibold text-muted">Giá dịch vụ</div>
                      <div className="col-md-8 text-danger fw-bold">{formatVnd(Number(tour.gia ?? 0))}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4 fw-semibold text-muted">Ngày khởi hành</div>
                      <div className="col-md-8">{formatTourDateInfo(tour.ngayKhoiHanh)}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4 fw-semibold text-muted">Ngày kết thúc</div>
                      <div className="col-md-8">{formatTourDateInfo(tour.ngayKetThuc)}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4 fw-semibold text-muted">Phương tiện</div>
                      <div className="col-md-8">{tour.phuongTien?.loai ?? tour.phuongTien?.ten ?? '—'}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4 fw-semibold text-muted">Điểm đến</div>
                      <div className="col-md-8">{tour.diemDen?.ten ?? '—'}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4 fw-semibold text-muted">Nơi lưu trú</div>
                      <div className="col-md-8">{tour.noiLuuTru?.ten ?? 'Không có'}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4 fw-semibold text-muted">Loại nơi lưu trú</div>
                      <div className="col-md-8">{tour.noiLuuTru?.loai ?? 'Không có'}</div>
                    </div>
                    <hr />
                    <div className="mb-2 fw-semibold text-muted">Mô tả</div>
                    <div className="p-3 bg-light rounded">{tour.moTa}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'departures' && (
          <TourDepartureDatesPanel tourId={tourId} isFlightTour={isFlightTour} />
        )}

        {tab === 'itinerary' && (
          <div>
            <h5 className="fw-bold mb-3">
              <i className="bi bi-list-check" /> Lịch trình tour
            </h5>

            {lichTrinhs.length === 0 && !showCreateItinerary && (
              <div id="emptyBlock">
                <div className="card shadow-sm border-0 mb-3">
                  <div className="card-body py-4 text-muted text-center">
                    Chưa có lịch trình nào cho chuyến đi này
                  </div>
                </div>
                <button
                  type="button"
                  id="addBlockEmty"
                  className="card border-2 border-dashed text-center add-block w-100 bg-white"
                  onClick={openCreateForm}
                >
                  <div className="card-body py-4">
                    <i className="bi bi-plus-circle fs-2 text-primary" />
                    <div className="fw-semibold">Thêm ngày mới</div>
                  </div>
                </button>
              </div>
            )}

            {lichTrinhs.map((lt, idx) => (
              <div key={lt.id ?? idx} className="mb-4 pb-3 border-bottom">
                {editingIdx === idx ? (
                  <div className="card shadow-sm">
                    <div className="card-body">{renderItineraryForm('Lưu', cancelEdit)}</div>
                  </div>
                ) : (
                  <>
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="fw-bold mb-0">
                        Ngày {lt.ngayThu} - {lt.tieuDe}
                      </h5>
                      <div className="d-flex gap-2">
                        <button type="button" className="btn btn-sm btn-warning" onClick={() => startEdit(idx)}>
                          Sửa
                        </button>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => onDeleteItinerary(idx)}>
                          Xoá
                        </button>
                      </div>
                    </div>
                    {lt.soBuaAn && (
                      <div className="text-muted mb-2">
                        <i className="bi bi-cup-hot" /> {lt.soBuaAn}
                      </div>
                    )}
                    {itineraryNoiDung(lt) && <p className="mb-2">{itineraryNoiDung(lt)}</p>}
                    {lt.nghiDem && (
                      <div className="fw-semibold text-primary">
                        <i className="bi bi-moon-stars" /> Nghỉ đêm: {lt.nghiDem}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}

            {showCreateItinerary && editingIdx === null && (
              <div id="createForm" className="card mt-3 shadow-sm">
                <div className="card-body">{renderItineraryForm('Lưu', closeCreateForm)}</div>
              </div>
            )}

            {lichTrinhs.length > 0 && !showCreateItinerary && editingIdx === null && (
              <button
                type="button"
                id="addBlockList"
                className="card border-2 border-dashed text-center add-block w-100 bg-white mt-3"
                onClick={openCreateForm}
              >
                <div className="card-body py-4">
                  <i className="bi bi-plus-circle fs-2 text-primary" />
                  <div className="fw-semibold">Thêm ngày mới</div>
                </div>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
