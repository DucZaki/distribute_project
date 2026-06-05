import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { confirmCheckIn, getCheckInDetail } from "../api/bookings";
import { useAuth } from "../auth/AuthContext";
import { formatVnd, statusLabel } from "../utils/format";
function CheckInVerifyPage() {
  const { token } = useParams();
  const { isAdmin } = useAuth();
  const [detail, setDetail] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  function reload() {
    if (!token) return;
    getCheckInDetail(token)
      .then((r) => setDetail(r.data))
      .catch(() => {
        setDetail({
          valid: false,
          message: "Kh\xF4ng th\u1EC3 t\u1EA3i th\xF4ng tin check-in.",
        });
      });
  }
  useEffect(() => {
    reload();
  }, [token]);
  async function onConfirm() {
    if (!token) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await confirmCheckIn(token);
      setMessage(
        res.data.firstTime
          ? "Check-in th\xE0nh c\xF4ng."
          : "Kh\xE1ch \u0111\xE3 check-in tr\u01B0\u1EDBc \u0111\xF3.",
      );
      reload();
    } catch (err) {
      setMessage(err.message ?? "Kh\xF4ng th\u1EC3 check-in.");
    } finally {
      setLoading(false);
    }
  }
  if (!detail) {
    return /* @__PURE__ */ React.createElement(
      "div",
      { className: "container py-5 text-muted" },
      "\u0110ang t\u1EA3i th\xF4ng tin check-in...",
    );
  }
  if (!detail.valid) {
    return /* @__PURE__ */ React.createElement(
      "div",
      { className: "container py-5" },
      /* @__PURE__ */ React.createElement(
        "div",
        {
          className:
            "card border-0 shadow-sm rounded-4 p-4 text-center mx-auto",
          style: { maxWidth: 560 },
        },
        /* @__PURE__ */ React.createElement("i", {
          className: "bi bi-qr-code-scan display-4 text-danger mb-3",
        }),
        /* @__PURE__ */ React.createElement(
          "h3",
          { className: "fw-bold" },
          "QR kh\xF4ng h\u1EE3p l\u1EC7",
        ),
        /* @__PURE__ */ React.createElement(
          "p",
          { className: "text-muted" },
          detail.message ??
            "M\xE3 QR kh\xF4ng h\u1EE3p l\u1EC7 ho\u1EB7c \u0111\xE3 h\u1EBFt h\u1EA1n.",
        ),
        /* @__PURE__ */ React.createElement(
          Link,
          { to: "/", className: "btn btn-primary rounded-pill px-4" },
          "V\u1EC1 trang ch\u1EE7",
        ),
      ),
    );
  }
  const qrSrc = `/api/check-in/${encodeURIComponent(detail.maCheckIn ?? token ?? "")}/qr?size=260`;
  return /* @__PURE__ */ React.createElement(
    "div",
    { className: "container py-5" },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "card border-0 shadow-lg rounded-4 overflow-hidden mx-auto",
        style: { maxWidth: 880 },
      },
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "row g-0" },
        /* @__PURE__ */ React.createElement(
          "div",
          {
            className:
              "col-md-5 bg-light p-4 d-flex flex-column align-items-center justify-content-center text-center",
          },
          /* @__PURE__ */ React.createElement("img", {
            src: qrSrc,
            alt: "QR check-in",
            className: "img-fluid rounded-4 bg-white p-2 shadow-sm",
            style: { maxWidth: 280 },
          }),
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "small text-muted mt-3" },
            "M\xE3 check-in",
          ),
          /* @__PURE__ */ React.createElement("code", null, detail.maCheckIn),
        ),
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "col-md-7 p-4 p-lg-5" },
          /* @__PURE__ */ React.createElement(
            "div",
            {
              className:
                "d-flex justify-content-between align-items-start gap-3 mb-3",
            },
            /* @__PURE__ */ React.createElement(
              "div",
              null,
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "small text-muted text-uppercase fw-bold" },
                "Phi\u1EBFu check-in",
              ),
              /* @__PURE__ */ React.createElement(
                "h3",
                { className: "fw-bold mb-0" },
                "\u0110\u01A1n #",
                detail.bookingId,
              ),
            ),
            /* @__PURE__ */ React.createElement(
              "span",
              {
                className: `badge ${detail.checkedInAt ? "bg-success" : "bg-secondary"}`,
              },
              detail.checkedInAt
                ? "\u0110\xE3 check-in"
                : statusLabel(detail.trangThai ?? ""),
            ),
          ),
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "border rounded-4 p-3 mb-3" },
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "fw-bold mb-1" },
              detail.tourTitle || `Tour #${detail.tourId}`,
            ),
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "text-muted small" },
              detail.soLuong ?? 0,
              " kh\xE1ch \xB7 ",
              formatVnd(Number(detail.tongGia ?? 0)),
            ),
          ),
          /* @__PURE__ */ React.createElement(
            "p",
            { className: "mb-1" },
            /* @__PURE__ */ React.createElement(
              "strong",
              null,
              "Kh\xE1ch h\xE0ng:",
            ),
            " ",
            detail.hoTen,
          ),
          /* @__PURE__ */ React.createElement(
            "p",
            { className: "mb-1" },
            /* @__PURE__ */ React.createElement("strong", null, "Email:"),
            " ",
            detail.email || "-",
          ),
          /* @__PURE__ */ React.createElement(
            "p",
            { className: "mb-1" },
            /* @__PURE__ */ React.createElement("strong", null, "S\u0110T:"),
            " ",
            detail.soDienThoai || "-",
          ),
          /* @__PURE__ */ React.createElement(
            "p",
            { className: "mb-3" },
            /* @__PURE__ */ React.createElement(
              "strong",
              null,
              "Th\u1EDDi gian check-in:",
            ),
            " ",
            detail.checkedInAt
              ? new Date(detail.checkedInAt).toLocaleString("vi-VN")
              : "Ch\u01B0a check-in",
          ),
          message &&
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "alert alert-info py-2" },
              message,
            ),
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "d-flex gap-2 flex-wrap" },
            isAdmin &&
              /* @__PURE__ */ React.createElement(
                "button",
                {
                  type: "button",
                  className: "btn btn-primary rounded-pill px-4",
                  disabled: loading,
                  onClick: onConfirm,
                },
                loading
                  ? "\u0110ang x\u1EED l\xFD..."
                  : "X\xE1c nh\u1EADn check-in",
              ),
            detail.tourId &&
              /* @__PURE__ */ React.createElement(
                Link,
                {
                  to: `/tour/${detail.tourId}`,
                  className: "btn btn-outline-secondary rounded-pill px-4",
                },
                "Xem tour",
              ),
            /* @__PURE__ */ React.createElement(
              Link,
              { to: "/", className: "btn btn-outline-dark rounded-pill px-4" },
              "Trang ch\u1EE7",
            ),
          ),
        ),
      ),
    ),
  );
}
export { CheckInVerifyPage };
