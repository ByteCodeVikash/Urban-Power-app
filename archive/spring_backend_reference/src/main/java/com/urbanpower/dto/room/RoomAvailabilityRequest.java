package com.urbanpower.dto.room;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomAvailabilityRequest {
    @NotNull(message = "Room ID is required")
    private Long roomId;

    @NotNull(message = "Start date/time is required")
    private LocalDateTime startDate;

    @NotNull(message = "End date/time is required")
    private LocalDateTime endDate;

    private Long userId;

    @NotBlank(message = "Purpose is required")
    private String purpose;
}
