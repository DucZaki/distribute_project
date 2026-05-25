package com.ducnm.web.util;

public final class TourCodeUtil {

    private static final String PREFIX = "ZAKI";

    private TourCodeUtil() {}

    public static String format(Integer id) {
        return id != null ? PREFIX + id : PREFIX;
    }
}
