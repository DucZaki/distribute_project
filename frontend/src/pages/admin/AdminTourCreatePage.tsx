import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createAdminTour } from '../../api/adminTours'
import { emptyTourForm, TourAdminFormLayout, buildTourPayload } from '../../components/admin/TourAdminForm'

export function AdminTourCreatePage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyTourForm())

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const r = await createAdminTour(buildTourPayload(form))
      navigate(`/admin/tour/detail/${r.data.id}?source=active`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tạo tour')
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
              <li className="breadcrumb-item active fw-bold">Thêm mới</li>
            </ol>
          </nav>
          <h3 className="fw-bolder mb-0 text-dark">
            <i className="bi bi-briefcase text-primary me-2" />
            Tạo Chuyến Đi Mới
          </h3>
        </div>
        <Link
          to="/admin/tour/active"
          className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-bold shadow-sm bg-white"
        >
          <i className="bi bi-arrow-left me-1" />
          Quay lại
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={onSubmit} autoComplete="off">
        <TourAdminFormLayout
          form={form}
          onChange={setForm}
          footer={
            <>
              <button type="submit" className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm">
                <i className="bi bi-save me-1" />
                Tạo Chuyến Đi
              </button>
              <Link to="/admin/tour/active" className="btn btn-outline-secondary rounded-pill fw-bold">
                Hủy bỏ
              </Link>
            </>
          }
        />
      </form>
    </div>
  )
}
