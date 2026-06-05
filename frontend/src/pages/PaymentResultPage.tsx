import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getBooking } from "../api/bookings";
import { formatVnd } from "../utils/format";

const VNP_MESSAGES: Record<string, string> = {
  "00": "Giao dịch thành công",
  "07": "Trừ tiền thành công, giao dịch bị nghi ngờ",
  "09": "Giao dịch không thành công / chưa hoàn tất",
  "10": "Giao dịch không thành công",
  "11": "Hết hạn thanh toán",
  "12": "Thẻ/Tài khoản bị khóa",
  "13": "Sai OTP",
  "24": "Khách hàng hủy giao dịch",
  "51": "Tài khoản không đủ số dư",
  "65": "Vượt hạn mức giao dịch",
  "75": "Ngân hàng bảo trì",
  "79": "Nhập sai mật khẩu quá số lần",
  "99": "Lỗi không xác định",
};

function parseOrderId(txnRef: string | null): number | null {
  if (!txnRef) return null;
  const part = txnRef.split("_", 2)[0];
  const id = Number(part);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function formatPayDate(raw: string | null): string {
  if (!raw || raw.length < 14) return raw ?? "—";
  const y = raw.slice(0, 4);
  const m = raw.slice(4, 6);
  const d = raw.slice(6, 8);
  const h = raw.slice(8, 10);
  const min = raw.slice(10, 12);
  return `${d}/${m}/${y} ${h}:${min}`;
}

export function PaymentResultPage() {
  const [params] = useSearchParams();
  const code = params.get("vnp_ResponseCode") ?? params.get("RspCode");
  const success = code === "00";
  const amountCents = params.get("vnp_Amount");
  const txnRef = params.get("vnp_TxnRef");
  const orderId = parseOrderId(txnRef);
  const orderInfo = params.get("vnp_OrderInfo");
  const bankCode = params.get("vnp_BankCode");
  const payDate = params.get("vnp_PayDate");
  const message =
    VNP_MESSAGES[code ?? ""] ??
    params.get("vnp_Message") ??
    "Giao dịch chưa hoàn tất";

  const [checkInToken, setCheckInToken] = useState<string | null>(null);

  useEffect(() => {
    if (!success || orderId == null) return;
    getBooking(orderId)
      .then((r) => setCheckInToken(r.data?.maCheckIn ?? null))
      .catch(() => setCheckInToken(null));
  }, [success, orderId]);

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow border-0 payment-result-card">
            <div className="card-body p-5 text-center">
              {success ? (
                <div className="mb-4">
                  <div className="display-1 text-success mb-3">
                    <i className="bi bi-check-circle-fill" />
                  </div>
                  <h2 className="fw-bold text-success">
                    Thanh toán thành công!
                  </h2>
                  <p className="text-muted">
                    Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của ZakiBooking.
                  </p>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="display-1 text-danger mb-3">
                    <i className="bi bi-x-circle-fill" />
                  </div>
                  <h2 className="fw-bold text-danger">Thanh toán thất bại</h2>
                  <p className="text-muted">
                    {code ? `Mã lỗi: ${code} — ${message}` : message}
                  </p>
                </div>
              )}

              <hr className="my-4" />

              <div className="text-start mb-4 bg-light p-4 rounded payment-detail-box">
                <h5 className="fw-bold mb-3 border-bottom pb-2">
                  Thông tin giao dịch
                </h5>
                {orderId != null && (
                  <div className="row mb-2 payment-detail-row">
                    <div className="col-6 text-muted">Mã đơn hàng:</div>
                    <div className="col-6 fw-bold">#{orderId}</div>
                  </div>
                )}
                {amountCents && (
                  <div className="row mb-2 payment-detail-row">
                    <div className="col-6 text-muted">Số tiền:</div>
                    <div className="col-6 fw-bold text-primary">
                      {formatVnd(Number(amountCents) / 100)}
                    </div>
                  </div>
                )}
                {orderInfo && (
                  <div className="row mb-2 payment-detail-row">
                    <div className="col-6 text-muted">Nội dung:</div>
                    <div className="col-6">{orderInfo}</div>
                  </div>
                )}
                {bankCode && (
                  <div className="row mb-2 payment-detail-row">
                    <div className="col-6 text-muted">Ngân hàng:</div>
                    <div className="col-6">{bankCode}</div>
                  </div>
                )}
                {payDate && (
                  <div className="row payment-detail-row">
                    <div className="col-6 text-muted">Thời gian:</div>
                    <div className="col-6">{formatPayDate(payDate)}</div>
                  </div>
                )}
                {txnRef && (
                  <div className="row mt-2 payment-detail-row">
                    <div className="col-6 text-muted">Mã giao dịch:</div>
                    <div className="col-6 small text-break">{txnRef}</div>
                  </div>
                )}
              </div>

              {success && checkInToken && (
                <div className="mb-4 p-4 bg-warning bg-opacity-10 rounded border border-warning">
                  <h5 className="fw-bold mb-3">
                    <i className="bi bi-qr-code me-2" />
                    Mã QR check-in
                  </h5>
                  <p className="text-muted small mb-3">
                    Lưu hoặc chụp màn hình mã này — quét khi lên tour để nhân
                    viên xác nhận.
                  </p>
                  <img
                    src={`/api/check-in/${encodeURIComponent(checkInToken)}/qr?size=180`}
                    alt="QR check-in"
                    width={180}
                    height={180}
                    className="border rounded-3 p-2 bg-white mb-3"
                  />
                  <div>
                    <Link
                      to={`/check-in/${checkInToken}`}
                      className="btn btn-sm btn-outline-warning"
                    >
                      <i className="bi bi-box-arrow-up-right me-1" />
                      Mở vé online
                    </Link>
                  </div>
                </div>
              )}

              <div className="d-grid gap-2 d-md-block">
                <Link
                  to="/tour"
                  className="btn btn-outline-primary px-4 me-md-2"
                >
                  Tiếp tục xem tour
                </Link>
                <Link to="/user/bookings" className="btn btn-primary px-4">
                  Lịch sử đặt chỗ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
