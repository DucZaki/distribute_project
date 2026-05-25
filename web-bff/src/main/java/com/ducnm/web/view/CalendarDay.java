package com.ducnm.web.view;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CalendarDay {
    private LocalDate date;
    private boolean isCurrentMonth;
    private double flightPrice;
    private boolean isSelected;
    private boolean isPast;
    private boolean hasDeparture;
    private Integer ngayKhoiHanhId;
}
