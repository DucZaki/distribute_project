import { useEffect, useRef, useState } from "react";
import {
  getDashboardDefaults,
  getDashboardKpis,
  getMonthlyRevenue,
} from "../../api/adminDashboard";
import { formatVnd } from "../../utils/format";
function AdminRevenuePage() {
  const [year, setYear] = useState(/* @__PURE__ */ new Date().getFullYear());
  const [years, setYears] = useState([]);
  const [total, setTotal] = useState(0);
  const chartRef = useRef(null);
  const inst = useRef(null);
  useEffect(() => {
    getDashboardDefaults()
      .then((r) => {
        setYears(r.data.years ?? []);
        setYear(r.data.currentYear ?? /* @__PURE__ */ new Date().getFullYear());
      })
      .catch(() => {});
    getDashboardKpis()
      .then((r) => setTotal(Number(r.data.totalRevenue ?? 0)))
      .catch(() => {});
  }, []);
  useEffect(() => {
    getMonthlyRevenue(year)
      .then((r) => {
        const ctx = chartRef.current?.getContext("2d");
        if (!ctx || !window.Chart) return;
        inst.current?.destroy?.();
        inst.current = new window.Chart(ctx, {
          type: "bar",
          data: {
            labels: r.data.labels,
            datasets: [
              {
                label: "Doanh thu",
                data: r.data.data,
                backgroundColor: "#FECF2F",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                ticks: {
                  callback: (v) =>
                    `${Number(v).toLocaleString("vi-VN")} \u20AB`,
                },
              },
            },
          },
        });
      })
      .catch(() => {});
    return () => inst.current?.destroy?.();
  }, [year]);
  return /* @__PURE__ */ React.createElement(
    "div",
    { className: "container-fluid px-0" },
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "d-flex justify-content-between align-items-center mb-4" },
      /* @__PURE__ */ React.createElement(
        "h2",
        { className: "fw-bold mb-0" },
        "B\xE1o c\xE1o doanh thu",
      ),
      /* @__PURE__ */ React.createElement(
        "select",
        {
          className: "form-select form-select-sm",
          style: { width: 140 },
          value: year,
          onChange: (e) => setYear(Number(e.target.value)),
        },
        (years.length ? years : [year, year - 1]).map((y) =>
          /* @__PURE__ */ React.createElement(
            "option",
            { key: y, value: y },
            "N\u0103m ",
            y,
          ),
        ),
      ),
    ),
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "card border-0 shadow-sm rounded-4 mb-4" },
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "card-body p-4" },
        /* @__PURE__ */ React.createElement(
          "h6",
          { className: "text-muted" },
          "T\u1ED5ng doanh thu (t\u1EA5t c\u1EA3 th\u1EDDi gian)",
        ),
        /* @__PURE__ */ React.createElement(
          "h2",
          { className: "fw-bold text-success" },
          formatVnd(total),
        ),
      ),
    ),
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "card border-0 shadow-sm rounded-4" },
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "card-body p-4", style: { height: 480 } },
        /* @__PURE__ */ React.createElement("canvas", { ref: chartRef }),
      ),
    ),
  );
}
export { AdminRevenuePage };
