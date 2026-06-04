import { useEffect, useState } from "react";
import { fetchLatestNews } from "../api/integration";
function NewsPage() {
  const [articles, setArticles] = useState([]);
  useEffect(() => {
    fetchLatestNews().then((r) => setArticles(r.data?.articles ?? [])).catch(() => setArticles([]));
  }, []);
  const featured = articles.length > 2 ? articles[2] : articles[0];
  return /* @__PURE__ */ React.createElement("div", { className: "container py-5", style: { marginTop: 50 } }, /* @__PURE__ */ React.createElement("div", { className: "border-start border-4 border-primary ps-3 mb-5" }, /* @__PURE__ */ React.createElement("h2", { className: "fw-bold text-uppercase m-0" }, "Tin t\u1EE9c m\u1EDBi nh\u1EA5t"), /* @__PURE__ */ React.createElement("p", { className: "text-muted mb-0" }, "C\u1EADp nh\u1EADt tin t\u1EE9c du l\u1ECBch 2026")), articles.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "alert alert-light" }, "Ch\u01B0a c\xF3 tin (c\u1EA5u h\xECnh NEWS_API_KEY cho integration-service)."), /* @__PURE__ */ React.createElement("div", { className: "row g-4" }, featured && /* @__PURE__ */ React.createElement("div", { className: "col-12 mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "card border-0 shadow-sm rounded-4 overflow-hidden bg-dark text-white" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: featured.urlToImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200",
      className: "card-img opacity-50",
      style: { height: 450, objectFit: "cover" },
      alt: ""
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "card-img-overlay d-flex flex-column justify-content-end p-4 p-md-5" }, /* @__PURE__ */ React.createElement("span", { className: "badge bg-danger mb-3", style: { width: "fit-content" } }, "N\u1ED4I B\u1EACT"), /* @__PURE__ */ React.createElement("h1", { className: "card-title fw-bold" }, featured.title), /* @__PURE__ */ React.createElement("p", { className: "card-text fs-5 d-none d-md-block" }, featured.description), featured.url && /* @__PURE__ */ React.createElement("a", { href: featured.url, target: "_blank", rel: "noreferrer", className: "btn btn-primary rounded-pill px-4", style: { width: "fit-content" } }, "\u0110\u1ECDc ngay")))), articles.map((a, i) => {
    if (articles.length > 2 && i === 2) return null;
    return /* @__PURE__ */ React.createElement("div", { key: i, className: "col-md-6 col-lg-3" }, /* @__PURE__ */ React.createElement("div", { className: "card h-100 border-0 shadow-sm rounded-4 overflow-hidden news-card" }, /* @__PURE__ */ React.createElement("div", { className: "position-relative" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        src: a.urlToImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
        className: "card-img-top",
        style: { height: 200, objectFit: "cover" },
        alt: ""
      }
    ), /* @__PURE__ */ React.createElement("span", { className: "position-absolute top-0 start-0 m-3 badge bg-warning text-dark" }, a.source?.name ?? "News")), /* @__PURE__ */ React.createElement("div", { className: "card-body d-flex flex-column" }, /* @__PURE__ */ React.createElement("small", { className: "text-muted mb-2" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-calendar-event me-1" }), a.publishedAt ? String(a.publishedAt).slice(0, 10) : "\u2014"), /* @__PURE__ */ React.createElement("h5", { className: "card-title fw-bold mb-3" }, a.title), /* @__PURE__ */ React.createElement("p", { className: "card-text text-muted small" }, (a.description ?? "").slice(0, 120), "..."), /* @__PURE__ */ React.createElement("div", { className: "mt-auto pt-3 border-top d-flex justify-content-between align-items-center" }, /* @__PURE__ */ React.createElement("span", { className: "small fw-bold" }, a.author ?? "\u2014"), a.url && /* @__PURE__ */ React.createElement("a", { href: a.url, target: "_blank", rel: "noreferrer", className: "text-decoration-none fw-bold small text-warning" }, "Xem th\xEAm ", /* @__PURE__ */ React.createElement("i", { className: "bi bi-arrow-right" }))))));
  })), /* @__PURE__ */ React.createElement("style", null, `
        .news-card { transition: all 0.3s ease; }
        .news-card:hover { transform: translateY(-5px); box-shadow: 0 1rem 3rem rgba(0,0,0,.175)!important; }
      `));
}
export {
  NewsPage
};
