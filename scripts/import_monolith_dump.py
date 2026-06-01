#!/usr/bin/env python3
"""
Transform monolith booking_tour dump (Dump20260601.sql) into per-service seed SQL.
Usage: python scripts/import_monolith_dump.py [path-to-dump.sql]
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DUMP = ROOT / "scripts" / "Dump20260601.sql"
OUT_DIR = ROOT / "scripts" / "generated"


def parse_sql_values_blob(blob: str) -> list[list]:
    rows: list[list] = []
    i = 0
    n = len(blob)

    def skip_ws() -> None:
        nonlocal i
        while i < n and blob[i] in " \t\n\r":
            i += 1

    def parse_value():
        nonlocal i
        skip_ws()
        if i >= n:
            raise ValueError("unexpected end")
        if blob[i : i + 4] == "NULL":
            i += 4
            return None
        if blob[i] == "'":
            i += 1
            chars: list[str] = []
            while i < n:
                c = blob[i]
                if c == "\\" and i + 1 < n:
                    chars.append(blob[i + 1])
                    i += 2
                    continue
                if c == "'":
                    if i + 1 < n and blob[i + 1] == "'":
                        chars.append("'")
                        i += 2
                        continue
                    i += 1
                    break
                chars.append(c)
                i += 1
            return "".join(chars)
        # number
        start = i
        while i < n and blob[i] not in ",)":
            i += 1
        return blob[start:i].strip()

    while i < n:
        skip_ws()
        if i >= n or blob[i] == ")":
            break
        if blob[i] == "(":
            i += 1
            row: list = []
            while True:
                skip_ws()
                if i < n and blob[i] == ")":
                    i += 1
                    rows.append(row)
                    break
                row.append(parse_value())
                skip_ws()
                if i < n and blob[i] == ",":
                    i += 1
        elif blob[i] == ",":
            i += 1
        else:
            i += 1
    return rows


def extract_inserts(sql: str) -> dict[str, list[list]]:
    tables: dict[str, list[list]] = {}
    pattern = re.compile(
        r"INSERT\s+INTO\s+`?(\w+)`?\s+VALUES\s*(.+?);",
        re.IGNORECASE | re.DOTALL,
    )
    for match in pattern.finditer(sql):
        name = match.group(1)
        blob = match.group(2).strip()
        tables[name] = parse_sql_values_blob(blob)
    return tables


def esc(val) -> str:
    if val is None:
        return "NULL"
    if isinstance(val, (int, float)) and not isinstance(val, bool):
        return str(val)
    s = str(val).replace("\\", "\\\\").replace("'", "''")
    return f"'{s}'"


def sql_literal(val) -> str:
    if val is None or val == "NULL" or val == "":
        return "NULL"
    if isinstance(val, str) and re.fullmatch(r"-?\d+(\.\d+)?", val):
        return val
    return esc(val)


def map_status(raw: str | None) -> str:
    if raw is None:
        return "PENDING"
    u = str(raw).upper()
    if u in ("CONFIRMED", "PAID"):
        return "CONFIRMED"
    if u in ("FAILED", "CANCELLED", "REJECTED"):
        return "CANCELLED"
    if u == "PENDING" or u == "PENDING":
        return "PENDING"
    if raw == "Pending":
        return "PENDING"
    return "PENDING"


def icon_for_loai(loai: str | None) -> str:
    if not loai:
        return "bi-question"
    l = loai.lower()
    if "plane" in l or "ferry" in l:
        return "bi-airplane"
    if "bus" in l:
        return "bi-bus-front"
    return "bi-train-front"


def build_identity(rows: list[list]) -> list[str]:
    lines = [
        "-- Imported from monolith dump",
        "SET NAMES utf8mb4;",
        "SET FOREIGN_KEY_CHECKS = 0;",
        "DELETE FROM nguoi_dung WHERE id > 0;",
    ]
    for r in rows:
        uid, username, email, password, role, created, hoten, number, provider, avatar = (
            r + [None] * 10
        )[:10]
        if email is None and username and "@" in str(username):
            email = username
        if email is None:
            email = f"user{uid}@import.local"
        username = username or f"user{uid}"
        provider = (provider or "LOCAL").upper()
        enabled = 1
        lines.append(
            "INSERT INTO nguoi_dung (id, ten_dang_nhap, email, mat_khau, vai_tro, ngay_tao, ho_ten, number, provider, anh_dai_dien, enabled) VALUES ("
            f"{sql_literal(uid)}, {sql_literal(username)}, {sql_literal(email)}, {sql_literal(password)}, "
            f"{sql_literal(role)}, {sql_literal(created)}, {sql_literal(hoten)}, {sql_literal(number)}, "
            f"{sql_literal(provider)}, {sql_literal(avatar)}, {enabled}) "
            "ON DUPLICATE KEY UPDATE ho_ten=VALUES(ho_ten), number=VALUES(number), provider=VALUES(provider), anh_dai_dien=VALUES(anh_dai_dien);"
        )
    lines.append(
        "INSERT IGNORE INTO nguoi_dung (ten_dang_nhap, email, mat_khau, vai_tro, ho_ten, provider, enabled) "
        "VALUES ('admin', 'admin@bookingtour.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'Administrator', 'LOCAL', 1);"
    )
    lines.append("SET FOREIGN_KEY_CHECKS = 1;")
    return lines


def build_tour(t: dict[str, list[list]]) -> list[str]:
    lines = [
        "-- Imported from monolith dump",
        "SET NAMES utf8mb4;",
        "SET FOREIGN_KEY_CHECKS = 0;",
        "DELETE FROM lich_trinh;",
        "DELETE FROM ngay_khoi_hanh;",
        "DELETE FROM chuyen_di_diem_don;",
        "DELETE FROM chuyen_di;",
        "DELETE FROM noi_luu_tru;",
        "DELETE FROM phuong_tien;",
        "DELETE FROM diem_don;",
        "DELETE FROM diem_den;",
    ]

    quan_ly = {int(r[1]): (int(r[2]), int(r[3])) for r in t.get("quan_ly_cho", []) if len(r) >= 4}

    for r in t.get("diem_den", []):
        rid, ten, country, region, img, noibat = (r + [None] * 6)[:6]
        mo_ta = f"{country or ''} — {region or ''}".strip(" —")
        lines.append(
            f"INSERT INTO diem_den (id, ten, mo_ta, hinh_anh, vung_mien, noi_bat) VALUES "
            f"({sql_literal(rid)}, {sql_literal(ten)}, {sql_literal(mo_ta or None)}, {sql_literal(img)}, "
            f"{sql_literal(country)}, {sql_literal(noibat or 0)});"
        )

    for r in t.get("diem_don", []):
        rid, ten = r[0], r[1]
        lines.append(
            f"INSERT INTO diem_don (id, ten, dia_chi, thanh_pho) VALUES "
            f"({sql_literal(rid)}, {sql_literal(ten)}, {sql_literal(ten)}, {sql_literal(ten)});"
        )

    for r in t.get("phuong_tien", []):
        rid, loai, ten, _dest = (r + [None] * 4)[:4]
        lines.append(
            f"INSERT INTO phuong_tien (id, ten, loai, icon) VALUES "
            f"({sql_literal(rid)}, {sql_literal(ten)}, {sql_literal(loai)}, {sql_literal(icon_for_loai(str(loai)))});"
        )

    hang_map = {"Hotel": 4, "Resort": 5, "Homestay": 3, "Apartment": 3, "Inn": 2}
    for r in t.get("noi_luu_tru", []):
        rid, ten, loai, dia_chi = (r + [None] * 4)[:4]
        hang = hang_map.get(str(loai), 3)
        lines.append(
            f"INSERT INTO noi_luu_tru (id, ten, dia_chi, hang_sao, loai) VALUES "
            f"({sql_literal(rid)}, {sql_literal(ten)}, {sql_literal(dia_chi)}, {hang}, {sql_literal(loai)});"
        )

    tour_diem_don_pairs: set[tuple[int, int]] = set()
    for r in t.get("chuyen_di", []):
        (
            cid,
            tieu_de,
            mo_ta,
            gia,
            ngay_kh,
            ngay_kt,
            id_diem_den,
            id_pt,
            id_nlt,
            id_diem_don,
            hinh_anh,
            highlight,
            noi_bat,
        ) = (r + [None] * 13)[:13]
        id_diem_don_val = None if id_diem_don in (None, 0, "0") else id_diem_don
        if id_diem_don_val:
            tour_diem_don_pairs.add((int(cid), int(id_diem_don_val)))
        lines.append(
            f"INSERT INTO chuyen_di (id, tieu_de, mo_ta, gia, ngay_khoi_hanh, ngay_ket_thuc, "
            f"id_diem_den, id_phuong_tien, id_noi_luu_tru, id_diem_don, noi_bat, hinh_anh, highlight) VALUES ("
            f"{sql_literal(cid)}, {sql_literal(tieu_de)}, {sql_literal(mo_ta)}, {sql_literal(gia)}, "
            f"{sql_literal(ngay_kh)}, {sql_literal(ngay_kt)}, {sql_literal(id_diem_den)}, {sql_literal(id_pt)}, "
            f"{sql_literal(id_nlt)}, {sql_literal(id_diem_don_val)}, {sql_literal(noi_bat or 0)}, "
            f"{sql_literal(hinh_anh)}, {sql_literal(highlight)});"
        )

    for cid, did in sorted(tour_diem_don_pairs):
        lines.append(
            f"INSERT IGNORE INTO chuyen_di_diem_don (chuyen_di_id, diem_don_id) VALUES ({cid}, {did});"
        )

    for r in t.get("lich_trinh", []):
        lid, tour_id, ngay_thu, tieu_de = (r + [None] * 4)[:4]
        extra = r[4:] if len(r) > 4 else []
        mo_ta_parts = [str(x) for x in extra if x]
        mo_ta = "\n".join(mo_ta_parts) if mo_ta_parts else None
        lines.append(
            f"INSERT INTO lich_trinh (id, id_chuyen_di, ngay_thu, tieu_de, mo_ta) VALUES "
            f"({sql_literal(lid)}, {sql_literal(tour_id)}, {sql_literal(ngay_thu)}, "
            f"{sql_literal(tieu_de)}, {sql_literal(mo_ta)});"
        )

    for r in t.get("ngay_khoi_hanh", []):
        sid = r[0]
        tour_id = r[3] if len(r) > 3 else None
        ngay_kh = r[2] if len(r) > 2 else None
        so_max = r[4] if len(r) > 4 and r[4] not in (None, "NULL") else None
        so_dat = r[5] if len(r) > 5 and r[5] not in (None, "NULL") else 0
        ngay_kt = None
        for part in reversed(r):
            if isinstance(part, str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}", part):
                ngay_kt = part
                break
        gia_override = None
        for part in r[6:]:
            if part is not None and str(part).replace(".", "").isdigit() and float(part) > 10000:
                gia_override = part
                break
        if so_max is None and tour_id is not None:
            cap = quan_ly.get(int(tour_id))
            if cap:
                so_max, so_dat = cap[0], cap[1]
        if so_max is None:
            so_max = 30
        if so_dat is None:
            so_dat = 0
        lines.append(
            f"INSERT INTO ngay_khoi_hanh (id, id_chuyen_di, ngay_khoi_hanh, ngay_ket_thuc, "
            f"so_cho_toi_da, so_cho_da_dat, gia_override, trang_thai) VALUES ("
            f"{sql_literal(sid)}, {sql_literal(tour_id)}, {sql_literal(ngay_kh)}, {sql_literal(ngay_kt)}, "
            f"{sql_literal(so_max)}, {sql_literal(so_dat)}, {sql_literal(gia_override)}, 'ACTIVE');"
        )

    lines.append("SET FOREIGN_KEY_CHECKS = 1;")
    return lines


def build_booking(t: dict[str, list[list]]) -> list[str]:
    lines = [
        "-- Imported from monolith dump",
        "SET NAMES utf8mb4;",
        "SET FOREIGN_KEY_CHECKS = 0;",
        "DELETE FROM cho_xac_nhan;",
        "DELETE FROM dat_cho;",
        "DELETE FROM ma_giam_gia;",
    ]

    for r in t.get("ma_giam_gia", []):
        mid, ma, mo_ta, gia_tri, bat_dau, ket_thuc = (r + [None] * 6)[:6]
        lines.append(
            f"INSERT INTO ma_giam_gia (id, ma, mo_ta, loai, gia_tri, ngay_bat_dau, ngay_ket_thuc, active) VALUES ("
            f"{sql_literal(mid)}, {sql_literal(ma)}, {sql_literal(mo_ta)}, 'PERCENT', {sql_literal(gia_tri)}, "
            f"{sql_literal(bat_dau)}, {sql_literal(ket_thuc)}, 1);"
        )

    for r in t.get("dat_cho", []):
        bid = int(r[0])
        user_id = r[1]
        tour_id = int(r[2])
        so_luong = r[3]
        ngay_dat = r[4]
        status = map_status(r[5] if len(r) > 5 else None)
        schedule_id = r[6] if len(r) > 6 else None
        ghi_chu = r[7] if len(r) > 7 else None
        email = r[8] if len(r) > 8 else None
        ho_ten = r[10] if len(r) > 10 else None
        phone = r[11] if len(r) > 11 else None
        created_at = r[12] if len(r) > 12 else None
        tong_gia = r[13] if len(r) > 13 else None
        ma_check_in = f"CHK{bid:06d}{int(tour_id):04d}"
        payment_id = bid if status == "CONFIRMED" else "NULL"
        lines.append(
            f"INSERT INTO dat_cho (id, id_nguoi_dung, id_chuyen_di, id_ngay_khoi_hanh, so_luong, ngay_dat, "
            f"created_at, trang_thai, ho_ten, email, so_dien_thoai, ghi_chu, tong_gia, ma_check_in, payment_id) VALUES ("
            f"{sql_literal(bid)}, {sql_literal(user_id)}, {sql_literal(tour_id)}, {sql_literal(schedule_id)}, "
            f"{sql_literal(so_luong)}, {sql_literal(ngay_dat)}, {sql_literal(created_at)}, {sql_literal(status)}, "
            f"{sql_literal(ho_ten)}, {sql_literal(email)}, {sql_literal(phone)}, {sql_literal(ghi_chu)}, "
            f"{sql_literal(tong_gia)}, {sql_literal(ma_check_in)}, {payment_id});"
        )

    lines.append("SET FOREIGN_KEY_CHECKS = 1;")
    return lines


def build_review(t: dict[str, list[list]]) -> list[str]:
    lines = [
        "-- Imported from monolith dump",
        "SET NAMES utf8mb4;",
        "SET FOREIGN_KEY_CHECKS = 0;",
        "DELETE FROM danh_gia;",
        "DELETE FROM yeu_thich;",
        "DELETE FROM contact;",
    ]

    for r in t.get("danh_gia", []):
        rid, tour_id, user_id, diem, noi_dung, created = (r + [None] * 6)[:6]
        lines.append(
            f"INSERT INTO danh_gia (id, id_chuyen_di, id_nguoi_dung, diem, noi_dung, created_at) VALUES ("
            f"{sql_literal(rid)}, {sql_literal(tour_id)}, {sql_literal(user_id)}, {sql_literal(diem)}, "
            f"{sql_literal(noi_dung)}, {sql_literal(created)});"
        )

    for r in t.get("yeu_thich", []):
        rid, user_id, tour_id, created = (r + [None] * 4)[:4]
        lines.append(
            f"INSERT INTO yeu_thich (id, id_nguoi_dung, id_chuyen_di, created_at) VALUES ("
            f"{sql_literal(rid)}, {sql_literal(user_id)}, {sql_literal(tour_id)}, {sql_literal(created)});"
        )

    for r in t.get("contacts", []):
        (
            cid,
            _short,
            noi_dung,
            created,
            email,
            _uid,
            ho_ten,
            phone,
            trang_thai,
            tieu_de,
            _cat,
        ) = (r + [None] * 11)[:11]
        st = "NEW" if trang_thai in (None, "NEW") else str(trang_thai)
        lines.append(
            f"INSERT INTO contact (id, ho_ten, email, so_dien_thoai, tieu_de, noi_dung, trang_thai, created_at) VALUES ("
            f"{sql_literal(cid)}, {sql_literal(ho_ten)}, {sql_literal(email)}, {sql_literal(phone)}, "
            f"{sql_literal(tieu_de)}, {sql_literal(noi_dung)}, {sql_literal(st)}, {sql_literal(created)});"
        )

    lines.append("SET FOREIGN_KEY_CHECKS = 1;")
    return lines


def build_payment(t: dict[str, list[list]]) -> list[str]:
    lines = [
        "-- Synthetic payments for CONFIRMED bookings from monolith dump",
        "SET NAMES utf8mb4;",
        "SET FOREIGN_KEY_CHECKS = 0;",
        "DELETE FROM payment;",
    ]
    for r in t.get("dat_cho", []):
        status_raw = r[5] if len(r) > 5 else None
        if map_status(status_raw) != "CONFIRMED":
            continue
        bid = int(r[0])
        user_id = r[1]
        amount = r[13] if len(r) > 13 and r[13] not in (None, "NULL") else "0"
        created = r[12] if len(r) > 12 else None
        txn = f"IMP{bid:08d}"
        lines.append(
            f"INSERT INTO payment (id, booking_id, user_id, amount, currency, provider, txn_ref, status, created_at, paid_at) VALUES ("
            f"{sql_literal(bid)}, {sql_literal(bid)}, {sql_literal(user_id)}, {sql_literal(amount)}, 'VND', 'VNPAY', "
            f"{sql_literal(txn)}, 'SUCCESS', {sql_literal(created)}, {sql_literal(created)});"
        )
    lines.append("SET FOREIGN_KEY_CHECKS = 1;")
    return lines


def main() -> int:
    dump_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_DUMP
    if not dump_path.exists():
        print(f"Dump not found: {dump_path}", file=sys.stderr)
        return 1

    sql_text = dump_path.read_text(encoding="utf-8", errors="replace")
    tables = extract_inserts(sql_text)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    outputs = {
        "bookingtour_identity.sql": build_identity(tables.get("nguoi_dung", [])),
        "bookingtour_tour.sql": build_tour(tables),
        "bookingtour_booking.sql": build_booking(tables),
        "bookingtour_review.sql": build_review(tables),
        "bookingtour_payment.sql": build_payment(tables),
    }

    for name, lines in outputs.items():
        path = OUT_DIR / name
        path.write_text("\n".join(lines) + "\n", encoding="utf-8")
        print(f"Wrote {path} ({len(lines)} statements)")

    print("\nTable row counts from dump:")
    for k in sorted(tables):
        print(f"  {k}: {len(tables[k])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
