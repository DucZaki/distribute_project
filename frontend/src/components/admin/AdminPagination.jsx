function AdminPagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i);
  return /* @__PURE__ */ React.createElement("nav", { "aria-label": "Page navigation" }, /* @__PURE__ */ React.createElement("ul", { className: "pagination justify-content-center mt-4" }, /* @__PURE__ */ React.createElement("li", { className: `page-item ${page === 0 ? "disabled" : ""}` }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "page-link", disabled: page === 0, onClick: () => onPage(page - 1) }, "\xAB")), pages.map((i) => /* @__PURE__ */ React.createElement("li", { key: i, className: `page-item ${i === page ? "active" : ""}` }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "page-link", onClick: () => onPage(i) }, i + 1))), /* @__PURE__ */ React.createElement("li", { className: `page-item ${page >= totalPages - 1 ? "disabled" : ""}` }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "page-link",
      disabled: page >= totalPages - 1,
      onClick: () => onPage(page + 1)
    },
    "\xBB"
  ))));
}
export {
  AdminPagination
};
