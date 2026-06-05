import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getAdminTour, updateAdminTour } from '../../api/adminTours'
import {
  emptyTourForm,
  TourAdminFormLayout,
  buildTourPayload,
  cascadeFromDestination,
} from '../../components/admin/TourAdminForm'
import { imageUrl } from '../../utils/format'

export function AdminTourEditPage() {
  const { id } = useParams()
  const tourId = Number(id)
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [currentImage, setCurrentImage] = useState('')
  const [form, setForm] = useState(emptyTourForm())

  useEffect(() => {
    if (!tourId) return
    getAdminTour(tourId)
      .then((r) => {
        const t = r.data
        setCurrentImage(imageUrl(t.hinhAnh))
        const base = {
          tieuDe: t.tieuDe ?? '',
          gia: String(t.gia ?? ''),
          ngayKhoiHanh: t.ngayKhoiHanh?.slice(0, 10) ?? '',
          ngayKetThuc: t.ngayKetThuc?.slice(0, 10) ?? '',
          idPhuongTien: t.phuongTien?.id ? String(t.phuongTien.id) : '',
          idDiemDon: (() => {
            const first = t.diemDons ? [...t.diemDons][0] : undefined
            return first?.id ? String(first.id) : ''
          })(),
          idNoiLuuTru: t.noiLuuTru?.id ? String(t.noiLuuTru.id) : '',
          moTa: t.moTa ?? '',
          highlight: t.highlight ?? '',
          hinhAnh: t.hinhAnh ?? '',
          noiBat: !!t.noiBat,
        }
        setForm({
          ...emptyTourForm(),
          ...base,
          ...cascadeFromDestination(t.diemDen, base),
        })
      })
      .catch(() => setError('Không tải được tour'))
  }, [tourId])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await updateAdminTour(tourId, buildTourPayload(form))
      navigate(`/admin/tour/detail/${tourId}?source=active`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật')
    }
  }

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item">
                <Link to="/admin/tour/active" className="text-decoration-none text-muted fw-bold">
                  Chuyến đi
                </Link>
              </li>
              <li className="breadcrumb-item active fw-bold">Sửa đổi nội dung</li>
            </ol>
          </nav>
          <h3 className="fw-bolder mb-0 text-dark">
            <i className="bi bi-pencil-square text-primary me-2" />
            Cập Nhật Chuyến Đi
          </h3>
        </div>
        <Link
          to={`/admin/tour/detail/${tourId}`}
          className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-bold shadow-sm bg-white"
        >
          <i className="bi bi-arrow-left me-1" />
          Trở về Chi tiết
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={onSubmit} autoComplete="off">
        <TourAdminFormLayout
          form={form}
          onChange={setForm}
          showCurrentImage={currentImage}
          footer={
            <button type="submit" className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm">
              <i className="bi bi-save me-1" />
              Lưu Thay Đổi
            </button>
          }
        />
      </form>
    </div>
  )
}
