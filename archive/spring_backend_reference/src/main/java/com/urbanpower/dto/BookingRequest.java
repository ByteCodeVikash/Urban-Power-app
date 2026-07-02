package com.urbanpower.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
@Data
public class BookingRequest {

    @NotNull
    private Long userId;

    @NotNull
    private Long serviceId;

    @NotNull
    @FutureOrPresent
    private LocalDate bookingDate;

    @NotBlank
    private String timeSlot;

    @NotBlank
    private String address;

    private String notes;
}
