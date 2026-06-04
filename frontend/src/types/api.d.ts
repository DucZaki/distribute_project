export type ApiResponse<T> = {
  success: boolean
  message?: string
  data?: T
  error?: unknown
  timestamp?: string
}

export type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type UserSummary = {
  id: number
  email?: string
  hoTen?: string
  vaiTro?: string
  anhDaiDien?: string
}

export type ReviewItem = {
  id: number
  idChuyenDi: number
  idNguoiDung?: number
  hoTen?: string
  diem?: number
  noiDung?: string
  createdAt?: string
  tourTitle?: string
}

export type TourSummary = {
  id: number
  tieuDe?: string
  gia?: number
  hinhAnh?: string
  noiBat?: boolean
  averageRating?: number
  ratingCount?: number
  bookingCount?: number
  diemDon?: { ten?: string }
  diemDen?: { hinhAnh?: string; ten?: string }
}

export type DiemDenSummary = {
  id: number
  ten?: string
  vungMien?: string
  hinhAnh?: string
}

export type TourDetail = any
