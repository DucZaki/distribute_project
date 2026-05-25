package com.ducnm.payment.vnpay;

import com.ducnm.payment.config.VnPayProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Component
@RequiredArgsConstructor
public class VnPayUtil {

    private final VnPayProperties props;

    public String buildPaymentUrl(String txnRef, long amountVnd, String orderInfo, String clientIp) {
        if (props.getTmnCode() == null || props.getHashSecret() == null) {
            throw new IllegalStateException("VNPay not configured");
        }
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", props.getTmnCode());
        params.put("vnp_Amount", String.valueOf(amountVnd * 100));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", orderInfo);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", props.getReturnUrl());
        params.put("vnp_IpAddr", clientIp == null ? "127.0.0.1" : clientIp);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat fmt = new SimpleDateFormat("yyyyMMddHHmmss");
        params.put("vnp_CreateDate", fmt.format(cld.getTime()));
        cld.add(Calendar.MINUTE, 15);
        params.put("vnp_ExpireDate", fmt.format(cld.getTime()));

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<Map.Entry<String, String>> itr = params.entrySet().iterator();
        while (itr.hasNext()) {
            var e = itr.next();
            if (e.getValue() == null || e.getValue().isEmpty()) continue;
            hashData.append(e.getKey()).append('=')
                    .append(URLEncoder.encode(e.getValue(), StandardCharsets.US_ASCII));
            query.append(URLEncoder.encode(e.getKey(), StandardCharsets.US_ASCII)).append('=')
                    .append(URLEncoder.encode(e.getValue(), StandardCharsets.US_ASCII));
            if (itr.hasNext()) {
                hashData.append('&');
                query.append('&');
            }
        }
        String secureHash = hmacSHA512(props.getHashSecret(), hashData.toString());
        return props.getPayUrl() + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    public boolean verifySignature(Map<String, String> params, String vnpSecureHash) {
        if (vnpSecureHash == null || vnpSecureHash.isBlank()) return false;
        Map<String, String> copy = new TreeMap<>(params);
        copy.remove("vnp_SecureHash");
        copy.remove("vnp_SecureHashType");

        StringBuilder hashData = new StringBuilder();
        boolean first = true;
        for (Map.Entry<String, String> e : copy.entrySet()) {
            if (e.getValue() == null || e.getValue().isEmpty()) continue;
            if (!first) hashData.append('&');
            hashData.append(e.getKey()).append('=')
                    .append(URLEncoder.encode(e.getValue(), StandardCharsets.US_ASCII));
            first = false;
        }
        return hmacSHA512(props.getHashSecret(), hashData.toString()).equalsIgnoreCase(vnpSecureHash);
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
