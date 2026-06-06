/** Phân loại điểm đến trong nước theo vungMien từ API hoặc tên quen thuộc */
const DOMESTIC_REGIONS = ["việt nam", "viet nam", "vietnam", "trong nước", "miền bắc", "miền trung", "miền nam"];

const DESTINATION_IMAGES = {
  sapa: "/anh/diemden/sapa.jpg",
  "sa pa": "/anh/diemden/sapa.jpg",
  "hạ long": "/anh/diemden/halong.jpg",
  halong: "/anh/diemden/halong.jpg",
  "đà nẵng": "/anh/diemden/danang.jpg",
  "da nang": "/anh/diemden/danang.jpg",
  huế: "/anh/diemden/hue.jpg",
  hue: "/anh/diemden/hue.jpg",
  "phú quốc": "/anh/diemden/phuquoc.jpg",
  "phu quoc": "/anh/diemden/phuquoc.jpg",
  "nha trang": "/anh/diemden/nhatrang.jpg",
  "cần thơ": "/anh/diemden/cantho.jpg",
  "can tho": "/anh/diemden/cantho.jpg",
  "hà nội": "/anh/diemden/hanoi.jpg",
  hanoi: "/anh/diemden/hanoi.jpg",
  tokyo: "/anh/diemden/tokyo.jpg",
  seoul: "/anh/diemden/seoul.jpg",
  "bắc kinh": "/anh/diemden/backinh.jpg",
  "bac kinh": "/anh/diemden/backinh.jpg",
  "thượng hải": "/anh/diemden/thuonghai.jpg",
  "thuong hai": "/anh/diemden/thuonghai.jpg",
  "trương gia giới": "/anh/diemden/truonggiagioi.jpg",
  kyoto: "/anh/diemden/kyoto.jpg",
  osaka: "/anh/diemden/osaka.jpg",
};

const TOUR_CATEGORIES = [
  {
    id: "gia-dinh",
    label: "Tour gia đình",
    labelEn: "Family tours",
    icon: "bi-people-fill",
    keyword: "Family",
    desc: "Chuyến đi an toàn, phù hợp mọi thành viên",
  },
  {
    id: "trekking",
    label: "Trekking / mạo hiểm",
    labelEn: "Adventure",
    icon: "bi-mountain",
    keyword: "Trek",
    desc: "Khám phá thiên nhiên, trải nghiệm mạo hiểm",
  },
  {
    id: "nghi-duong",
    label: "Tour nghỉ dưỡng",
    labelEn: "Resort & relax",
    icon: "bi-umbrella-beach",
    keyword: "Resort",
    desc: "Biển xanh, resort sang trọng, thư giãn trọn vẹn",
  },
  {
    id: "ghep-doan",
    label: "Tour ghép đoàn",
    labelEn: "Group tours",
    icon: "bi-bus-front-fill",
    keyword: "Group",
    desc: "Tiết kiệm chi phí, giao lưu cùng đoàn",
  },
];

const HOTLINE = "+84 866147595";
const HOTLINE_TEL = "tel:+84866147595";

function normalizeKey(s) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function isDomesticDestination(dest) {
  const region = normalizeKey(dest?.vungMien ?? dest?.region ?? "");
  return DOMESTIC_REGIONS.some((r) => region.includes(normalizeKey(r)));
}

function destinationThumb(dest) {
  const fromApi = dest?.hinhAnh ?? dest?.image;
  if (fromApi) {
    if (fromApi.startsWith("http") || fromApi.startsWith("/")) return fromApi;
    return `/${fromApi.replace(/^\//, "")}`;
  }
  const key = normalizeKey(dest?.ten ?? dest?.name ?? "");
  for (const [k, path] of Object.entries(DESTINATION_IMAGES)) {
    if (key.includes(normalizeKey(k)) || normalizeKey(k).includes(key)) return path;
  }
  return "/anh/diemden/hanoi.jpg";
}

function splitDestinations(list) {
  const domestic = [];
  const international = [];
  for (const d of list ?? []) {
    if (isDomesticDestination(d)) domestic.push(d);
    else international.push(d);
  }
  domestic.sort((a, b) => (a.ten ?? "").localeCompare(b.ten ?? "", "vi"));
  international.sort((a, b) => (a.ten ?? "").localeCompare(b.ten ?? "", "vi"));
  return { domestic, international };
}

function tourCategoryLink(cat) {
  const params = new URLSearchParams();
  params.set("loai", cat.id);
  if (cat.keyword) params.set("keyword", cat.keyword);
  return `/tour?${params}`;
}

export {
  DESTINATION_IMAGES,
  HOTLINE,
  HOTLINE_TEL,
  TOUR_CATEGORIES,
  destinationThumb,
  isDomesticDestination,
  splitDestinations,
  tourCategoryLink,
};
