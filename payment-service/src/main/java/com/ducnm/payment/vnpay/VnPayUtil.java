package com.ducnm.payment.vnpay;

import com.ducnm.payment.config.VnPayProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Build URL / verify HMAC giống {@code VNPayConfig} monolith Booking-Tour-main.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class VnPayUtil {

    private static final TimeZone VN_TZ = TimeZone.getTimeZone("Asia/Ho_Chi_Minh");
    private static final int EXPIRE_MINUTES = 30;

    private final VnPayProperties props;

    public String buildPaymentUrl(String txnRef, long amountVnd, String orderInfo, String clientIp) {
        if (props.getTmnCode() == null || props.getHashSecret().isBlank()) {
            throw new IllegalStateException("VNPay not configured");
        }

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", props.getTmnCode());
        params.put("vnp_Amount", String.valueOf(amountVnd * 100));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", sanitizeOrderInfo(orderInfo, txnRef));
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", props.getReturnUrl());
        params.put("vnp_IpAddr", normalizeIp(clientIp));

        Calendar cld = Calendar.getInstance(VN_TZ);
        SimpleDateFormat fmt = new SimpleDateFormat("yyyyMMddHHmmss");
        fmt.setTimeZone(VN_TZ);
        String createDate = fmt.format(cld.getTime());
        cld.add(Calendar.MINUTE, EXPIRE_MINUTES);
        String expireDate = fmt.format(cld.getTime());
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        log.info("VNPay pay txnRef={} amountVnd={} create={} expire={} returnUrl={}",
                txnRef, amountVnd, createDate, expireDate, props.getReturnUrl());

        return buildSignedUrl(params);
    }

    public boolean verifySignature(Map<String, String> params, String vnpSecureHash) {
        if (vnpSecureHash == null || vnpSecureHash.isBlank()) return false;
        Map<String, String> copy = new TreeMap<>(params);
        copy.remove("vnp_SecureHash");
        copy.remove("vnp_SecureHashType");
        return hmacSHA512(props.getHashSecret(), hashPayload(copy)).equalsIgnoreCase(vnpSecureHash);
    }

    /** Chỉ ASCII — tránh lỗi encode trên cổng sandbox. */
    public static String sanitizeOrderInfo(String orderInfo, String txnRef) {
        String raw = orderInfo == null || orderInfo.isBlank()
                ? "Donhang" + txnRef.split("_", 2)[0]
                : orderInfo;
        String normalized = Normalizer.normalize(raw, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^a-zA-Z0-9 ]", "")
                .trim();
        if (normalized.isEmpty()) {
            normalized = "Donhang" + txnRef.split("_", 2)[0];
        }
        return normalized.length() > 100 ? normalized.substring(0, 100) : normalized;
    }

    private String buildSignedUrl(Map<String, String> params) {
        List<String> fieldNames = new ArrayList<>();
        for (Map.Entry<String, String> e : params.entrySet()) {
            if (e.getValue() != null && !e.getValue().isEmpty()) {
                fieldNames.add(e.getKey());
            }
        }
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        for (int i = 0; i < fieldNames.size(); i++) {
            String name = fieldNames.get(i);
            String value = params.get(name);
            hashData.append(name).append('=').append(URLEncoder.encode(value, StandardCharsets.US_ASCII));
            query.append(URLEncoder.encode(name, StandardCharsets.US_ASCII)).append('=')
                    .append(URLEncoder.encode(value, StandardCharsets.US_ASCII));
            if (i < fieldNames.size() - 1) {
                hashData.append('&');
                query.append('&');
            }
        }
        String secureHash = hmacSHA512(props.getHashSecret(), hashData.toString());
        return props.getPayUrl() + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    private static String hashPayload(Map<String, String> sorted) {
        StringBuilder hashData = new StringBuilder();
        boolean first = true;
        for (Map.Entry<String, String> e : sorted.entrySet()) {
            if (e.getValue() == null || e.getValue().isEmpty()) continue;
            if (!first) hashData.append('&');
            hashData.append(e.getKey()).append('=')
                    .append(URLEncoder.encode(e.getValue(), StandardCharsets.US_ASCII));
            first = false;
        }
        return hashData.toString();
    }

    private static String normalizeIp(String ip) {
        if (ip == null || ip.isBlank()) return "127.0.0.1";
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) return "127.0.0.1";
        if (ip.contains(",")) return ip.split(",")[0].trim();
        return ip;
    }

    public static String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * hash.length);
            for (byte b : hash) sb.append(String.format("%02x", b & 0xff));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("HMAC error", e);
        }
    }
}
