import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../../api/client'
import { createAdminTour } from '../../api/adminTours'

type Destination = { id: number; ten: string }

export function AdminTourCreatePage() {
  const navigate = useNavigate()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    tieuDe: '',
    moTa: '',
    gia: '',
    idDiemDen: '',
    hinhAnh: '/anh/anh/diemden/hanoi.jpg',
    ngayKhoiHanh: '',
    ngayKetThuc: '',
    noiBat: false,
  })

  useEffect(() => {
    apiFetch<Destination[]>('/tours/destinations', {}, false)
      .then((r) => setDestinations(r.data ?? []))
      .catch(() => setDestinations([]))
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const r = await createAdminTour({
        tieuDe: form.tieuDe,
        moTa: form.moTa,
        gia: Number(form.gia),
        idDiemDen: Number(form.idDiemDen),
        hinhAnh: form.hinhAnh,
        ngayKhoiHanh: form.ngayKhoiHanh || null,
        ngayKetThuc: form.ngayKetThuc || null,
        noiBat: form.noiBat,
        lichTrinhs: [],
      })
      navigate(`/admin/tour/detail/${r.data.id}`)
    } catch (err: any) {
      setError(err.message ?? 'Lỗi tạo tour')
    }
  }

  return (
    <div className="container-fluid px-0" style={{ maxWidth: 720 }}>
      <div className="d-flex justify-content-between mb-4">
        <h2 className="fw-bold mb-0">Tạo chuyến đi mới</h2>
        <Link to="/admin/tour/active" className="btn btn-outline-secondary btn-sm">Quay lại</Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <form className="card border-0 shadow-sm rounded-4 p-4" onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Tiêu đề</label>
          <input className="form-control" required value={form.tieuDe} onChange={(e) => setForm({ ...form, tieuDe: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label">Mô tả</label>
          <textarea className="form-control" rows={4} value={form.moTa} onChange={(e) => setForm({ ...form, moTa: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label">Giá (VND)</label>
          <input className="form-control" type="number" required value={form.gia} onChange={(e) => setForm({ ...form, gia: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label">Điểm đến</label>
          <select className="form-select" required value={form.idDiemDen} onChange={(e) => setForm({ ...form, idDiemDen: e.target.value })}>
            <option value="">Chọn điểm đến</option>
            {destinations.map((d) => <option key={d.id} value={d.id}>{d.ten}</option>)}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Ảnh (URL)</label>
          <input className="form-control" value={form.hinhAnh} onChange={(e) => setForm({ ...form, hinhAnh: e.target.value })} />
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label">Ngày bắt đầu</label>
            <input type="date" className="form-control" value={form.ngayKhoiHanh} onChange={(e) => setForm({ ...form, ngayKhoiHanh: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Ngày kết thúc</label>
            <input type="date" className="form-control" value={form.ngayKetThuc} onChange={(e) => setForm({ ...form, ngayKetThuc: e.target.value })} />
          </div>
        </div>
        <div className="form-check mb-3">
          <input className="form-check-input" type="checkbox" checked={form.noiBat} onChange={(e) => setForm({ ...form, noiBat: e.target.checked })} />
          <label className="form-check-label">Tour nổi bật</label>
        </div>
        <button type="submit" className="btn btn-primary">Tạo tour</button>
      </form>
    </div>
  )
}
