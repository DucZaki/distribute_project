/** Ba tháng lịch khởi hành: tháng hiện tại + 2 tháng tiếp theo (giống monolith). */
export function getThreeMonthTabs(anchor = new Date()): { month: number; year: number }[] {
  let m = anchor.getMonth() + 1
  let y = anchor.getFullYear()
  const tabs: { month: number; year: number }[] = []
  for (let i = 0; i < 3; i++) {
    tabs.push({ month: m, year: y })
    m += 1
    if (m > 12) {
      m = 1
      y += 1
    }
  }
  return tabs
}

/** Chỉ cho xem lịch trong 3 tháng trên; URL lạ thì về tháng đầu. */
export function resolveCalendarView(
  monthParam: number,
  yearParam: number,
  anchor = new Date(),
): { month: number; year: number } {
  const tabs = getThreeMonthTabs(anchor)
  if (monthParam >= 1 && monthParam <= 12 && yearParam > 0) {
    const allowed = tabs.some((t) => t.month === monthParam && t.year === yearParam)
    if (allowed) return { month: monthParam, year: yearParam }
  }
  return { ...tabs[0] }
}
