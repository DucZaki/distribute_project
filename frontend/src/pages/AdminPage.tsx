export function AdminPage() {
  return (
    <div className="container py-5">
      <div className="alert alert-warning">
        <h4 className="fw-bold">Admin Panel</h4>
        <p className="mb-0">
          Giao diện quản trị monolith (18 màn hình) sẽ được port sang React trong sprint tiếp theo.
          Hiện tại dùng Swagger/API gateway cho các endpoint <code>/api/admin/*</code>.
        </p>
      </div>
    </div>
  )
}
