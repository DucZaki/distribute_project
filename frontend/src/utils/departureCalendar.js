function getThreeMonthTabs(anchor = /* @__PURE__ */ new Date()) {
  let m = anchor.getMonth() + 1;
  let y = anchor.getFullYear();
  const tabs = [];
  for (let i = 0; i < 3; i++) {
    tabs.push({ month: m, year: y });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return tabs;
}
function resolveCalendarView(monthParam, yearParam, anchor = /* @__PURE__ */ new Date()) {
  const tabs = getThreeMonthTabs(anchor);
  if (monthParam >= 1 && monthParam <= 12 && yearParam > 0) {
    const allowed = tabs.some((t) => t.month === monthParam && t.year === yearParam);
    if (allowed) return { month: monthParam, year: yearParam };
  }
  return { ...tabs[0] };
}
export {
  getThreeMonthTabs,
  resolveCalendarView
};
