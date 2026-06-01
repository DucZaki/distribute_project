import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createPromo, listPromos, updatePromo } from '../../api/adminPromos'

export function AdminPromoFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    ma: '',
    moTa: '',
    loai: 'PERCENT',
    giaTri: '',
    ngayBatDau: '',
    ngayKetThuc: '',
    soLanDungToiDa: '',
    active: true,
  })

  useEffect(() => {
    if (!isEdit) return
    listPromos(0, 200).then((r) => {
      const p = (r.data.content ?? []).find((x) => x.id === Number(id))
      if (!p) return
      setForm({
        ma: p.ma,
        moTa: p.moTa ?? '',
        loai: p.loai,
        giaTri: String(p.giaTri),
        ngayBatDau: p.ngayBatDau ?? '',
        ngayKetThuc: p.ngayKetThuc ?? '',
        soLanDungToiDa: p.soLanDungToiDa != null ? String(p.soLanDungToiDa) : '',
        active: p.active !== false,
      })
    }).catch(() => {})
  }, [id, isEdit])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const body = {
      ma: form.ma,
      moTa: form.moTa,
      loai: form.loai,
      giaTri: Number(form.giaTri),
      ngayBatDau: form.ngayBatDau || null,
      ngayKetThuc: form.ngayKetThuc || null,
      soLanDungToiDa: form.soLanDungToiDa ? Number(form.soLanDungToiDa) : null,
      active: form.active,
    }
    try {
      if (isEdit) await updatePromo(Number(id), body)
      else await createPromo(body)
      navigate('/admin/promo')
    } catch (err: any) {
      setError(err.message ?? 'Lỗi')
    }
  }

  return (
    <div className="container-fluid px-0" style={{ maxWidth: 640 }}>
      <div className="d-flex justify-content-between mb-4">
        <h2 className="fw-bold mb-0">{isEdit ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'}</h2>
        <Link to="/admin/promo" className="btn btn-outline-secondary btn-sm">Quay lại</Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <form className="card border-0 shadow-sm rounded-4 p-4" onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Mã</label>
          <input className="form-control" required value={form.ma} onChange={(e) => setForm({ ...form, ma: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label">Mô tả</label>
          <input className="form-control" value={form.moTa} onChange={(e) => setForm({ ...form, moTa: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label">Loại</label>
          <select className="form-select" value={form.loai} onChange={(e) => setForm({ ...form, loai: e.target.value })}>
            <option value="PERCENT">Phần trăm (%)</option>
            <option value="AMOUNT">Số tiền (VND)</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Giá trị</label>
          <input type="number" className="form-control" required value={form.giaTri} onChange={(e) => setForm({ ...form, giaTri: e.target.value })} />
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label">Bắt đầu</label>
            <input type="date" className="form-control" value={form.ngayBatDau} onChange={(e) => setForm({ ...form, ngayBatDau: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Kết thúc</label>
            <input type="date" className="form-control" value={form.ngayKetThuc} onChange={(e) => setForm({ ...form, ngayKetThuc: e.target.value })} />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Số lần dùng tối đa</label>
          <input type="number" className="form-control" value={form.soLanDungToiDa} onChange={(e) => setForm({ ...form, soLanDungToiDa: e.target.value })} />
        </div>
        <div className="form-check mb-3">
          <input className="form-check-input" type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          <label className="form-check-label">Active</label>
        </div>
        <button type="submit" className="btn btn-primary">Lưu</button>
      </form>
    </div>
  )
}
