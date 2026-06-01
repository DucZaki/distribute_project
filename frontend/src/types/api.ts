export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  error?: unknown
  timestamp?: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface UserSummary {
  id: number
  email: string
  hoTen: string
  vaiTro: string
  anhDaiDien?: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: UserSummary
}

export interface DiemDenSummary {
  id: number
  ten: string
  hinhAnh?: string
  vungMien?: string
}

export interface TourSummary {
  id: number
  tieuDe: string
  gia: number
  hinhAnh?: string
  ngayKhoiHanh?: string
  noiBat?: boolean
  diemDen?: DiemDenSummary
  phuongTien?: { id: number; ten: string; loai?: string }
  diemDon?: { id: number; ten: string; diaChi?: string; thanhPho?: string }

  averageRating?: number
  ratingCount?: number
  bookingCount?: number
}

export interface NgayKhoiHanhDto {
  id: number
  ngayKhoiHanh: string
  availableSeats: number

  ngayKetThuc?: string
  soChoToiDa?: number
  soChoDaDat?: number
  giaOverride?: number
  trangThai?: string

  gioBayDi?: string
  gioDenDi?: string
  maChuyenBayDi?: string
  giaVeDi?: number
  gioBayVe?: string
  gioDenVe?: string
  maChuyenBayVe?: string
  giaVeVe?: number
}

export interface LichTrinhDto {
  id?: number
  ngayThu: number
  tieuDe: string
  moTa?: string
  hinhAnh?: string
  nghiDem?: string
  soBuaAn?: string
  hoatDongChinh?: string
  noiDungLines?: string[]
}

export interface TourDetail extends TourSummary {
  moTa?: string
  ngayKetThuc?: string
  highlight?: string
  diemDon?: { id: number; ten: string; diaChi?: string; thanhPho?: string }
  phuongTien?: { id: number; ten: string; loai?: string }
  noiLuuTru?: { id: number; ten: string }
  ngayKhoiHanhs?: NgayKhoiHanhDto[]
  lichTrinhs?: LichTrinhDto[]
  diemDons?: { id: number; ten: string; diaChi?: string; thanhPho?: string }[]
}

export interface BookingResponse {
  id: number
  idChuyenDi: number
  idNgayKhoiHanh: number
  soLuong: number
  createdAt: string
  trangThai: string
  hoTen: string
  email: string
  soDienThoai: string
  tongGia: number
  tienGiamGia?: number
  maCheckIn?: string
  checkedInAt?: string
}

export interface CheckInDetail {
  valid: boolean
  bookingId?: number
  tourId?: number
  scheduleId?: number
  hoTen?: string
  email?: string
  soDienThoai?: string
  tourTitle?: string
  soLuong?: number
  tongGia?: number
  trangThai?: string
  maCheckIn?: string
  checkedInAt?: string
  message?: string
}

export interface CheckInResult {
  bookingId: number
  hoTen: string
  tourTitle?: string
  soLuong: number
  checkedAt?: string
  firstTime: boolean
}

export interface CreateBookingRequest {
  idChuyenDi: number
  idNgayKhoiHanh: number
  idDiemDon?: number
  soLuong: number
  hoTen: string
  email: string
  soDienThoai: string
  maGiamGia?: string
  ghiChu?: string
}

export interface PaymentInitResponse {
  paymentId: number
  txnRef: string
  redirectUrl: string
}

export interface ReviewItem {
  id: number
  idChuyenDi: number
  tourTitle?: string
  idNguoiDung: number
  hoTen?: string
  anhDaiDien?: string
  diem: number
  noiDung: string
  createdAt?: string
}
