import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { deleteReview, listReviews } from "../../api/adminReviews";
import { getAdminTour } from "../../api/adminTours";
function AdminReviewsByTourPage() {
  const { tourId } = useParams();
  const tid = Number(tourId);
  const [title, setTitle] = useState("");
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    if (!tid) return;
    getAdminTour(tid)
      .then((r) => setTitle(r.data.tieuDe ?? ""))
      .catch(() => {});
    listReviews(0, 200, tid)
      .then((r) => setReviews(r.data.content ?? []))
      .catch(() => setReviews([]));
  }, [tid]);
  return /* @__PURE__ */ React.createElement(
    "div",
    { className: "container-fluid px-0" },
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "d-flex justify-content-between mb-4" },
      /* @__PURE__ */ React.createElement(
        "h2",
        { className: "fw-bold mb-0" },
        "\u0110\xE1nh gi\xE1: ",
        title || `Tour #${tid}`,
      ),
      /* @__PURE__ */ React.createElement(
        Link,
        {
          to: "/admin/danh-gia",
          className: "btn btn-outline-secondary btn-sm",
        },
        "Quay l\u1EA1i",
      ),
    ),
    reviews.map((r) =>
      /* @__PURE__ */ React.createElement(
        "div",
        { key: r.id, className: "card border-0 shadow-sm mb-3 p-3" },
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "d-flex justify-content-between" },
          /* @__PURE__ */ React.createElement(
            "div",
            null,
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "text-warning" },
              "\u2605".repeat(r.diem),
            ),
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "small text-muted" },
              "User #",
              r.idNguoiDung,
              " \xB7 ",
              r.createdAt ? String(r.createdAt).slice(0, 10) : "",
            ),
            /* @__PURE__ */ React.createElement(
              "p",
              { className: "mb-0 mt-2" },
              r.noiDung,
            ),
          ),
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
    reviews.length === 0 &&
      /* @__PURE__ */ React.createElement(
        "p",
        { className: "text-muted" },
        "Ch\u01B0a c\xF3 \u0111\xE1nh gi\xE1 cho tour n\xE0y.",
      ),
  );
}
export { AdminReviewsByTourPage };
