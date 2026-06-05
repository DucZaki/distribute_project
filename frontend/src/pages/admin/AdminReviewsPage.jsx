import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteReview, listReviews } from "../../api/adminReviews";
import { listAdminTours } from "../../api/adminTours";
function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [tourTitles, setTourTitles] = useState({});
  useEffect(() => {
    listReviews(0, 200)
      .then((r) => setReviews(r.data.content ?? []))
      .catch(() => setReviews([]));
    Promise.all([
      listAdminTours("active", 0, 100),
      listAdminTours("completed", 0, 100),
    ])
      .then(([a, c]) => {
        const m = {};
        [...(a.data.content ?? []), ...(c.data.content ?? [])].forEach((t) => {
          if (t.id) m[t.id] = t.tieuDe ?? `Tour #${t.id}`;
        });
        setTourTitles(m);
      })
      .catch(() => {});
  }, []);
  const byTour = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    reviews.forEach((r) => {
      const list = map.get(r.idChuyenDi) ?? [];
      list.push(r);
      map.set(r.idChuyenDi, list);
    });
    return Array.from(map.entries()).map(([tourId, list]) => ({
      tourId,
      title: tourTitles[tourId] ?? `Tour #${tourId}`,
      count: list.length,
      avg: list.reduce((s, x) => s + x.diem, 0) / list.length,
    }));
  }, [reviews, tourTitles]);
  return /* @__PURE__ */ React.createElement(
    "div",
    { className: "container-fluid px-0" },
    /* @__PURE__ */ React.createElement(
      "h2",
      { className: "fw-bold mb-4" },
      "Qu\u1EA3n l\xFD \u0111\xE1nh gi\xE1",
    ),
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "row g-3 mb-4" },
      byTour.map((t) =>
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "col-md-4", key: t.tourId },
          /* @__PURE__ */ React.createElement(
            Link,
            {
              to: `/admin/danh-gia/tour/${t.tourId}`,
              className: "text-decoration-none",
            },
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "card border-0 shadow-sm h-100" },
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "card-body" },
                /* @__PURE__ */ React.createElement(
                  "h6",
                  { className: "fw-bold" },
                  t.title,
                ),
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "text-warning" },
                  "\u2605".repeat(Math.round(t.avg)),
                ),
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "text-muted small" },
                  t.count,
                  " \u0111\xE1nh gi\xE1",
                ),
              ),
            ),
          ),
        ),
      ),
      byTour.length === 0 &&
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "text-muted" },
          "Ch\u01B0a c\xF3 \u0111\xE1nh gi\xE1.",
        ),
    ),
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "card border-0 shadow-sm rounded-4" },
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "card-header bg-white fw-bold" },
        "T\u1EA5t c\u1EA3 \u0111\xE1nh gi\xE1",
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "table-responsive" },
        /* @__PURE__ */ React.createElement(
          "table",
          { className: "table mb-0" },
          /* @__PURE__ */ React.createElement(
            "thead",
            { className: "bg-light" },
            /* @__PURE__ */ React.createElement(
              "tr",
              null,
              /* @__PURE__ */ React.createElement(
                "th",
                { className: "px-4" },
                "Tour",
              ),
              /* @__PURE__ */ React.createElement("th", null, "User"),
              /* @__PURE__ */ React.createElement("th", null, "\u0110i\u1EC3m"),
              /* @__PURE__ */ React.createElement("th", null, "N\u1ED9i dung"),
              /* @__PURE__ */ React.createElement("th", null),
            ),
          ),
          /* @__PURE__ */ React.createElement(
            "tbody",
            null,
            reviews.map((r) =>
              /* @__PURE__ */ React.createElement(
                "tr",
                { key: r.id },
                /* @__PURE__ */ React.createElement(
                  "td",
                  { className: "px-4" },
                  tourTitles[r.idChuyenDi] ?? `#${r.idChuyenDi}`,
                ),
                /* @__PURE__ */ React.createElement(
                  "td",
                  null,
                  "#",
                  r.idNguoiDung,
                ),
                /* @__PURE__ */ React.createElement(
                  "td",
                  null,
                  "\u2605".repeat(r.diem),
                ),
                /* @__PURE__ */ React.createElement(
                  "td",
                  { className: "small" },
                  r.noiDung?.slice(0, 80),
                ),
                /* @__PURE__ */ React.createElement(
                  "td",
                  null,
                  /* @__PURE__ */ React.createElement(
                    "button",
                    {
                      type: "button",
                      className: "btn btn-sm btn-outline-danger",
                      onClick: () =>
                        deleteReview(r.id).then(() =>
                          setReviews((x) => x.filter((i) => i.id !== r.id)),
                        ),
                    },
                    "X\xF3a",
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
export { AdminReviewsPage };
