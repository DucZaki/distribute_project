export function priceRangeFromKhoangGia(khoangGia?: string | null) {
  if (!khoangGia) return { giaTu: undefined, giaDen: undefined }
  if (khoangGia === 'DUOI5') return { giaTu: undefined, giaDen: 5_000_000 }
  if (khoangGia === '5_10') return { giaTu: 5_000_000, giaDen: 10_000_000 }
  if (khoangGia === 'TREN10') return { giaTu: 10_000_000, giaDen: undefined }
  return { giaTu: undefined, giaDen: undefined }
}

export function parseNgayDi(raw?: string | null): string | undefined {
  if (!raw) return undefined
  if (raw.includes('/')) {
    const [d, m, y] = raw.split('/')
    if (d && m && y) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return raw
}
