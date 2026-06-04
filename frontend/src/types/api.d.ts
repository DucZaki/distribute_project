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
