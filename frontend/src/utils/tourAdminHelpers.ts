import type { DiemDenSummary } from '../api/adminTours'

const CHAU_LUC_OPTIONS = ['Trong nước', 'Châu Á', 'Châu Âu', 'Châu Mỹ'] as const

const ASIA_COUNTRIES = new Set([
  'Trung Quốc',
  'Nhật Bản',
  'Hàn Quốc',
  'Thái Lan',
  'Singapore',
])

const EUROPE_COUNTRIES = new Set(['Pháp', 'Đức', 'Anh', 'Ý', 'Tây Ban Nha'])
const AMERICA_COUNTRIES = new Set(['Mỹ', 'Canada', 'Brazil', 'Mexico'])

export function inferChauLuc(country?: string): string {
  if (!country || country === 'Việt Nam') return 'Trong nước'
  if (ASIA_COUNTRIES.has(country)) return 'Châu Á'
  if (EUROPE_COUNTRIES.has(country)) return 'Châu Âu'
  if (AMERICA_COUNTRIES.has(country)) return 'Châu Mỹ'
  return 'Châu Á'
}

export function countriesForChauLuc(chauLuc: string, destinations: DiemDenSummary[]): string[] {
  const set = new Set<string>()
  for (const d of destinations) {
    const country = d.vungMien?.trim()
    if (!country) continue
    if (chauLuc === 'Trong nước' && country === 'Việt Nam') set.add(country)
    else if (chauLuc !== 'Trong nước' && inferChauLuc(country) === chauLuc) set.add(country)
  }
  return Array.from(set).sort()
}

export function citiesForCountry(country: string, destinations: DiemDenSummary[]): DiemDenSummary[] {
  return destinations.filter((d) => d.vungMien === country).sort((a, b) => (a.ten ?? '').localeCompare(b.ten ?? '', 'vi'))
}

export function chauLucOptions() {
  return CHAU_LUC_OPTIONS
}

export function formatTourDate(iso?: string) {
  if (!iso) return '—'
  try {
    const d = new Date(iso.includes('T') ? iso : `${iso}T00:00:00`)
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return iso
  }
}

/** dd-MM-yyyy — tab Thông tin tour detail */
export function formatTourDateInfo(iso?: string) {
  if (!iso) return '—'
  const parts = formatTourDate(iso).split('/')
  if (parts.length === 3) return `${parts[0]}-${parts[1]}-${parts[2]}`
  return formatTourDate(iso)
}

export function linesToMoTa(text: string) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n')
}

export function moTaToLines(moTa?: string) {
  if (!moTa) return []
  return moTa.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
}

/** @deprecated use countriesForChauLuc */
export function groupDestinationsByRegion(destinations: DiemDenSummary[]) {
  const map = new Map<string, DiemDenSummary[]>()
  for (const d of destinations) {
    const region = d.vungMien?.trim() || 'Khác'
    if (!map.has(region)) map.set(region, [])
    map.get(region)!.push(d)
  }
  return map
}
