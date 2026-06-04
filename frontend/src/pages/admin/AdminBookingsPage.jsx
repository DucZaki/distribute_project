import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { cancelAdminBooking, listAdminBookings } from "../../api/adminBookings";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { formatVnd, statusLabel } from "../../utils/format";

function AdminBookingsPage() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState(searchParams.get("trangThai") ?? "");
  const [msg, setMsg] = useState("");

  function load(p = page) {
    listAdminBookings(status || undefined, p, 20).then((r) => {
      setItems(r.data.content ?? []);
      setTotalPages(r.data.totalPages ?? 0);
      setPage(r.data.page ?? p);
    }).catch(() => setItems([]));
  }

  useEffect(() => {
    setStatus(searchParams.get("trangThai") ?? "");
  }, [searchParams]);

  useEffect(() => {
    load(0);
  }, [status]);

  async function onCancel(id) {
    if (!confirm("Hủy đơn đặt chỗ này?")) return;
    try {
      await cancelAdminBooking(id);
      setMsg("Đã hủy đơn đặt chỗ");
      load();
    } catch (e) {
      setMsg(e.message ?? "Lỗi");
    }
  }

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h2 className="fw-bold mb-0">Quản lý đặt chỗ</h2>
        <select className="form-select form-select-sm" style={{ width: 220 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ thanh toán</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="PAID">Đã thanh toán</option>
          <option value="CANCELLED">Đã hủy</option>
          <option value="FAILED">Thất bại</option>
        </select>
      </div>

      {msg && <div className="alert alert-info py-2">{msg}</div>}

      <div className="card border-0 shadow-sm rounded-4">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4">ID</th>
                <th>Tour</th>
                <th>Khách hàng</th>
                <th>Số lượng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 fw-bold">#{b.id}</td>
                  <td>{b.tourTitle ?? b.tenTour ?? `Tour #${b.idChuyenDi ?? b.tourId ?? ""}`}</td>
                  <td>{b.hoTen ?? b.userName ?? b.email ?? `Người dùng #${b.idNguoiDung ?? b.userId ?? ""}`}</td>
                  <td>{b.soLuong ?? "—"}</td>
                  <td className="text-danger fw-bold">{formatVnd(Number(b.tongGia ?? b.totalPrice ?? 0))}</td>
                  <td><span className="badge bg-secondary-subtle text-dark">{statusLabel(b.trangThai)}</span></td>
                  <td className="text-center">
                    {(b.trangThai === "PENDING" || b.trangThai === "PAID") && (
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onCancel(b.id)}>
                        Hủy
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted py-4">Chưa có đơn đặt chỗ.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPagination page={page} totalPages={totalPages} onPage={load} />
    </div>
  );
}

export { AdminBookingsPage };
