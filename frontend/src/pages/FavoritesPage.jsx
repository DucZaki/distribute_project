import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listFavorites, removeFavorite } from "../api/favorites";
import { getTour } from "../api/tours";
import { UserSidebar } from "../components/UserSidebar";
import { formatVnd, imageUrl } from "../utils/format";
function FavoritesPage() {
  const [items, setItems] = useState([]);
  function reload() {
    listFavorites()
      .then(async (r) => {
        const favs = r.data ?? [];
        const loaded = await Promise.all(
          favs.map(async (f) => {
            try {
              const t = await getTour(f.idChuyenDi);
              return { tourId: f.idChuyenDi, tour: t.data };
            } catch {
              return { tourId: f.idChuyenDi };
            }
          }),
        );
        setItems(loaded);
      })
      .catch(() => setItems([]));
  }
  useEffect(() => {
    reload();
  }, []);
  return /* @__PURE__ */ React.createElement(
    "div",
    { className: "container my-5 pt-4" },
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "row" },
      /* @__PURE__ */ React.createElement(UserSidebar, { active: "favorites" }),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "col-lg-9" },
        /* @__PURE__ */ React.createElement(
          "h3",
          { className: "fw-bold mb-4" },
          "Tour y\xEAu th\xEDch",
        ),
        items.length === 0 &&
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "alert alert-light" },
            "Ch\u01B0a c\xF3 tour y\xEAu th\xEDch.",
          ),
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "row g-3" },
          items.map(({ tourId, tour }) =>
            /* @__PURE__ */ React.createElement(
              "div",
              { key: tourId, className: "col-md-6" },
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "card border-0 shadow-sm h-100" },
                tour &&
                  /* @__PURE__ */ React.createElement("img", {
                    src: imageUrl(tour.hinhAnh),
                    alt: "",
                    className: "card-img-top",
                    style: { height: 160, objectFit: "cover" },
                  }),
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "card-body" },
                  /* @__PURE__ */ React.createElement(
                    "h5",
                    { className: "fw-bold" },
                    tour?.tieuDe ?? `Tour #${tourId}`,
                  ),
                  tour &&
                    /* @__PURE__ */ React.createElement(
                      "p",
                      { className: "text-danger fw-bold" },
                      formatVnd(tour.gia),
                    ),
                  /* @__PURE__ */ React.createElement(
                    "div",
                    { className: "d-flex gap-2" },
                    /* @__PURE__ */ React.createElement(
                      Link,
                      {
                        to: `/tour/${tourId}`,
                        className: "btn btn-primary btn-sm",
                      },
                      "Xem",
                    ),
                    /* @__PURE__ */ React.createElement(
                      "button",
                      {
                        type: "button",
                        className: "btn btn-outline-danger btn-sm",
                        onClick: () => removeFavorite(tourId).then(reload),
                      },
                      "B\u1ECF th\xEDch",
                    ),
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
export { FavoritesPage };
