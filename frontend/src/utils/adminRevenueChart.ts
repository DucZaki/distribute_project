export function createRevenueLineChart(
  canvas: HTMLCanvasElement,
  labels: string[],
  data: number[],
): any {
  const ChartCtor = window.Chart
  if (!ChartCtor) return null
  return new ChartCtor(canvas.getContext('2d')!, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Doanh thu (₫)',
        data,
        borderColor: '#FECF2F',
        backgroundColor: 'rgba(254, 207, 47, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: labels.length > 20 ? 2 : 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#FECF2F',
        pointBorderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: { raw: unknown }) => ` ${Number(ctx.raw).toLocaleString('vi-VN')} ₫`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.06)' },
          ticks: {
            callback: (v: string | number) => `${Number(v).toLocaleString('vi-VN')} ₫`,
          },
        },
        x: {
          grid: { display: false },
          ticks: {
            maxTicksLimit: labels.length > 20 ? 12 : labels.length,
            maxRotation: 0,
            autoSkip: true,
          },
        },
      },
    },
  })
}

export function createTourPerformanceChart(
  canvas: HTMLCanvasElement,
  labels: string[],
  bookings: number[],
  revenues: number[],
): any {
  const ChartCtor = window.Chart
  if (!ChartCtor) return null
  return new ChartCtor(canvas.getContext('2d')!, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Lượt đặt (PAID)',
          data: bookings,
          backgroundColor: 'rgba(254, 207, 47, 0.85)',
          borderColor: '#FECF2F',
          borderWidth: 1,
          borderRadius: 8,
          yAxisID: 'y',
        },
        {
          label: 'Doanh thu (₫)',
          data: revenues,
          type: 'line',
          borderColor: '#212529',
          backgroundColor: 'rgba(33, 37, 41, 0.08)',
          borderWidth: 2,
          tension: 0.35,
          fill: false,
          pointRadius: 4,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#212529',
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: true, position: 'top', labels: { boxWidth: 12, font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: (ctx: { dataset: { yAxisID?: string }; raw: unknown }) => {
              if (ctx.dataset.yAxisID === 'y1') {
                return ` Doanh thu: ${Number(ctx.raw).toLocaleString('vi-VN')} ₫`
              }
              return ` Lượt đặt: ${ctx.raw}`
            },
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          title: { display: true, text: 'Lượt đặt' },
          ticks: { stepSize: 1, precision: 0 },
          grid: { color: 'rgba(0,0,0,0.06)' },
        },
        y1: {
          type: 'linear',
          position: 'right',
          beginAtZero: true,
          title: { display: true, text: 'Doanh thu (₫)' },
          grid: { drawOnChartArea: false },
          ticks: { callback: (v: string | number) => Number(v).toLocaleString('vi-VN') },
        },
      },
    },
  })
}
