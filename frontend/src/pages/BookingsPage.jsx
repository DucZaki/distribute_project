import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cancelBooking, myBookings, redirectToVnPay } from "../api/bookings";
import { ApiError } from "../api/client";
import { UserSidebar } from "../components/UserSidebar";
import { bookingTabFilter, formatVnd, statusLabel } from "../utils/format";
function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("all");
  const [payError, setPayError] = useState("");
  const [payingId, setPayingId] = useState(null);
  async function handlePay(bookingId) {
    setPayError("");
    setPayingId(bookingId);
    try {
      await redirectToVnPay(bookingId, true);
    } catch (err) {
      setPayError(err instanceof ApiError ? err.message : "Không thể mở VNPay");
      setPayingId(null);
    }
  }
  function reload() {
    myBookings(0, 50)
      .then((r) => setBookings(r.data.content ?? []))
      .catch(() => setBookings([]));
  }
  useEffect(() => {
    reload();
  }, []);
  const filtered = bookings.filter((b) => bookingTabFilter(tab, b.trangThai));
  return /* @__PURE__ */ React.createElement(
    "div",
    { className: "container my-5 pt-4" },
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "mb-3" },
      /* @__PURE__ */ React.createElement(
        Link,
        { to: "/", className: "text-decoration-none text-dark small fw-bold" },
        /* @__PURE__ */ React.createElement("i", {
          className: "bi bi-arrow-left me-1",
        }),
        " Quay l\u1EA1i trang ch\u1EE7",
      ),
    ),
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "row" },
      /* @__PURE__ */ React.createElement(UserSidebar, { active: "bookings" }),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "col-lg-9" },
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "d-flex align-items-center mb-4" },
          /* @__PURE__ */ React.createElement("i", {
            className: "bi bi-luggage-fill text-booking-primary fs-3 me-2",
          }),
          /* @__PURE__ */ React.createElement(
            "h3",
            { className: "fw-bold mb-0" },
            "L\u1ECBch s\u1EED \u0111\u1EB7t ch\u1ED7 c\u1EE7a t\xF4i",
          ),
        ),
        payError &&
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "alert alert-danger mt-3" },
            payError,
          ),
        /* @__PURE__ */ React.createElement(
          "ul",
          {
            className:
              "nav nav-pills mb-4 bg-white p-2 rounded-3 shadow-sm small fw-bold",
          },
          ["all", "pending", "paid", "failed"].map((t) =>
            /* @__PURE__ */ React.createElement(
              "li",
              { key: t, className: "nav-item" },
              /* @__PURE__ */ React.createElement(
                "button",
                {
                  type: "button",
                  className: `nav-link rounded-pill${tab === t ? " active" : ""}`,
                  onClick: () => setTab(t),
                },
                t === "all"
                  ? "T\u1EA5t c\u1EA3"
                  : t === "pending"
                    ? "Ch\u1EDD thanh to\xE1n"
                    : t === "paid"
                      ? "\u0110\xE3 thanh to\xE1n"
                      : "Th\u1EA5t b\u1EA1i/H\u1EBFt h\u1EA1n",
              ),
            ),
          ),
        ),
        filtered.length === 0 &&
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "alert alert-light" },
            "Ch\u01B0a c\xF3 \u0111\u01A1n trong m\u1EE5c n\xE0y.",
          ),
        filtered.map((b) =>
          /* @__PURE__ */ React.createElement(
            "div",
            { key: b.id, className: "card border-0 shadow-sm mb-3" },
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "card-body" },
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "d-flex justify-content-between flex-wrap gap-2" },
                /* @__PURE__ */ React.createElement(
                  "strong",
                  null,
                  "\u0110\u01A1n #",
                  b.id,
                ),
                /* @__PURE__ */ React.createElement(
                  "span",
                  { className: "badge bg-secondary" },
                  statusLabel(b.trangThai),
                ),
              ),
              /* @__PURE__ */ React.createElement(
                "p",
                { className: "text-muted small mb-1" },
                new Date(b.createdAt).toLocaleString("vi-VN"),
              ),
              /* @__PURE__ */ React.createElement(
                "p",
                null,
                b.soLuong,
                " kh\xE1ch \xB7 ",
                formatVnd(b.tongGia),
              ),
              b.maCheckIn &&
                /* @__PURE__ */ React.createElement(
                  "p",
                  { className: "small" },
                  "M\xE3 check-in: ",
                  /* @__PURE__ */ React.createElement(
                    "code",
                    null,
                    b.maCheckIn,
                  ),
                ),
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "d-flex gap-2 flex-wrap" },
                b.trangThai === "PENDING" &&
                  /* @__PURE__ */ React.createElement(
                    "button",
                    {
                      type: "button",
                      className: "btn btn-primary btn-sm",
                      disabled: payingId === b.id,
                      onClick: () => handlePay(b.id),
                    },
                    payingId === b.id
                      ? "Đang chuyển VNPay..."
                      : "Thanh toán ngay",
                  ),
                b.trangThai === "PENDING" &&
                  /* @__PURE__ */ React.createElement(
                    "button",
                    {
                      type: "button",
                      className: "btn btn-outline-danger btn-sm",
                      onClick: () => cancelBooking(b.id).then(reload),
                    },
                    "Hu\u1EF7",
                  ),
                b.maCheckIn &&
                  /* @__PURE__ */ React.createElement(
                    Link,
                    {
                      to: `/check-in/${b.maCheckIn}`,
                      className: "btn btn-outline-primary btn-sm",
                    },
                    "QR check-in",
                  ),
                /* @__PURE__ */ React.createElement(
                  Link,
                  {
                    to: `/tour/${b.idChuyenDi}`,
                    className: "btn btn-outline-secondary btn-sm",
                  },
                  "Xem tour",
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
export { BookingsPage };
