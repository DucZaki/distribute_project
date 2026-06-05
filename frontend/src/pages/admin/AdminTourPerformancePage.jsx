import { Fragment, useEffect, useState } from "react";
import { getTopTours, getTourBookings } from "../../api/adminDashboard";
import { formatVnd } from "../../utils/format";
function AdminTourPerformancePage() {
  const [rows, setRows] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [customers, setCustomers] = useState([]);
  useEffect(() => {
    getTopTours()
      .then((r) => setRows(r.data ?? []))
      .catch(() => setRows([]));
  }, []);
  async function toggle(tourId) {
    if (expanded === tourId) {
      setExpanded(null);
      return;
    }
    setExpanded(tourId);
    try {
      const r = await getTourBookings(tourId);
      setCustomers(r.data ?? []);
    } catch {
      setCustomers([]);
    }
  }
  return /* @__PURE__ */ React.createElement(
    "div",
    { className: "container-fluid px-0" },
    /* @__PURE__ */ React.createElement(
      "h2",
      { className: "fw-bold mb-4" },
      "Hi\u1EC7u su\u1EA5t Tour",
    ),
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "card border-0 shadow-sm rounded-4" },
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "table-responsive" },
        /* @__PURE__ */ React.createElement(
          "table",
          { className: "table table-hover mb-0" },
          /* @__PURE__ */ React.createElement(
            "thead",
            { className: "bg-light" },
            /* @__PURE__ */ React.createElement(
              "tr",
              null,
              /* @__PURE__ */ React.createElement(
                "th",
                { className: "px-4" },
                "#",
              ),
              /* @__PURE__ */ React.createElement("th", null, "Tour"),
              /* @__PURE__ */ React.createElement(
                "th",
                null,
                "L\u01B0\u1EE3t \u0111\u1EB7t",
              ),
              /* @__PURE__ */ React.createElement("th", null, "Doanh thu"),
              /* @__PURE__ */ React.createElement(
                "th",
                { className: "text-center" },
                "Chi ti\u1EBFt",
              ),
            ),
          ),
          /* @__PURE__ */ React.createElement(
            "tbody",
            null,
            rows.map((row, idx) =>
              /* @__PURE__ */ React.createElement(
                Fragment,
                { key: row.tourId },
                /* @__PURE__ */ React.createElement(
                  "tr",
                  null,
                  /* @__PURE__ */ React.createElement(
                    "td",
                    { className: "px-4" },
                    idx + 1,
                  ),
                  /* @__PURE__ */ React.createElement(
                    "td",
                    { className: "fw-bold" },
                    row.tourTitle,
                  ),
                  /* @__PURE__ */ React.createElement("td", null, row.bookings),
                  /* @__PURE__ */ React.createElement(
                    "td",
                    { className: "text-success fw-bold" },
                    formatVnd(Number(row.revenue)),
                  ),
                  /* @__PURE__ */ React.createElement(
                    "td",
                    { className: "text-center" },
                    /* @__PURE__ */ React.createElement(
                      "button",
                      {
                        type: "button",
                        className: "btn btn-sm btn-primary",
                        onClick: () => toggle(row.tourId),
                      },
                      expanded === row.tourId ? "Thu g\u1ECDn" : "Xem kh\xE1ch",
                    ),
                  ),
                ),
                expanded === row.tourId &&
                  /* @__PURE__ */ React.createElement(
                    "tr",
                    null,
                    /* @__PURE__ */ React.createElement(
                      "td",
                      { colSpan: 5, className: "bg-light" },
                      /* @__PURE__ */ React.createElement(
                        "table",
                        { className: "table table-sm mb-0" },
                        /* @__PURE__ */ React.createElement(
                          "thead",
                          null,
                          /* @__PURE__ */ React.createElement(
                            "tr",
                            null,
                            /* @__PURE__ */ React.createElement(
                              "th",
                              null,
                              "Booking",
                            ),
                            /* @__PURE__ */ React.createElement(
                              "th",
                              null,
                              "T\xEAn",
                            ),
                            /* @__PURE__ */ React.createElement(
                              "th",
                              null,
                              "Email",
                            ),
                            /* @__PURE__ */ React.createElement(
                              "th",
                              null,
                              "SL",
                            ),
                            /* @__PURE__ */ React.createElement(
                              "th",
                              null,
                              "T\u1ED5ng",
                            ),
                          ),
                        ),
                        /* @__PURE__ */ React.createElement(
                          "tbody",
                          null,
                          customers.map((c) =>
                            /* @__PURE__ */ React.createElement(
                              "tr",
                              { key: c.bookingId },
                              /* @__PURE__ */ React.createElement(
                                "td",
                                null,
                                c.bookingId,
                              ),
                              /* @__PURE__ */ React.createElement(
                                "td",
                                null,
                                c.userName || "-",
                              ),
                              /* @__PURE__ */ React.createElement(
                                "td",
                                null,
                                c.email || "-",
                              ),
                              /* @__PURE__ */ React.createElement(
                                "td",
                                null,
                                c.quantity,
                              ),
                              /* @__PURE__ */ React.createElement(
                                "td",
                                null,
                                c.total != null
                                  ? formatVnd(Number(c.total))
                                  : "-",
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
              ),
            ),
            rows.length === 0 &&
              /* @__PURE__ */ React.createElement(
                "tr",
                null,
                /* @__PURE__ */ React.createElement(
                  "td",
                  { colSpan: 5, className: "text-center py-5 text-muted" },
                  "Ch\u01B0a c\xF3 d\u1EEF li\u1EC7u.",
                ),
              ),
          ),
        ),
      ),
    ),
  );
}
export { AdminTourPerformancePage };
