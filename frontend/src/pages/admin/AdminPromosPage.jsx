import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deletePromo, listPromos } from "../../api/adminPromos";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { formatVnd } from "../../utils/format";
function AdminPromosPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  function load(p = 0) {
    listPromos(p, 20)
      .then((r) => {
        setItems(r.data.content ?? []);
        setTotalPages(r.data.totalPages ?? 0);
        setPage(r.data.page ?? p);
      })
      .catch(() => setItems([]));
  }
  useEffect(() => {
    load(0);
  }, []);
  async function onDelete(id) {
    if (!confirm("X\xF3a m\xE3 n\xE0y?")) return;
    await deletePromo(id);
    load(page);
  }
  const today = /* @__PURE__ */ new Date().toISOString().slice(0, 10);
  return /* @__PURE__ */ React.createElement(
    "div",
    { className: "container-fluid px-0" },
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "d-flex justify-content-between align-items-center mb-4" },
      /* @__PURE__ */ React.createElement(
        "h2",
        { className: "fw-bold mb-0" },
        "Qu\u1EA3n l\xFD m\xE3 gi\u1EA3m gi\xE1",
      ),
      /* @__PURE__ */ React.createElement(
        Link,
        {
          to: "/admin/promo/create",
          className: "btn btn-primary rounded-pill px-4",
        },
        /* @__PURE__ */ React.createElement("i", {
          className: "bi bi-plus-lg me-1",
        }),
        " Th\xEAm m\xE3",
      ),
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
                "M\xE3",
              ),
              /* @__PURE__ */ React.createElement("th", null, "Lo\u1EA1i"),
              /* @__PURE__ */ React.createElement("th", null, "Gi\u1EA3m"),
              /* @__PURE__ */ React.createElement("th", null, "Chi\u1EBFn d\u1ECBch"),
              /* @__PURE__ */ React.createElement("th", null, "\u0110\u01A1n t\u1ED1i thi\u1EC3u"),
              /* @__PURE__ */ React.createElement("th", null, "L\u01B0\u1EE3t d\u00F9ng"),
              /* @__PURE__ */ React.createElement(
                "th",
                null,
                "Hi\u1EC7u l\u1EF1c",
              ),
              /* @__PURE__ */ React.createElement(
                "th",
                null,
                "Tr\u1EA1ng th\xE1i",
              ),
              /* @__PURE__ */ React.createElement(
                "th",
                { className: "text-center" },
                "Thao t\xE1c",
              ),
            ),
          ),
          /* @__PURE__ */ React.createElement(
            "tbody",
            null,
            items.map((p) => {
              const expired =
                (p.ngayBatDau && today < p.ngayBatDau) ||
                (p.ngayKetThuc && today > p.ngayKetThuc);
              return /* @__PURE__ */ React.createElement(
                "tr",
                { key: p.id },
                /* @__PURE__ */ React.createElement(
                  "td",
                  { className: "px-4 fw-bold" },
                  p.ma,
                ),
                /* @__PURE__ */ React.createElement(
                  "td",
                  null,
                  p.loai === "AMOUNT" ? "Ti\u1EC1n" : "%",
                ),
                /* @__PURE__ */ React.createElement(
                  "td",
                  null,
                  p.loai === "AMOUNT"
                    ? formatVnd(Number(p.giaTri))
                    : `${p.giaTri}%${p.giamToiDa ? ` (max ${formatVnd(Number(p.giamToiDa))})` : ""}`,
                ),
                /* @__PURE__ */ React.createElement(
                  "td",
                  { className: "small" },
                  p.kieuChienDich === "EARLY_BIRD"
                    ? `Early Bird ${p.soNgayDatTruoc ?? ""} ng\u00E0y`
                    : p.kieuChienDich === "LAST_MINUTE"
                      ? `Last-min ${p.soGioLastMinute ?? 48}h`
                      : "Th\u01B0\u1EDDng",
                ),
                /* @__PURE__ */ React.createElement(
                  "td",
                  null,
                  p.donToiThieu ? formatVnd(Number(p.donToiThieu)) : "\u2014",
                ),
                /* @__PURE__ */ React.createElement(
                  "td",
                  { className: "small" },
                  `${p.soLanDaDung ?? 0}${p.soLanDungToiDa != null ? ` / ${p.soLanDungToiDa}` : ""}`,
                ),
                /* @__PURE__ */ React.createElement(
                  "td",
                  { className: "small" },
                  (p.ngayBatDau ?? "\u2014") +
                    " \u2192 " +
                    (p.ngayKetThuc ?? "\u2014"),
                ),
                /* @__PURE__ */ React.createElement(
                  "td",
                  null,
                  expired || !p.active
                    ? /* @__PURE__ */ React.createElement(
                        "span",
                        { className: "badge bg-secondary" },
                        "H\u1EBFt h\u1EA1n",
                      )
                    : /* @__PURE__ */ React.createElement(
                        "span",
                        { className: "badge bg-success" },
                        "Active",
                      ),
                ),
                /* @__PURE__ */ React.createElement(
                  "td",
                  { className: "text-center" },
                  /* @__PURE__ */ React.createElement(
                    Link,
                    {
                      to: `/admin/promo/edit/${p.id}`,
                      className: "btn btn-sm btn-outline-primary me-1",
                    },
                    "S\u1EEDa",
                  ),
                  /* @__PURE__ */ React.createElement(
                    "button",
                    {
                      type: "button",
                      className: "btn btn-sm btn-outline-danger",
                      onClick: () => onDelete(p.id),
                    },
                    "X\xF3a",
                  ),
                ),
              );
            }),
            items.length === 0 &&
              /* @__PURE__ */ React.createElement(
                "tr",
                null,
                /* @__PURE__ */ React.createElement(
                  "td",
                  { colSpan: 9, className: "text-center py-5 text-muted" },
                  "Ch\u01B0a c\xF3 m\xE3.",
                ),
              ),
          ),
        ),
      ),
    ),
    /* @__PURE__ */ React.createElement(AdminPagination, {
      page,
      totalPages,
      onPage: (p) => load(p),
    }),
  );
}
export { AdminPromosPage };
