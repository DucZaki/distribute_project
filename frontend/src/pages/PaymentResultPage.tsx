import { Link, useSearchParams } from 'react-router-dom'
import { formatVnd } from '../utils/format'

export function PaymentResultPage() {
  const [params] = useSearchParams()
  const code = params.get('vnp_ResponseCode') ?? params.get('RspCode')
  const success = code === '00'
  const amount = params.get('vnp_Amount')
  const txn = params.get('vnp_TxnRef')

  return (
    <div className="container py-5" style={{ marginTop: 60, maxWidth: 560 }}>
      <div className={`card border-0 shadow-sm rounded-4 p-4 text-center ${success ? 'border-success' : 'border-danger'}`}>
        <div className={`display-4 mb-3 ${success ? 'text-success' : 'text-danger'}`}>
          <i className={`bi ${success ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`} />
        </div>
        <h2 className="fw-bold mb-2">{success ? 'Thanh toán thành công' : 'Thanh toán thất bại'}</h2>
        <p className="text-muted mb-3">
          {success
            ? 'Đơn đặt tour của bạn đã được xác nhận. Kiểm tra email và mục Đặt chỗ của tôi.'
            : 'Giao dịch chưa hoàn tất. Bạn có thể thử thanh toán lại từ danh sách đặt chỗ.'}
        </p>
        {amount && (
          <p className="fw-bold">
            Số tiền: {formatVnd(Number(amount) / 100)}
          </p>
        )}
        {txn && <p className="small text-muted">Mã giao dịch: {txn}</p>}
        <div className="d-flex gap-2 justify-content-center mt-4">
          <Link to="/user/bookings" className="btn btn-primary">Đặt chỗ của tôi</Link>
          <Link to="/" className="btn btn-outline-secondary">Về trang chủ</Link>
        </div>
      </div>
    </div>
  )
}
