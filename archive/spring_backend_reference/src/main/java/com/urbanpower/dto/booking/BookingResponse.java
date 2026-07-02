package com.urbanpower.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingResponse {

    private Long bookingId;
    private String customerName;
    private String serviceName;
    private String bookingDate;
    private String timeSlot;
    private String address;
    private String status;
    private String partnerName;
}