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
}

export interface NgayKhoiHanhDto {
  id: number
  ngayKhoiHanh: string
  availableSeats: number
}

export interface LichTrinhDto {
  ngayThu: number
  tieuDe: string
  moTa?: string
}

export interface TourDetail extends TourSummary {
  moTa?: string
  ngayKetThuc?: string
  highlight?: string
  phuongTien?: { id: number; ten: string }
  noiLuuTru?: { id: number; ten: string }
  ngayKhoiHanhs?: NgayKhoiHanhDto[]
  lichTrinhs?: LichTrinhDto[]
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
}

export interface CreateBookingRequest {
  idChuyenDi: number
  idNgayKhoiHanh: number
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
  idNguoiDung: number
  diem: number
  noiDung: string
  createdAt?: string
}
